import type { SplitKey } from "@/lib/exercises";

export type SessionKey =
  | "full_body"
  | "arms_delts"
  | "upper"
  | "lower"
  | "rest_1"
  | "rest_2";

export type SessionDef = {
  key: SessionKey;
  name: string;
  split: SplitKey | "rest";
};

/** El split del coach: 4 sesiones + 2 descansos. Se acomodan libre en la semana. */
export const SESSIONS: SessionDef[] = [
  { key: "full_body", name: "Full Body", split: "full-body" },
  { key: "arms_delts", name: "Arms & Delts", split: "arms-delts" },
  { key: "upper", name: "Upper", split: "upper" },
  { key: "lower", name: "Lower", split: "lower" },
  { key: "rest_1", name: "Descanso", split: "rest" },
  { key: "rest_2", name: "Descanso", split: "rest" },
];

export const sessionDef = (key: string) =>
  SESSIONS.find((s) => s.key === key) ?? SESSIONS[0];

export const isRest = (key: string) => key.startsWith("rest");

export type WeekPlanRow = {
  id: string;
  client_id: string;
  week_start: string;
  session: SessionKey;
  day: string | null;
  done_at: string | null;
};

export type TodayPick =
  | { kind: "assigned"; row: WeekPlanRow }
  | { kind: "suggested"; row: WeekPlanRow }
  | { kind: "done"; row: WeekPlanRow }
  | { kind: "complete" };

const order = (key: string) => SESSIONS.findIndex((s) => s.key === key);

export function sortPlan(rows: WeekPlanRow[]) {
  return [...rows].sort((a, b) => order(a.session) - order(b.session));
}

/** ¿Qué te toca hoy? Lo asignado a hoy; si no, la siguiente sesión pendiente. */
export function pickToday(rows: WeekPlanRow[], today: string): TodayPick {
  const todays = sortPlan(rows.filter((r) => r.day === today));
  const pendingToday = todays.find((r) => !r.done_at);
  if (pendingToday) return { kind: "assigned", row: pendingToday };
  if (todays.length) return { kind: "done", row: todays[0] };

  const pending = sortPlan(rows.filter((r) => !r.done_at && !r.day));
  const training = pending.find((r) => !isRest(r.session));
  if (training) return { kind: "suggested", row: training };
  if (pending[0]) return { kind: "suggested", row: pending[0] };
  return { kind: "complete" };
}
