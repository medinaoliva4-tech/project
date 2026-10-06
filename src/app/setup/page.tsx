export const dynamic = "force-dynamic";

import { env, isSupabaseConfigured } from "@/lib/env";
import { LogoMark } from "@/components/logo";

// Solo dice si cada variable existe; nunca muestra valores secretos.
export default function SetupPage() {
  const ok = isSupabaseConfigured();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const checks = [
    { label: "Supabase URL", ok: Boolean(env.supabaseUrl) },
    { label: "Supabase anon key", ok: Boolean(env.supabaseAnonKey) },
    { label: "Supabase service role", ok: Boolean(env.supabaseServiceKey) },
    { label: "Cron secret", ok: Boolean(env.cronSecret) },
    {
      label: "Google Health client ID",
      ok: Boolean(env.googleClientId),
      // El client ID es público; mostramos el final para confirmar que es el de web
      detail: env.googleClientId ? `…${env.googleClientId.split("-")[1]?.slice(0, 8) ?? ""}` : undefined,
    },
    { label: "Google Health secret", ok: Boolean(env.googleClientSecret) },
    { label: "Site URL", ok: Boolean(siteUrl), detail: siteUrl || undefined },
  ];

  return (
    <main className="pt-safe mx-auto max-w-md px-6 py-16">
      <LogoMark size={72} className="mx-auto" />
      <h1 className="mt-6 text-center text-[24px] font-bold">{ok ? "Todo listo ✅" : "Setup pendiente"}</h1>
      <p className="mt-2 text-center text-[15px] text-muted">
        {ok ? "Supabase ya está conectado." : "Faltan variables en Vercel. Revisa el README."}
      </p>
      <ul className="mt-8 divide-y divide-line rounded-[18px] bg-card px-4">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between gap-3 py-3 text-[15px]">
            <span>{c.label}</span>
            <span className="truncate text-right text-muted">
              {c.detail && <span className="mr-2 text-[13px]">{c.detail}</span>}
              {c.ok ? "✅" : "❌"}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
