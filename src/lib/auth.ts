import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: "coach" | "client";
  coach_id: string | null;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  goal: string | null;
  weight_kg: number | null;
  timezone: string;
  hevy_links: Record<string, string>;
  onboarded: boolean;
  created_at: string;
};

export const getMe = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) return null;
  return { supabase, user, profile };
});

export async function requireClient({ allowNotOnboarded = false } = {}) {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.profile.role === "coach") redirect("/coach");
  if (!me.profile.onboarded && !allowNotOnboarded) redirect("/onboarding");
  return me;
}

export async function requireCoach() {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.profile.role !== "coach") redirect("/");
  return me;
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";
