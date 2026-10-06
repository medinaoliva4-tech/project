import type { NextRequest } from "next/server";

/** URL pública de la app (para redirect_uri de OAuth). */
export function siteUrl(req: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
}
