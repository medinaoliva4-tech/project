"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

/**
 * Layout tipo app nativa: alto fijo (100dvh), solo el contenido scrollea y el menú
 * queda anclado abajo. Con `position: fixed` iOS Safari mueve el menú cuando
 * su barra se esconde/aparece o al cambiar de página.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Cada pantalla nueva empieza arriba
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
