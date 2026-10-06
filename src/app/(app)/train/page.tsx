import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Dumbbell, ExternalLink } from "lucide-react";
import { markDoneAction } from "../actions";
import { requireClient } from "@/lib/auth";
import { todayISO, weekDays, weekLabel, weekStartOf } from "@/lib/dates";
import { SPLITS, exercisesBySplit, splitCover } from "@/lib/exercises";
import { hevyLink } from "@/lib/hevy";
import { isRest, sessionDef } from "@/lib/sessions";
import { getWeekPlan } from "@/lib/week-plan";
import { DayPicker } from "@/components/day-picker";
import { Card, Pill, Screen, SectionTitle } from "@/components/ui";

export default async function TrainPage() {
  const { supabase, profile } = await requireClient();
  const today = todayISO(profile.timezone);
  const weekStart = weekStartOf(today);
  const days = weekDays(weekStart);
  const plan = await getWeekPlan(supabase, profile.id, weekStart);
  const done = plan.filter((r) => r.done_at).length;

  return (
    <Screen>
      <h1 className="pt-2 text-[28px] font-bold">Train</h1>

      {/* Hevy */}
      <a
        href={hevyLink(profile.hevy_links)}
        target="_blank"
        rel="noreferrer"
        className="relative mt-4 block overflow-hidden rounded-[18px] bg-accent p-5 text-black active:scale-[0.99] transition"
      >
        <Dumbbell size={120} className="absolute -bottom-6 -right-4 rotate-[-20deg] opacity-15" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em]">Hevy</p>
        <p className="mt-1 text-[22px] font-bold leading-tight">Guarda tus entrenamientos</p>
        <p className="mt-1 max-w-[80%] text-[14px] text-black/75">
          Registra cada serie en Hevy. Ahí tu coach ve tus pesos y tu progreso.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[14px] font-semibold text-white">
          Abrir Hevy <ExternalLink size={14} />
        </span>
      </a>

      {/* Split de la semana */}
      <SectionTitle action={<span className="text-[13px] text-muted">reset: domingo</span>}>
        Tu semana
      </SectionTitle>
      <Card>
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-muted">{weekLabel(weekStart)}</span>
          <span className="font-medium">
            {done} de {plan.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-card-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(done / Math.max(plan.length, 1)) * 100}%` }}
          />
        </div>

        <ul className="mt-4 divide-y divide-line">
          {plan.map((row) => {
            const def = sessionDef(row.session);
            const href = isRest(row.session) ? "/train/descanso" : `/train/split/${def.split}`;
            return (
              <li key={row.id} className="flex items-center gap-3 py-3">
                <form action={markDoneAction}>
                  <input type="hidden" name="rowId" value={row.id} />
                  <input type="hidden" name="today" value={today} />
                  <input type="hidden" name="done" value={row.done_at ? "0" : "1"} />
                  <button
                    aria-label={row.done_at ? "Marcar pendiente" : "Marcar hecho"}
                    className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
                      row.done_at ? "border-accent bg-accent text-black" : "border-line"
                    }`}
                  >
                    {row.done_at && <Check size={16} strokeWidth={3} />}
                  </button>
                </form>
                <Link href={href} className="flex min-w-0 flex-1 items-center gap-1">
                  <span className={`truncate text-[16px] ${row.done_at ? "text-muted line-through" : ""}`}>
                    {def.name}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </Link>
                <DayPicker rowId={row.id} value={row.day} days={days} today={today} />
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Ejercicios por split */}
      <SectionTitle>Ejercicios por split</SectionTitle>
      <div className="flex flex-col gap-3">
        {SPLITS.map((s) => {
          const cover = splitCover(s.key);
          return (
            <Link
              key={s.key}
              href={`/train/split/${s.key}`}
              className="relative block aspect-[2/1] overflow-hidden rounded-[18px] bg-card active:scale-[0.99] transition"
            >
              {cover && <Image src={cover} alt={s.name} fill sizes="100vw" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="text-[19px] font-semibold">{s.name}</p>
                  <p className="text-[14px] text-white/85">
                    {exercisesBySplit(s.key).length} ejercicios · {s.tagline}
                  </p>
                </div>
                <Pill className="shrink-0">Ver</Pill>
              </div>
            </Link>
          );
        })}
        <Link
          href="/train/descanso"
          className="flex items-center justify-between rounded-[18px] bg-card p-4 active:scale-[0.99] transition"
        >
          <div>
            <p className="text-[17px] font-semibold">Días de descanso</p>
            <p className="text-[14px] text-muted">Qué hacer para recuperar al 100</p>
          </div>
          <ChevronRight className="text-muted" />
        </Link>
      </div>
    </Screen>
  );
}
