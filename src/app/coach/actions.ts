"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/auth";
import { SESSIONS } from "@/lib/sessions";
import { createAdminClient } from "@/lib/supabase/server";

function tempPassword() {
  const words = ["Fuerza", "Split", "Power", "Gains", "Upper", "Lower", "Focus", "Grind"];
  const w = words[Math.floor(Math.random() * words.length)];
  return `${w}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export type NewClientState =
  | null
  | { error: string }
  | { ok: true; name: string; email: string; password: string };

export async function createClientAccount(_: NewClientState, formData: FormData): Promise<NewClientState> {
  const { profile: coach } = await requireCoach();
  const name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim() || tempPassword();
  if (!name || !email) return { error: "Nombre y email son obligatorios" };
  if (password.length < 8) return { error: "El password temporal debe tener mínimo 8 caracteres" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    // role/coach_id en app_metadata: el cliente no los puede cambiar
    app_metadata: { role: "client", coach_id: coach.id },
  });
  if (error) {
    return {
      error: error.message.includes("already") ? "Ya existe una cuenta con ese email" : error.message,
    };
  }
  revalidatePath("/coach");
  return { ok: true, name, email, password };
}

async function assertMyClient(clientId: string) {
  const { supabase, profile } = await requireCoach();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", clientId)
    .eq("coach_id", profile.id)
    .maybeSingle();
  if (!data) throw new Error("Cliente no encontrado");
  return { supabase, coach: profile };
}

export async function resetClientPassword(clientId: string) {
  await assertMyClient(clientId);
  const password = tempPassword();
  const { error } = await createAdminClient().auth.admin.updateUserById(clientId, { password });
  if (error) return { error: error.message };
  return { password };
}

export async function saveHevyLinks(clientId: string, formData: FormData) {
  const { supabase } = await assertMyClient(clientId);
  const links: Record<string, string> = {};
  for (const key of ["default", ...SESSIONS.filter((s) => !s.key.startsWith("rest")).map((s) => s.key)]) {
    const v = String(formData.get(key) ?? "").trim();
    if (v && /^https?:\/\//.test(v)) links[key] = v;
  }
  const { error } = await supabase.from("profiles").update({ hevy_links: links }).eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath(`/coach/cliente/${clientId}`);
}

export async function addMealComment(formData: FormData) {
  const { supabase, profile } = await requireCoach();
  const photoId = String(formData.get("photoId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase
    .from("meal_comments")
    .insert({ photo_id: photoId, author_id: profile.id, body });
  if (error) throw new Error(error.message);
  revalidatePath("/coach", "layout");
}

export async function addMealIdea(formData: FormData) {
  const { supabase, profile } = await requireCoach();
  const int = (k: string) => {
    const n = parseInt(String(formData.get(k) ?? ""), 10);
    return Number.isFinite(n) ? n : null;
  };
  const { error } = await supabase.from("meal_ideas").insert({
    coach_id: profile.id,
    meal_type: String(formData.get("meal_type")),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    kcal: int("kcal"),
    protein_g: int("protein_g"),
    carbs_g: int("carbs_g"),
    fat_g: int("fat_g"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/coach/ideas");
}

export async function deleteMealIdea(formData: FormData) {
  const { supabase } = await requireCoach();
  await supabase.from("meal_ideas").delete().eq("id", String(formData.get("id")));
  revalidatePath("/coach/ideas");
}
