import { NextResponse, type NextRequest } from "next/server";
import { exchangeCode, getIdentity, HealthError, syncUser } from "@/lib/google-health";
import { siteUrl } from "@/lib/site";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const state = params.get("state") ?? "";
  const back = state.endsWith(".onboarding") ? "/onboarding/listo" : "/recovery";
  const fail = (error: string) =>
    NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(error)}`, req.url));

  if (!state || state !== req.cookies.get("gh_state")?.value) return fail("state");
  if (params.get("error")) return fail("denied");
  const code = params.get("code");
  if (!code) return fail("code");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const tokens = await exchangeCode(code, `${siteUrl(req)}/api/health/callback`);
    await getIdentity(tokens.access_token); // detecta ACCOUNT_NOT_LINKED temprano

    const admin = createAdminClient();
    const { error } = await admin.from("health_connections").upsert({
      user_id: user.id,
      provider: "google_health",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope ?? null,
      last_error: null,
    });
    if (error) throw error;

    await syncUser(admin, user.id);
  } catch (e) {
    if (e instanceof HealthError && e.code === "not_linked") return fail("not_linked");
    console.error("health callback", e);
    return fail("oauth");
  }

  const res = NextResponse.redirect(new URL(`${back}?connected=1`, req.url));
  res.cookies.delete("gh_state");
  return res;
}
