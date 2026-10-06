import Image from "next/image";
import Link from "next/link";
import { Camera, Footprints, HeartPulse, Moon, Play } from "lucide-react";
import { assignTodayAction } from "./actions";
import { firstName, requireClient } from "@/lib/auth";
import { addDays, dayNumber, hoursAgoISO, dayShort, todayISO, weekDays, weekStartOf } from "@/lib/dates";
import { SPLITS, exercisesBySplit, splitCover, type SplitKey } from "@/lib/exercises";
import { hevyLink } from "@/lib/hevy";
import { fmtNum, fmtSleep, getRecovery } from "@/lib/recovery";
import { isRest, pickToday, sessionDef } from "@/lib/sessions";
import { getWeekPlan } from "@/lib/week-plan";
import { Avatar, Bars, Card, CardHeader, Pill, Ring, Screen, SectionTitle } from "@/components/ui";

export default async function HomePage() {
  const { supabase, profile } = await requireClient();
  const today = todayISO(profile.timezone);
  const weekStart = weekStartOf(today);
  const days = weekDays(weekStart);

  const [plan, recovery, { count: photosToday }] = await Promise.all([
    getWeekPlan(supabase, profile.id, weekStart),
    getRecovery(supabase, profile.id, addDays(today, -6)),
    supabase
      .from("meal_photos")
      .select("id", { count: "exact", head: true })
      .eq("client_id", profile.id)
      .gte("taken_at", hoursAgoISO(24)),
  ]);

  const pick = pickToday(plan, today);
  const doneDays = new Set(plan.filter((r) => r.done_at && r.day).map((r) => r.day));
  const doneCount = plan.filter((r) => r.done_at).length;

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const byDate = new Map(recovery.days.map((d) => [d.date, d]));
  const todayRec = byDate.get(today) ?? recovery.days.at(-1) ?? null;
  const connected = Boolean(recovery.status);

  return (
    <Screen>
      {/* Header */}
      <header className="pt-2">
        <Link href="/perfil" className="flex w-fit items-center gap-3">
          <Avatar url={profile.avatar_url} name={profile.full_name} size={60} />
          <div className="leading-tight">
            <p className="text-[17px] font-semibold">Hey, {firstName(profile.full_name)}</p>
            <p className="text-[16px] text-white/90">Welcome back!</p>
          </div>
        </Link>
      </header>

      {/* Semana */}
      <div className="mt-6 grid grid-cols-7 text-center">
        {days.map((d) => {
          const isToday = d === today;
          return (
            <div
              key={d}
              className={`mx-auto flex w-11 flex-col items-center gap-1.5 rounded-xl py-2 ${
                isToday ? "bg-accent text-black" : "text-white/70"
              }`}
            >
              <span className="text-[14px]">{dayShort(d)}</span>
              <span className={`text-[16px] ${isToday ? "font-semibold" : ""}`}>{dayNumber(d)}</span>
              <span
                className={`h-1 w-1 rounded-full ${
                  doneDays.has(d) ? (isToday ? "bg-black" : "bg-accent") : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Hoy te toca */}
      <SectionTitle>Hoy te toca</SectionTitle>
      <TodayCard pick={pick} today={today} hevyLinks={profile.hevy_links} />

      {/* Recent activity */}
      <SectionTitle>Recent Activity</SectionTitle>
      <Card href="/recovery">
        <CardHeader icon={<Footprints size={20} className="text-accent" />} title="Steps" />
        {connected ? (
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[18px] font-medium">{fmtNum(todayRec?.steps)} steps</p>
              <p className="mt-1 text-[14px] text-muted">
                {todayRec?.distance_m != null ? (todayRec.distance_m / 1000).toFixed(2) : "—"} km
                {" | "}
                {fmtNum(todayRec?.calories)} kcal
              </p>
            </div>
            <Bars
              values={last7.map((d) => byDate.get(d)?.steps ?? null)}
              labels={last7.map((d) => dayShort(d)[0])}
              height={56}
            />
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[14px] text-muted">Conecta tu Fitbit para ver pasos, sueño y recovery.</p>
            <Pill className="shrink-0">Conectar</Pill>
          </div>
        )}
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card href="/recovery">
          <CardHeader icon={<HeartPulse size={20} className="text-accent" />} title="Recovery" />
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[17px] font-medium">
              {todayRec?.score ?? "—"}
              <span className="text-[13px] text-muted"> /100</span>
            </p>
            <Ring value={todayRec?.score ?? 0} size={48} stroke={7} />
          </div>
        </Card>
        <Card href="/recovery">
          <CardHeader icon={<Moon size={20} className="text-beige" />} title="Sueño" />
          <div className="mt-5 flex items-center justify-between">
            <p className="text-[17px] font-medium">{fmtSleep(todayRec?.sleep_minutes ?? null)}</p>
            <Ring value={todayRec?.sleep_minutes ?? 0} max={480} size={48} stroke={7} color="var(--color-beige)" />
          </div>
        </Card>
      </div>

      {/* Comida */}
      <Card href="/comida" className="mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft">
              <Camera size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-[16px] font-medium">Sube tu comida</p>
              <p className="text-[13px] text-muted">
                {photosToday ? `${photosToday} foto${photosToday > 1 ? "s" : ""} hoy` : "Tu coach la revisa"}
              </p>
            </div>
          </div>
          <Pill>Subir</Pill>
        </div>
      </Card>

      {/* Tu split (Trending Plans) */}
      <SectionTitle
        action={
          <span className="text-[13px] text-muted">
            {doneCount}/{plan.length} esta semana
          </span>
        }
      >
        Tu split
      </SectionTitle>
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5">
        {SPLITS.map((s) => {
          const cover = splitCover(s.key);
          return (
            <Link
              key={s.key}
              href={`/train/split/${s.key}`}
              className="relative aspect-[3/2] w-[85%] shrink-0 snap-start overflow-hidden rounded-[18px] bg-card"
            >
              {cover && (
                <Image src={cover} alt={s.name} fill sizes="80vw" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="text-[18px] font-semibold">{s.name}</p>
                  <p className="text-[14px] text-white/85">
                    {exercisesBySplit(s.key).length} ejercicios · {s.tagline}
                  </p>
                </div>
                <Pill className="shrink-0">Ver</Pill>
              </div>
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}

function TodayCard({
  pick,
  today,
  hevyLinks,
}: {
  pick: ReturnType<typeof pickToday>;
  today: string;
  hevyLinks: Record<string, string>;
}) {
  if (pick.kind === "complete") {
    return (
      <Card>
        <p className="text-[18px] font-semibold">Semana completa 🔥</p>
        <p className="mt-1 text-[14px] text-muted">
          Hiciste todo tu split. El domingo se resetea para la siguiente.
        </p>
      </Card>
    );
  }

  const { row } = pick;
  const def = sessionDef(row.session);
  const rest = isRest(row.session);
  const href = rest ? "/train/descanso" : `/train/split/${def.split}`;
  const count = rest ? 0 : exercisesBySplit(def.split as SplitKey).length;

  const cover = rest ? null : splitCover(def.split as SplitKey);

  return (
    <div
      className={`relative overflow-hidden rounded-[18px] bg-card p-5 ${
        cover ? "flex min-h-[260px] flex-col justify-end" : ""
      }`}
    >
      {cover && (
        <>
          <Image src={cover} alt={def.name} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" />
        </>
      )}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-2xl" />
      <div className="relative">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
          {pick.kind === "assigned" && "Asignado para hoy"}
          {pick.kind === "suggested" && "Siguiente en tu split"}
          {pick.kind === "done" && "Hecho hoy ✓"}
        </p>
        <p className="mt-1 text-[28px] font-bold leading-tight">{def.name}</p>
        <p className={`mt-1 text-[14px] ${cover ? "text-white/80" : "text-muted"}`}>
          {rest ? "Recupera: camina, movilidad y duerme bien" : `${count} ejercicios`}
        </p>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-black"
        >
          <Play size={14} fill="currentColor" />
          {rest ? "Ver tips" : "Ver ejercicios"}
        </Link>
        {!rest && (
          <a
            href={hevyLink(hevyLinks, row.session)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-[14px] font-semibold text-black"
          >
            Abrir Hevy
          </a>
        )}
        {pick.kind === "suggested" && (
          <form action={assignTodayAction}>
            <input type="hidden" name="rowId" value={row.id} />
            <input type="hidden" name="today" value={today} />
            <button className="rounded-full border border-white/30 bg-black/30 px-4 py-2 text-[14px] font-medium backdrop-blur">
              Hacerlo hoy
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
