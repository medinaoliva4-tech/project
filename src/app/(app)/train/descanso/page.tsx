import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { REST_TIPS } from "@/lib/exercises";
import { Screen } from "@/components/ui";

export default function RestPage() {
  return (
    <Screen>
      <div className="pt-2">
        <Link href="/train" className="grid h-10 w-10 place-items-center rounded-full bg-card" aria-label="Atrás">
          <ChevronLeft />
        </Link>
      </div>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">2 por semana</p>
      <h1 className="text-[28px] font-bold">Día de descanso</h1>
      <p className="mt-1 text-[15px] text-muted">
        Hoy no hay gym. Hoy se recupera, y ahí es donde creces.
      </p>
      <ul className="mt-5 space-y-3">
        {REST_TIPS.map((t, i) => (
          <li key={t.title} className="flex gap-4 rounded-[18px] bg-card p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">
              {i + 1}
            </span>
            <div>
              <p className="text-[16px] font-semibold">{t.title}</p>
              <p className="mt-0.5 text-[14px] text-muted">{t.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
