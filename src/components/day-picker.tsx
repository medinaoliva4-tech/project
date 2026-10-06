"use client";

import { useTransition } from "react";
import { setSessionDay } from "@/app/(app)/actions";
import { dayNumber, dayShort } from "@/lib/dates";

/** Elige qué día de la semana haces esta sesión. */
export function DayPicker({
  rowId,
  value,
  days,
  today,
}: {
  rowId: string;
  value: string | null;
  days: string[];
  today: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Día"
      disabled={pending}
      value={value ?? ""}
      onChange={(e) => start(() => setSessionDay(rowId, e.target.value || null))}
      className={`appearance-none rounded-full border px-3 py-1.5 text-center text-[13px] font-medium outline-none ${
        value
          ? "border-transparent bg-card-2 text-white"
          : "border-accent/60 bg-transparent text-accent"
      } ${pending ? "opacity-50" : ""}`}
    >
      <option value="">Elegir día</option>
      {days.map((d) => (
        <option key={d} value={d}>
          {d === today ? "Hoy" : `${dayShort(d)} ${dayNumber(d)}`}
        </option>
      ))}
    </select>
  );
}
