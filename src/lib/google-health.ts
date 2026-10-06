import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, todayISO } from "@/lib/dates";
import { env } from "@/lib/env";

// Google Health API (reemplazo del Fitbit Web API, que se apaga el 30 Oct 2026).
// Docs: https://developers.google.com/health
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://health.googleapis.com/v4/users/me";

export const HEALTH_SCOPES = [
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
  "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
];

export const SYNC_DAYS = 14; // total-calories y heart-rate aceptan máx 14 días por request

export class HealthError extends Error {
  constructor(
    message: string,
    public code: "reconnect" | "not_linked" | "api",
  ) {
    super(message);
  }
}

export function authUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: HEALTH_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params}`;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      ...body,
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as TokenResponse;
  if (!res.ok || json.error) {
    if (json.error === "invalid_grant") {
      throw new HealthError("La conexión expiró, vuelve a conectar", "reconnect");
    }
    throw new HealthError(json.error_description || json.error || "Error de OAuth", "api");
  }
  return json;
}

export const exchangeCode = (code: string, redirectUri: string) =>
  tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri });

async function api<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.includes("ACCOUNT_NOT_LINKED")) {
      throw new HealthError(
        "Abre la app Google Health (o Fitbit) e inicia sesión con tu cuenta de Google para enlazarla",
        "not_linked",
      );
    }
    if (res.status === 401) throw new HealthError("Sesión expirada", "reconnect");
    throw new HealthError(`Google Health ${res.status}: ${text.slice(0, 200)}`, "api");
  }
  return res.json() as Promise<T>;
}

export const getIdentity = (token: string) =>
  api<{ healthUserId: string; legacyUserId?: string }>(token, "/identity");

// ─────────────── Fetchers ───────────────

type CivilDate = { year: number; month: number; day: number };
const toCivil = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return { date: { year, month, day }, time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 } };
};
const civilToIso = (d: CivilDate) =>
  `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

type RollUp = {
  rollupDataPoints?: ({
    civilStartTime: { date: CivilDate };
  } & Record<string, unknown>)[];
};

async function dailyRollUp(token: string, dataType: string, from: string, toExclusive: string) {
  const json = await api<RollUp>(token, `/dataTypes/${dataType}/dataPoints:dailyRollUp`, {
    method: "POST",
    body: JSON.stringify({
      range: { start: toCivil(from), end: toCivil(toExclusive) },
      windowSizeDays: 1,
    }),
  });
  return json.rollupDataPoints ?? [];
}

async function listAll<T>(token: string, path: string, filter: string) {
  const out: T[] = [];
  let pageToken = "";
  for (let i = 0; i < 10; i++) {
    const q = new URLSearchParams({ filter });
    if (pageToken) q.set("pageToken", pageToken);
    const json = await api<{ dataPoints?: T[]; nextPageToken?: string }>(token, `${path}?${q}`);
    out.push(...(json.dataPoints ?? []));
    pageToken = json.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return out;
}

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

type Daily = {
  steps?: number | null;
  distance_m?: number | null;
  calories?: number | null;
  sleep_minutes?: number | null;
  hrv_ms?: number | null;
  resting_hr?: number | null;
};

/** Trae todo y lo regresa por fecha. Cada métrica falla de forma independiente (consentimiento parcial). */
export async function fetchDaily(token: string, from: string, toExclusive: string) {
  const days = new Map<string, Daily>();
  const put = (date: string, patch: Daily) => days.set(date, { ...days.get(date), ...patch });
  const errors: string[] = [];
  const safe = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      if (e instanceof HealthError && e.code !== "api") throw e;
      errors.push(`${name}: ${e instanceof Error ? e.message : e}`);
    }
  };

  await Promise.all([
    safe("steps", async () => {
      for (const p of await dailyRollUp(token, "steps", from, toExclusive)) {
        const s = p.steps as { countSum?: string } | undefined;
        if (s) put(civilToIso(p.civilStartTime.date), { steps: num(s.countSum) });
      }
    }),
    safe("distance", async () => {
      for (const p of await dailyRollUp(token, "distance", from, toExclusive)) {
        const d = p.distance as { millimetersSum?: string } | undefined;
        if (d) put(civilToIso(p.civilStartTime.date), { distance_m: Math.round((num(d.millimetersSum) ?? 0) / 1000) });
      }
    }),
    safe("calories", async () => {
      for (const p of await dailyRollUp(token, "total-calories", from, toExclusive)) {
        const c = p.totalCalories as { kcalSum?: number } | undefined;
        if (c) put(civilToIso(p.civilStartTime.date), { calories: Math.round(num(c.kcalSum) ?? 0) });
      }
    }),
    safe("sleep", async () => {
      type Sleep = {
        sleep: {
          interval: { endTime: string; endUtcOffset?: string };
          metadata?: { mainSleep?: boolean; nap?: boolean };
          summary?: { minutesAsleep?: string };
        };
      };
      const points = await listAll<Sleep>(
        token,
        "/dataTypes/sleep/dataPoints:reconcile",
        `sleep.interval.civil_end_time >= "${from}" AND sleep.interval.civil_end_time < "${toExclusive}"`,
      );
      const totals = new Map<string, number>();
      for (const p of points) {
        if (p.sleep.metadata?.nap) continue;
        // El sueño cuenta para el día en que despiertas (hora local)
        const offsetSec = Number((p.sleep.interval.endUtcOffset ?? "0s").replace("s", "")) || 0;
        const local = new Date(new Date(p.sleep.interval.endTime).getTime() + offsetSec * 1000);
        const date = local.toISOString().slice(0, 10);
        totals.set(date, (totals.get(date) ?? 0) + (num(p.sleep.summary?.minutesAsleep) ?? 0));
      }
      for (const [date, min] of totals) put(date, { sleep_minutes: min });
    }),
    safe("hrv", async () => {
      type Hrv = { dailyHeartRateVariability: { date: CivilDate; averageHeartRateVariabilityMilliseconds?: number } };
      const points = await listAll<Hrv>(
        token,
        "/dataTypes/daily-heart-rate-variability/dataPoints",
        `daily_heart_rate_variability.date >= "${from}" AND daily_heart_rate_variability.date < "${toExclusive}"`,
      );
      for (const p of points) {
        const v = p.dailyHeartRateVariability;
        put(civilToIso(v.date), { hrv_ms: num(v.averageHeartRateVariabilityMilliseconds) });
      }
    }),
    safe("resting_hr", async () => {
      type Rhr = { dailyRestingHeartRate: { date: CivilDate; beatsPerMinute?: string } };
      const points = await listAll<Rhr>(
        token,
        "/dataTypes/daily-resting-heart-rate/dataPoints",
        `daily_resting_heart_rate.date >= "${from}" AND daily_resting_heart_rate.date < "${toExclusive}"`,
      );
      for (const p of points) {
        const v = p.dailyRestingHeartRate;
        put(civilToIso(v.date), { resting_hr: num(v.beatsPerMinute) });
      }
    }),
  ]);

  return { days, errors };
}

// ─────────────── Score ───────────────

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * Recovery score 0–100 (propio, tipo Whoop/Fitbit Readiness):
 * sueño vs 8h (40%), HRV vs tu baseline (35%), FC reposo vs tu baseline (25%).
 * Si falta una métrica se reparte el peso entre las que hay.
 */
export function computeScores(byDate: Map<string, Daily>) {
  const dates = [...byDate.keys()].sort();
  const scores = new Map<string, number | null>();
  dates.forEach((date, i) => {
    const d = byDate.get(date)!;
    const prev = dates.slice(Math.max(0, i - 14), i).map((x) => byDate.get(x)!);
    const hrvBase = avg(prev.map((p) => p.hrv_ms).filter((v): v is number => v != null));
    const rhrBase = avg(prev.map((p) => p.resting_hr).filter((v): v is number => v != null));

    const parts: [number, number][] = [];
    if (d.sleep_minutes != null) parts.push([clamp((d.sleep_minutes / 480) * 100), 0.4]);
    if (d.hrv_ms != null) parts.push([hrvBase ? clamp(70 + (d.hrv_ms / hrvBase - 1) * 150) : 70, 0.35]);
    if (d.resting_hr != null) parts.push([rhrBase ? clamp(70 - (d.resting_hr / rhrBase - 1) * 250) : 70, 0.25]);

    const w = parts.reduce((a, [, x]) => a + x, 0);
    scores.set(date, w ? Math.round(parts.reduce((a, [s, x]) => a + s * x, 0) / w) : null);
  });
  return scores;
}

// ─────────────── Sync ───────────────

type Connection = {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
};

async function validToken(admin: SupabaseClient, conn: Connection) {
  if (new Date(conn.expires_at).getTime() - 60_000 > Date.now()) return conn.access_token;
  if (!conn.refresh_token) throw new HealthError("Vuelve a conectar", "reconnect");
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: conn.refresh_token });
  await admin
    .from("health_connections")
    .update({
      access_token: t.access_token,
      refresh_token: t.refresh_token ?? conn.refresh_token,
      expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(),
    })
    .eq("user_id", conn.user_id);
  return t.access_token;
}

/** Sincroniza los últimos 14 días de un usuario. Usa el admin client (service role). */
export async function syncUser(admin: SupabaseClient, userId: string) {
  const [{ data: conn }, { data: profile }] = await Promise.all([
    admin
      .from("health_connections")
      .select("user_id, access_token, refresh_token, expires_at")
      .eq("user_id", userId)
      .maybeSingle<Connection>(),
    admin.from("profiles").select("timezone").eq("id", userId).single(),
  ]);
  if (!conn) return { ok: false as const, error: "No conectado" };

  const today = todayISO(profile?.timezone);
  const from = addDays(today, -(SYNC_DAYS - 1));
  const toExclusive = addDays(today, 1);

  try {
    const token = await validToken(admin, conn);
    const { days, errors } = await fetchDaily(token, from, toExclusive);

    // Baseline: junta lo que ya tenemos guardado de antes para el score
    const { data: history } = await admin
      .from("recovery_daily")
      .select("date, sleep_minutes, hrv_ms, resting_hr")
      .eq("client_id", userId)
      .gte("date", addDays(from, -14))
      .lt("date", from);
    const all = new Map<string, Daily>();
    for (const h of history ?? []) all.set(h.date, h);
    for (const [d, v] of days) all.set(d, v);
    const scores = computeScores(all);

    const rows = [...days.entries()].map(([date, v]) => ({
      client_id: userId,
      date,
      steps: v.steps ?? null,
      distance_m: v.distance_m ?? null,
      calories: v.calories ?? null,
      sleep_minutes: v.sleep_minutes ?? null,
      hrv_ms: v.hrv_ms ?? null,
      resting_hr: v.resting_hr ?? null,
      score: scores.get(date) ?? null,
      updated_at: new Date().toISOString(),
    }));
    if (rows.length) {
      const { error } = await admin.from("recovery_daily").upsert(rows, { onConflict: "client_id,date" });
      if (error) throw new HealthError(error.message, "api");
    }

    await admin
      .from("health_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        last_error: errors.length === 6 ? errors.join(" | ").slice(0, 500) : null,
      })
      .eq("user_id", userId);
    return { ok: true as const, days: rows.length, errors };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = e instanceof HealthError ? e.code : "api";
    await admin
      .from("health_connections")
      .update({ last_error: code === "reconnect" ? "reconnect" : msg.slice(0, 500) })
      .eq("user_id", userId);
    return { ok: false as const, error: msg, code };
  }
}
