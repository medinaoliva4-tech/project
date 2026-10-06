import Link from "next/link";
import { requireCoach } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Wordmark } from "@/components/logo";

export default async function CoachLayout({ children }: LayoutProps<"/coach">) {
  await requireCoach();
  return (
    <div className="pt-safe mx-auto max-w-5xl px-5 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/coach" className="flex items-center gap-3">
          <Wordmark />
          <span className="rounded-full bg-card px-2.5 py-0.5 text-[12px] text-muted">Coach</span>
        </Link>
        <nav className="flex items-center gap-1 text-[14px]">
          <Link href="/coach" className="rounded-full px-3 py-1.5 hover:bg-card">
            Clientes
          </Link>
          <Link href="/coach/ideas" className="rounded-full px-3 py-1.5 hover:bg-card">
            Ideas de comida
          </Link>
          <LogoutButton className="rounded-full px-3 py-1.5 text-muted hover:bg-card" />
        </nav>
      </header>
      {children}
    </div>
  );
}
