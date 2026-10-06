"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, HeartPulse, House, Utensils } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: House },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/comida", label: "Comida", icon: Utensils },
  { href: "/recovery", label: "Recovery", icon: HeartPulse },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="pb-safe z-40 shrink-0 border-t border-white/10 bg-ink">
      <ul className="mx-auto grid max-w-md grid-cols-4 pt-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-1 text-[12px] ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.2 : 1.6} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
