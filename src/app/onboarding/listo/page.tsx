import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { InstallHint } from "@/components/install-hint";
import { LogoMark } from "@/components/logo";
import { btnGhost, btnPrimary } from "@/components/ui";

export default async function OnboardingDonePage({ searchParams }: PageProps<"/onboarding/listo">) {
  const sp = await searchParams;
  const { supabase, profile } = await requireClient();
  const { data: status } = await supabase
    .from("health_status")
    .select("user_id")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <main className="pt-safe mx-auto max-w-md px-6 pb-12">
      <div className="mt-8 flex items-center justify-between">
        <LogoMark size={40} />
        <span className="text-[13px] text-muted">Paso 2 de 2</span>
      </div>
      <h1 className="mt-8 text-[28px] font-bold leading-tight">Conecta tu Fitbit</h1>
      <p className="mt-2 text-[15px] text-muted">
        Así vemos tu sueño, HRV y pasos para tu recovery. Fitbit ahora entra con tu cuenta de Google.
      </p>

      <div className="mt-6 rounded-[18px] bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft">
            <HeartPulse className="text-accent" />
          </div>
          <div>
            <p className="font-semibold">Fitbit · Google Health</p>
            <p className="text-[13px] text-muted">{status ? "Conectado ✅" : "Sueño, HRV, FC reposo, pasos"}</p>
          </div>
        </div>
        {sp.error === "not_linked" && (
          <p className="mt-3 text-[13px] text-red-300">
            Primero abre la app Google Health/Fitbit e inicia sesión con Google. Luego vuelve a intentar.
          </p>
        )}
        {!status && (
          <a href="/api/health/connect?back=onboarding" className={`${btnPrimary} mt-4 block`}>
            Conectar
          </a>
        )}
      </div>

      <div className="mt-4">
        <InstallHint />
      </div>

      <Link href="/" className={`${status ? btnPrimary : btnGhost} mt-6 block`}>
        {status ? "Ir al Home" : "Hacerlo después"}
      </Link>
    </main>
  );
}
