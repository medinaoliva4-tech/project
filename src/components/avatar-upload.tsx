"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";

export function AvatarUpload({ userId, url, name }: { userId: string; url: string | null; name: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={() => ref.current?.click()} className="relative" disabled={busy} aria-label="Cambiar foto">
      <Avatar url={url} name={name} size={88} />
      <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-accent text-black">
        <Camera size={16} />
      </span>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </button>
  );
}
