"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function updateRow(rowId: string, patch: Record<string, unknown>) {
  const supabase = await createClient();
  // RLS asegura que solo el dueño (o su coach) pueda tocar la fila.
  const { error } = await supabase.from("week_plan").update(patch).eq("id", rowId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setSessionDay(rowId: string, day: string | null) {
  await updateRow(rowId, { day });
}

export async function toggleSessionDone(rowId: string, done: boolean, today: string) {
  await updateRow(rowId, done ? { done_at: new Date().toISOString(), day: today } : { done_at: null });
}

export async function assignTodayAction(formData: FormData) {
  await setSessionDay(String(formData.get("rowId")), String(formData.get("today")));
}

export async function markDoneAction(formData: FormData) {
  await toggleSessionDone(
    String(formData.get("rowId")),
    formData.get("done") === "1",
    String(formData.get("today")),
  );
}
