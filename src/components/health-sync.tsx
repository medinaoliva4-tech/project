"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Sincroniza al abrir si la data tiene más de 1h, y con el botón ↻. */
export function HealthSync({ lastSyncedAt }: { lastSyncedAt: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function sync() {
    setBusy(true);
    try {
      await fetch("/api/health/sync", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const stale = !lastSyncedAt || Date.now() - new Date(lastSyncedAt).getTime() > 3600e3;
    if (stale) fetch("/api/health/sync", { method: "POST" }).then(() => router.refresh());
  }, [lastSyncedAt, router]);

  return (
    <button
      onClick={sync}
      disabled={busy}
      className="grid h-10 w-10 place-items-center rounded-full bg-card"
      aria-label="Sincronizar"
    >
      <RefreshCw size={18} className={busy ? "animate-spin text-accent" : ""} />
    </button>
  );
}
