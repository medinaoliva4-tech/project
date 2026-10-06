"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "./actions";
import { inputCls } from "@/components/ui";

const GOALS = ["Perder grasa", "Ganar músculo", "Recomposición", "Rendimiento"];

export function ProfileForm({
  name,
  goal,
  weight,
}: {
  name: string;
  goal: string | null;
  weight: number | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-3">
      <input name="full_name" defaultValue={name} required className={inputCls} placeholder="Nombre" />
      <div className="grid grid-cols-2 gap-3">
        <input name="weight" defaultValue={weight ?? ""} inputMode="decimal" placeholder="Peso (kg)" className={inputCls} />
        <select name="goal" defaultValue={goal ?? ""} className={inputCls}>
          <option value="">Objetivo</option>
          {GOALS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      <button disabled={pending} className="w-full rounded-2xl bg-white py-3 font-semibold text-black disabled:opacity-50">
        {pending ? "Guardando..." : state?.ok ? "Guardado ✓" : "Guardar"}
      </button>
      {state?.error && <p className="text-[14px] text-red-400">{state.error}</p>}
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="flex gap-2">
      <input
        name="password"
        type="password"
        minLength={8}
        required
        autoComplete="new-password"
        placeholder="Nuevo password"
        className={inputCls}
      />
      <button disabled={pending} className="shrink-0 rounded-2xl bg-card-2 px-4 font-semibold">
        {state?.ok ? "✓" : "Cambiar"}
      </button>
      {state?.error && <p className="text-[14px] text-red-400">{state.error}</p>}
    </form>
  );
}
