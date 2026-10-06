import { HeartPulse } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { timeAgo } from "@/lib/dates";
import { AvatarUpload } from "@/components/avatar-upload";
import { InstallHint } from "@/components/install-hint";
import { LogoutButton } from "@/components/logout-button";
import { Card, Screen, SectionTitle } from "@/components/ui";
import { PasswordForm, ProfileForm } from "./forms";

export default async function PerfilPage() {
  const { supabase, profile } = await requireClient();
  const { data: health } = await supabase
    .from("health_status")
    .select("last_synced_at, last_error")
    .eq("user_id", profile.id)
    .maybeSingle();

  return (
    <Screen>
      <h1 className="pt-2 text-[28px] font-bold">Perfil</h1>
      <div className="mt-6 flex flex-col items-center">
        <AvatarUpload userId={profile.id} url={profile.avatar_url} name={profile.full_name} />
        <p className="mt-3 text-[20px] font-semibold">{profile.full_name}</p>
        <p className="text-[14px] text-muted">{profile.email}</p>
      </div>

      <SectionTitle>Datos</SectionTitle>
      <ProfileForm name={profile.full_name} goal={profile.goal} weight={profile.weight_kg} />

      <SectionTitle>Fitbit</SectionTitle>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HeartPulse className="text-accent" />
            <div>
              <p className="font-medium">Google Health</p>
              <p className="text-[13px] text-muted">
                {!health
                  ? "No conectado"
                  : health.last_error === "reconnect"
                    ? "Hay que reconectar"
                    : `Sync ${timeAgo(health.last_synced_at)}`}
              </p>
            </div>
          </div>
          {health && health.last_error !== "reconnect" ? (
            <form action="/api/health/disconnect" method="post">
              <button className="rounded-full bg-card-2 px-4 py-2 text-[14px]">Desconectar</button>
            </form>
          ) : (
            <a href="/api/health/connect" className="rounded-full bg-accent px-4 py-2 text-[14px] font-semibold text-black">
              Conectar
            </a>
          )}
        </div>
      </Card>

      <SectionTitle>Seguridad</SectionTitle>
      <PasswordForm />

      <div className="mt-7">
        <InstallHint />
      </div>

      <LogoutButton className="mt-6 w-full rounded-2xl border border-line py-3.5 text-red-400" />
    </Screen>
  );
}
