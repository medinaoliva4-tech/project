import { Activity, Footprints, HeartPulse, Moon } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { addDays, dayShort, timeAgo, todayISO } from "@/lib/dates";
import { fmtNum, fmtSleep, getRecovery, scoreLabel } from "@/lib/recovery";
import { HealthSync } from "@/components/health-sync";
import { Bars, Card, Ring, Screen, SectionTitle } from "@/components/ui";

const ERRORS: Record<string, string> = {
  not_linked:
    "Primero abre la app Google Health (o Fitbit) en tu cel e inicia sesión con tu cuenta de Google. Luego vuelve a conectar.",
  denied: "No diste permiso. Sin eso no podemos leer tu sueño y recovery.",
  no_config: "La conexión con Google Health aún no está configurada. Avísale a tu coach.",
};

export default async function RecoveryPage({ searchParams }: PageProps<"/recovery">) {
  const sp = await searchParams;
  const { supabase, profile } = await requireClient();
  const today = todayISO(profile.timezone);
  const { days, status } = await getRecovery(supabase, profile.id, addDays(today, -13));
  const error = typeof sp.error === "string" ? ERRORS[sp.error] ?? "No se pudo conectar. Intenta de nuevo." : null;

  if (!status || status.last_error === "reconnect") {
    return (
      <Screen>
        <h1 className="pt-2 text-[28px] font-bold">Recovery</h1>
        {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-[14px] text-red-300">{error}</p>}
        <Card className="mt-5 text-center">
          <div className="mx-auto mt-2 grid h-16 w-16 place-items-center rounded-full bg-accent-soft">
            <HeartPulse size={30} className="text-accent" />
          </div>
          <p className="mt-4 text-[20px] font-semibold">
            {status ? "Reconecta tu Fitbit" : "Conecta tu Fitbit"}
          </p>
          <p className="mx-auto mt-2 max-w-xs text-[14px] text-muted">
            Leemos tu sueño, HRV, frecuencia cardiaca en reposo y pasos para calcular tu recovery diario.
            Tu coach también lo ve.
          </p>
          <a
            href="/api/health/connect"
            className="mt-5 block rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-black"
          >
            Conectar con Google
          </a>
          <p className="mt-3 text-[12px] text-muted">
            Fitbit ahora funciona con tu cuenta de Google (Google Health).
          </p>
        </Card>
      </Screen>
    );
  }

  const byDate = new Map(days.map((d) => [d.date, d]));
  const latest = byDate.get(today) ?? days.at(-1) ?? null;
  const prev = latest ? byDate.get(addDays(latest.date, -1)) : null;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const labels = last7.map((d) => dayShort(d)[0]);

  const delta = (a: number | null | undefined, b: number | null | undefined, unit = "") => {
    if (a == null || b == null) return null;
    const diff = Math.round(a - b);
    return `${diff >= 0 ? "▲ +" : "▼ "}${diff}${unit}`;
  };

  return (
    <Screen>
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-[28px] font-bold">Recovery</h1>
        <HealthSync lastSyncedAt={status.last_synced_at} />
      </div>
      <p className="text-[13px] text-muted">Sync {timeAgo(status.last_synced_at)}</p>

      <div className="mt-6 flex flex-col items-center">
        <Ring value={latest?.score ?? 0} size={200} stroke={16}>
          <div className="text-center">
            <p className="text-[52px] font-bold leading-none">{latest?.score ?? "—"}</p>
            <p className="mt-1 text-[13px] text-muted">de 100</p>
          </div>
        </Ring>
        <p className="mt-4 text-[18px] font-semibold">{scoreLabel(latest?.score ?? null)}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          {
            icon: <Moon size={18} className="text-beige" />,
            label: "Sueño",
            value: fmtSleep(latest?.sleep_minutes ?? null),
            d: delta(latest?.sleep_minutes, prev?.sleep_minutes, "m"),
          },
          {
            icon: <Activity size={18} className="text-accent" />,
            label: "HRV",
            value: latest?.hrv_ms != null ? `${Math.round(latest.hrv_ms)} ms` : "—",
            d: delta(latest?.hrv_ms, prev?.hrv_ms),
          },
          {
            icon: <HeartPulse size={18} className="text-accent" />,
            label: "Reposo",
            value: latest?.resting_hr != null ? `${Math.round(latest.resting_hr)} bpm` : "—",
            d: delta(latest?.resting_hr, prev?.resting_hr),
          },
        ].map((m) => (
          <Card key={m.label} className="!p-3">
            <div className="flex items-center gap-1.5 text-[13px] text-muted">
              {m.icon}
              {m.label}
            </div>
            <p className="mt-2 text-[17px] font-semibold">{m.value}</p>
            {m.d && <p className="text-[12px] text-muted">{m.d}</p>}
          </Card>
        ))}
      </div>

      <SectionTitle>Últimos 7 días</SectionTitle>
      <Card>
        <p className="text-[14px] text-muted">Recovery</p>
        <div className="mt-3 flex justify-center">
          <Bars values={last7.map((d) => byDate.get(d)?.score ?? null)} labels={labels} height={80} />
        </div>
      </Card>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[14px] text-muted">Sueño</p>
          <div className="mt-3">
            <Bars
              values={last7.map((d) => byDate.get(d)?.sleep_minutes ?? null)}
              labels={labels}
              height={56}
              color="bg-beige"
              fluid
            />
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 text-[14px] text-muted">
            <Footprints size={14} /> Pasos
          </div>
          <p className="mt-1 text-[17px] font-semibold">{fmtNum(latest?.steps)}</p>
          <p className="text-[12px] text-muted">
            {latest?.distance_m != null ? (latest.distance_m / 1000).toFixed(1) : "—"} km ·{" "}
            {fmtNum(latest?.calories)} kcal
          </p>
        </Card>
      </div>

      {status.last_error && (
        <p className="mt-4 rounded-2xl bg-card p-3 text-[12px] text-muted">Último error: {status.last_error}</p>
      )}
    </Screen>
  );
}
