"use client";

import { signOut } from "@/app/auth-actions";

export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form
      action={signOut}
      onSubmit={async () => {
        // Borra páginas cacheadas por el service worker (cel compartido)
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => k.includes("pages")).map((k) => caches.delete(k)));
        }
      }}
    >
      <button className={className}>Cerrar sesión</button>
    </form>
  );
}
