import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { markDoneAction } from "@/app/(app)/actions";
import { addMealComment, saveHevyLinks } from "@/app/coach/actions";
import type { Profile } from "@/lib/auth";
import { requireCoach } from "@/lib/auth";
import { addDays, dayShort, shortDate, timeAgo, todayISO, weekDays, weekLabel, weekStartOf } from "@/lib/dates";
import { getMealFeed } from "@/lib/meals";
import { fmtNum, fmtSleep, getRecovery } from "@/lib/recovery";
import { SESSIONS, isRest, sessionDef } from "@/lib/sessions";
import { getWeekPlan } from "@/lib/week-plan";
import { DayPicker } from "@/components/day-picker";
import { MealFeed } from "@/components/meal-feed";
import { ResetPassword } from "@/components/reset-password";
import { Avatar, Bars, Card, Ring } from "@/components/ui";

const TABS = [
  { key: "resumen", label: "Resumen" },
  { key: "semana", label: "Semana" },
  { key: "comida", label: "Comida" },
  { key: "recovery", label: "Recovery" },
];

export default async function ClientDetail({ params, searchParams }: PageProps<"/coach/cliente/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? String(sp.tab) : "resumen";
  const { supabase, profile: coach } = await requireCoach();

  const { data: client } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("coach_id", coach.id)
    .maybeSingle<Profile>();
  if (!client) notFound();

  const today = todayISO(client.timezone);
  const weekStart = weekStartOf(today);
  const [plan, recovery] = await Promise.all([
    getWeekPlan(supabase, client.id, weekStart),
    getRecovery(supabase, client.id, addDays(today, -13)),
  ]);
  const done = plan.filter((p) => p.done_at).length;
  const latest = recovery.days.at(-1) ?? null;

  return (
    <main>
      <Link href="/coach" className="mt-2 inline-flex items-center gap-1 text-[14px] text-muted">
        <ChevronLeft size={16} /> Clientes
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Avatar url={client.avatar_url} name={client.full_name} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold leading-tight">{client.full_name}</h1>
          <p className="text-[14px] text-muted">
            {client.email} · {client.goal ?? "Sin objetivo"} · {client.weight_kg ? `${client.weight_kg} kg` : "— kg"}
          </p>
        </div>
        <ResetPassword clientId={client.id} />
      </div>

      <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/coach/cliente/${client.id}?tab=${t.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium ${
              tab === t.key ? "bg-accent text-black" : "bg-card text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-5">
        {tab === "resumen" && (
          <div className="grid gap-3 md:grid-cols-3">
            <Card>
              <p className="text-[14px] text-muted">Split · {weekLabel(weekStart)}</p>
              <p className="mt-2 text-[28px] font-bold">
                {done}/{plan.length}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-card-2">
                <div className="h-full bg-accent" style={{ width: `${(done / Math.max(plan.length, 1)) * 100}%` }} />
              </div>
            </Card>
            <Card>
              <p className="text-[14px] text-muted">Recovery (último)</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[28px] font-bold">{latest?.score ?? "—"}</p>
                <Ring value={latest?.score ?? 0} size={52} stroke={7} />
              </div>
              <p className="text-[13px] text-muted">
                {recovery.status ? `Sync ${timeAgo(recovery.status.last_synced_at)}` : "Fitbit no conectado"}
              </p>
            </Card>
            <Card>
              <p className="text-[14px] text-muted">Sueño · pasos (último)</p>
              <p className="mt-2 text-[22px] font-bold">{fmtSleep(latest?.sleep_minutes ?? null)}</p>
              <p className="text-[14px] text-muted">{fmtNum(latest?.steps)} pasos</p>
            </Card>
          </div>
        )}

        {tab === "semana" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-[16px] font-semibold">Semana {weekLabel(weekStart)}</p>
              <p className="text-[13px] text-muted">Asígnale días o márcalas. Se resetea el domingo.</p>
              <ul className="mt-3 divide-y divide-line">
                {plan.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 py-3">
                    <form action={markDoneAction}>
                      <input type="hidden" name="rowId" value={row.id} />
                      <input type="hidden" name="today" value={today} />
                      <input type="hidden" name="done" value={row.done_at ? "0" : "1"} />
                      <button
                        className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                          row.done_at ? "border-accent bg-accent text-black" : "border-line"
                        }`}
                        aria-label="Hecho"
                      >
                        {row.done_at && <Check size={16} strokeWidth={3} />}
                      </button>
                    </form>
                    <span className="flex-1">{sessionDef(row.session).name}</span>
                    <DayPicker rowId={row.id} value={row.day} days={weekDays(weekStart)} today={today} />
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <p className="text-[16px] font-semibold">Links de Hevy</p>
              <p className="text-[13px] text-muted">
                Pega el link de la rutina en Hevy (Compartir rutina). Es lo que abre el botón &quot;Abrir Hevy&quot;.
              </p>
              <form action={saveHevyLinks.bind(null, client.id)} className="mt-3 space-y-2">
                {[{ key: "default", name: "General" }, ...SESSIONS.filter((s) => !isRest(s.key))].map((s) => (
                  <label key={s.key} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-[14px] text-muted">{s.name}</span>
                    <input
                      name={s.key}
                      defaultValue={client.hevy_links?.[s.key] ?? ""}
                      placeholder="https://hevy.com/routine/..."
                      className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-[14px] outline-none focus:border-accent"
                    />
                  </label>
                ))}
                <button className="mt-2 w-full rounded-xl bg-accent py-2.5 font-semibold text-black">Guardar links</button>
              </form>
            </Card>
          </div>
        )}

        {tab === "comida" && <CoachMeals clientId={client.id} tz={client.timezone} today={today} />}

        {tab === "recovery" && (
          <div className="space-y-3">
            {!recovery.status && <Card className="text-muted">El cliente aún no conecta su Fitbit.</Card>}
            {recovery.status?.last_error === "reconnect" && (
              <Card className="text-warn">La conexión expiró: pídele que reconecte desde su app.</Card>
            )}
            <Card>
              <p className="text-[14px] text-muted">Recovery · 14 días</p>
              <div className="mt-3 overflow-x-auto">
                <Bars
                  values={Array.from({ length: 14 }, (_, i) =>
                    recovery.days.find((d) => d.date === addDays(today, i - 13))?.score ?? null,
                  )}
                  labels={Array.from({ length: 14 }, (_, i) => dayShort(addDays(today, i - 13))[0])}
                  height={90}
                />
              </div>
            </Card>
            <Card className="overflow-x-auto !p-0">
              <table className="w-full text-left text-[14px]">
                <thead className="text-muted">
                  <tr className="border-b border-line">
                    {["Día", "Score", "Sueño", "HRV", "FC rep", "Pasos"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...recovery.days].reverse().map((d) => (
                    <tr key={d.date} className="border-b border-line/60">
                      <td className="px-4 py-2.5">{shortDate(d.date)}</td>
                      <td className="px-4 py-2.5 font-semibold text-accent">{d.score ?? "—"}</td>
                      <td className="px-4 py-2.5">{fmtSleep(d.sleep_minutes)}</td>
                      <td className="px-4 py-2.5">{d.hrv_ms != null ? Math.round(d.hrv_ms) : "—"}</td>
                      <td className="px-4 py-2.5">{d.resting_hr != null ? Math.round(d.resting_hr) : "—"}</td>
                      <td className="px-4 py-2.5">{fmtNum(d.steps)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

async function CoachMeals({ clientId, tz, today }: { clientId: string; tz: string; today: string }) {
  const { supabase } = await requireCoach();
  const days = await getMealFeed(supabase, clientId, tz, 21);
  if (!days.length) return <Card className="text-muted">Sin fotos en las últimas 3 semanas.</Card>;
  return (
    <div className="max-w-xl">
      <MealFeed
        days={days}
        tz={tz}
        today={today}
        renderActions={(p) => (
          <form action={addMealComment} className="mt-3 flex gap-2">
            <input type="hidden" name="photoId" value={p.id} />
            <input
              name="body"
              placeholder="Comentar..."
              required
              className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-[14px] outline-none focus:border-accent"
            />
            <button className="shrink-0 rounded-xl bg-accent px-4 text-[14px] font-semibold text-black">Enviar</button>
          </form>
        )}
      />
    </div>
  );
}
