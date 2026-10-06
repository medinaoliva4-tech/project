import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { syncUser } from "@/lib/google-health";
import { createAdminClient } from "@/lib/supabase/server";

export const maxDuration = 300;

/** Vercel Cron diario: sincroniza a todos los conectados (de uno en uno). */
export async function GET(req: NextRequest) {
  if (!env.cronSecret || req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data } = await admin.from("health_connections").select("user_id");
  const results: Record<string, boolean> = {};
  for (const { user_id } of data ?? []) {
    const r = await syncUser(admin, user_id);
    results[user_id] = r.ok;
  }
  return NextResponse.json({ ok: true, synced: Object.keys(results).length, results });
}
