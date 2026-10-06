"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(_: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "El password debe tener al menos 8 caracteres" };

  const { error: pwError } = await supabase.auth.updateUser({ password });
  if (pwError && !pwError.message.toLowerCase().includes("different")) {
    return { error: pwError.message };
  }

  const weight = Number(String(formData.get("weight") ?? "").replace(",", "."));
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      goal: String(formData.get("goal") ?? "") || null,
      weight_kg: Number.isFinite(weight) && weight > 0 ? weight : null,
      timezone: String(formData.get("timezone") ?? "") || "America/Mexico_City",
      onboarded: true,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  redirect("/onboarding/listo");
}
