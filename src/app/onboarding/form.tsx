"use client";

import { useActionState } from "react";
import { completeOnboarding } from "./actions";
import { TzInput } from "@/components/tz-input";
import { btnPrimary, inputCls } from "@/components/ui";

const GOALS = ["Perder grasa", "Ganar músculo", "Recomposición", "Rendimiento"];

export function OnboardingForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <TzInput />
      <label className="block">
        <span className="mb-1.5 block text-[14px] text-muted">Tu nombre</span>
        <input name="full_name" defaultValue={name} required className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[14px] text-muted">Nuevo password (mín. 8)</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[14px] text-muted">Peso (kg)</span>
          <input name="weight" inputMode="decimal" placeholder="80" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[14px] text-muted">Objetivo</span>
          <select name="goal" className={inputCls} defaultValue="">
            <option value="">Elegir</option>
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>
      {state?.error && <p className="text-[14px] text-red-400">{state.error}</p>}
      <button disabled={pending} className={btnPrimary}>
        {pending ? "Guardando..." : "Siguiente"}
      </button>
    </form>
  );
}
