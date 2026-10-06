import Link from "next/link";
import { AlertTriangle, Camera, Plus } from "lucide-react";
import { requireCoach } from "@/lib/auth";
import { hoursAgoISO, todayISO, weekStartOf } from "@/lib/dates";
import { isRest, pickToday, sessionDef, type WeekPlanRow } from "@/lib/sessions";
import { Avatar, Ring } from "@/components/ui";

export default async function CoachHome() {
  const { supabase, profile } = await requireCoach();
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, timezone, onboarded, created_at")
    .eq("coach_id", profile.id)
    .order("full_name");

  const list = clients ?? [];
  const ids = list.map((c) => c.id);
  const since48h = hoursAgoISO(48);
  const weekStarts = [...new Set(list.map((c) => weekStartOf(todayISO(c.timezone))))];

  const [{ data: plans }, { data: rec }, { data: photos }, { data: health }] = ids.length
    ? await Promise.all([
        supabase.from("week_plan").select("*").in("client_id", ids).in("week_start", weekStarts),
        supabase
          .from("recovery_daily")
          .select("client_id, date, score")
          .in("client_id", ids)
          .gte("date", weekStarts.sort()[0])
          .order("date", { ascending: false }),
        supabase.from("meal_photos").select("client_id, taken_at").in("client_id", ids).gte("taken_at", since48h),
        supabase.from("health_status").select("user_id, last_error").in("user_id", ids),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const rows = list.map((c) => {
    const today = todayISO(c.timezone);
    const ws = weekStartOf(today);
    const plan = (plans ?? []).filter((p) => p.client_id === c.id && p.week_start === ws) as WeekPlanRow[];
    const pick = plan.length ? pickToday(plan, today) : null;
    const score = (rec ?? []).find((r) => r.client_id === c.id && r.score != null)?.score ?? null;
    const photos48 = (photos ?? []).filter((p) => p.client_id === c.id).length;
    const h = (health ?? []).find((x) => x.user_id === c.id);
    const alerts = [
      !c.onboarded && "No ha entrado",
      c.onboarded && !h && "Sin Fitbit",
      h?.last_error === "reconnect" && "Reconectar Fitbit",
      score != null && score < 55 && "Recovery bajo",
      c.onboarded && photos48 === 0 && "Sin fotos 48h",
    ].filter(Boolean) as string[];
    return {
      ...c,
      done: plan.filter((p) => p.done_at).length,
      total: plan.length || 6,
      today: pick && pick.kind !== "complete" ? sessionDef(pick.row.session).name : pick ? "Semana completa" : "—",
      todayIsAssigned: pick?.kind === "assigned",
      restToday: pick && pick.kind !== "complete" && isRest(pick.row.session),
      score,
      photos48,
      alerts,
    };
  });

  return (
    <main>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold">Clientes</h1>
          <p className="text-[14px] text-muted">{list.length} activos</p>
        </div>
        <Link
          href="/coach/nuevo"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[14px] font-semibold text-black"
        >
          <Plus size={16} /> Nuevo cliente
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {rows.map((c) => (
          <Link
            key={c.id}
            href={`/coach/cliente/${c.id}`}
            className="rounded-[18px] bg-card p-4 transition hover:bg-card-2"
          >
            <div className="flex items-center gap-3">
              <Avatar url={c.avatar_url} name={c.full_name} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold">{c.full_name}</p>
                <p className="truncate text-[13px] text-muted">
                  Hoy: <span className={c.todayIsAssigned ? "text-accent" : ""}>{c.today}</span>
                  {c.todayIsAssigned ? "" : c.restToday ? "" : " (sugerido)"}
                </p>
              </div>
              <Ring value={c.score ?? 0} size={44} stroke={5}>
                <span className="text-[12px] font-semibold">{c.score ?? "—"}</span>
              </Ring>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[13px]">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-card-2">
                <div className="h-full bg-accent" style={{ width: `${(c.done / c.total) * 100}%` }} />
              </div>
              <span className="text-muted">
                {c.done}/{c.total}
              </span>
              <span className="flex items-center gap-1 text-muted">
                <Camera size={14} /> {c.photos48}
              </span>
            </div>
            {c.alerts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.alerts.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full bg-warn/10 px-2.5 py-1 text-[12px] text-warn"
                  >
                    <AlertTriangle size={12} /> {a}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        {!rows.length && (
          <div className="rounded-[18px] bg-card p-8 text-center text-muted md:col-span-2">
            Aún no tienes clientes. Crea el primero 👆
          </div>
        )}
      </div>
    </main>
  );
}
