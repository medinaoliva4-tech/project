import type { SupabaseClient } from "@supabase/supabase-js";

export type RecoveryDay = {
  date: string;
  steps: number | null;
  distance_m: number | null;
  calories: number | null;
  sleep_minutes: number | null;
  hrv_ms: number | null;
  resting_hr: number | null;
  score: number | null;
};

export type HealthStatus = {
  last_synced_at: string | null;
  last_error: string | null;
} | null;

export async function getRecovery(supabase: SupabaseClient, clientId: string, from: string) {
  const [{ data: days }, { data: status }] = await Promise.all([
    supabase
      .from("recovery_daily")
      .select("date, steps, distance_m, calories, sleep_minutes, hrv_ms, resting_hr, score")
      .eq("client_id", clientId)
      .gte("date", from)
      .order("date"),
    supabase
      .from("health_status")
      .select("last_synced_at, last_error")
      .eq("user_id", clientId)
      .maybeSingle(),
  ]);
  return { days: (days ?? []) as RecoveryDay[], status: status as HealthStatus };
}

export function scoreLabel(score: number | null) {
  if (score == null) return "Sin datos";
  if (score >= 75) return "Listo para darle";
  if (score >= 55) return "Normal, escucha a tu cuerpo";
  return "Bájale hoy";
}

export const fmtSleep = (min: number | null) =>
  min == null ? "—" : `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;

export const fmtNum = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-US").format(Math.round(n));
