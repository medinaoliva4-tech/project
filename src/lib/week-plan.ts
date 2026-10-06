import type { SupabaseClient } from "@supabase/supabase-js";
import { SESSIONS, sortPlan, type WeekPlanRow } from "@/lib/sessions";

/**
 * Trae el split de la semana. Si es una semana nueva (pasó el domingo),
 * crea las 6 filas vacías: así es como "se resetea" cada domingo.
 */
export async function getWeekPlan(
  supabase: SupabaseClient,
  clientId: string,
  weekStart: string,
): Promise<WeekPlanRow[]> {
  const select = () =>
    supabase
      .from("week_plan")
      .select("id, client_id, week_start, session, day, done_at")
      .eq("client_id", clientId)
      .eq("week_start", weekStart);

  const { data } = await select();
  if (data && data.length >= SESSIONS.length) return sortPlan(data as WeekPlanRow[]);

  await supabase.from("week_plan").upsert(
    SESSIONS.map((s) => ({ client_id: clientId, week_start: weekStart, session: s.key })),
    { onConflict: "client_id,week_start,session", ignoreDuplicates: true },
  );
  const { data: fresh } = await select();
  return sortPlan((fresh ?? []) as WeekPlanRow[]);
}
