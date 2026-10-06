import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const admin = createAdminClient();
  const { data } = await admin
    .from("health_connections")
    .select("refresh_token, access_token")
    .eq("user_id", user.id)
    .maybeSingle();
  if (data) {
    // Revoca en Google (best-effort) y borra los tokens
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: data.refresh_token ?? data.access_token }),
    }).catch(() => null);
    await admin.from("health_connections").delete().eq("user_id", user.id);
  }
  return NextResponse.redirect(new URL("/perfil", req.url), 303);
}
