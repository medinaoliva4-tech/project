import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { LogoMark } from "@/components/logo";
import { OnboardingForm } from "./form";

export default async function OnboardingPage() {
  const { profile } = await requireClient({ allowNotOnboarded: true });
  if (profile.onboarded) redirect("/");
  return (
    <main className="pt-safe mx-auto max-w-md px-6 pb-12">
      <div className="mt-8 flex items-center justify-between">
        <LogoMark size={40} />
        <span className="text-[13px] text-muted">Paso 1 de 2</span>
      </div>
      <h1 className="mt-8 text-[28px] font-bold leading-tight">Hey 👋 armemos tu perfil</h1>
      <p className="mt-2 text-[15px] text-muted">Tu coach ya te creó la cuenta. Cambia tu password y listo.</p>
      <OnboardingForm name={profile.full_name} />
    </main>
  );
}
