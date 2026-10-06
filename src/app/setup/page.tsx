export const dynamic = "force-dynamic";

import { isSupabaseConfigured } from "@/lib/env";
import { LogoMark } from "@/components/logo";

export default function SetupPage() {
  const ok = isSupabaseConfigured();
  return (
    <main className="pt-safe mx-auto max-w-md px-6 py-16 text-center">
      <LogoMark size={72} className="mx-auto" />
      <h1 className="mt-6 text-[24px] font-bold">{ok ? "Todo listo ✅" : "Setup pendiente"}</h1>
      <p className="mt-2 text-[15px] text-muted">
        {ok
          ? "Supabase ya está conectado."
          : "Faltan las variables de Supabase en Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). Revisa el README."}
      </p>
    </main>
  );
}
