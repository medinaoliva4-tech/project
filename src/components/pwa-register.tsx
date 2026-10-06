"use client";

import { useEffect, useState } from "react";

/** Registra el SW y avisa cuando hay versión nueva. */
export function PwaRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        sw?.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) setWaiting(sw);
        });
      });
      // Revisa updates al volver a la app
      const check = () => document.visibilityState === "visible" && reg.update();
      document.addEventListener("visibilitychange", check);
    });
  }, []);

  if (!waiting) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2 px-4 py-3 shadow-xl">
      <span className="text-sm text-beige">Hay una versión nueva 🚀</span>
      <button
        onClick={() => waiting.postMessage("SKIP_WAITING")}
        className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-black"
      >
        Actualizar
      </button>
    </div>
  );
}
