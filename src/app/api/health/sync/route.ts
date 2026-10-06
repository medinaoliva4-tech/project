import { NextResponse } from "next/server";
import { syncUser } from "@/lib/google-health";
import { createAdminClient, createClient } from "@/lib/supabase/server";

/** Sync on-demand del usuario actual (al abrir Recovery o tocar ↻). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const result = await syncUser(createAdminClient(), user.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
