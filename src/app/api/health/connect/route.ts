import { NextResponse, type NextRequest } from "next/server";
import { isGoogleHealthConfigured } from "@/lib/env";
import { authUrl } from "@/lib/google-health";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const back = req.nextUrl.searchParams.get("back") === "onboarding" ? "onboarding" : "recovery";
  if (!isGoogleHealthConfigured()) {
    return NextResponse.redirect(new URL(`/recovery?error=no_config`, req.url));
  }

  const state = `${crypto.randomUUID()}.${back}`;
  const res = NextResponse.redirect(authUrl(state, `${siteUrl(req)}/api/health/callback`));
  res.cookies.set("gh_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
