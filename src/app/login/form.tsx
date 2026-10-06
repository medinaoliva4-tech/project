"use client";

import { useActionState } from "react";
import { signIn } from "@/app/auth-actions";
import { LogoMark } from "@/components/logo";
import { btnPrimary, inputCls } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <main className="pt-safe mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10">
      <div className="mt-16 flex flex-col items-center text-center">
        <LogoMark size={88} />
        <h1 className="mt-5 text-[15px] font-semibold tracking-[0.3em] text-beige">PROJECT</h1>
        <p className="mt-6 text-[26px] font-bold">Bienvenido</p>
        <p className="mt-1 text-[15px] text-muted">Entra con la cuenta que te creó tu coach.</p>
      </div>

      <form action={action} className="mt-10 space-y-3">
        <input name="email" type="email" autoComplete="email" required placeholder="Email" className={inputCls} />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          className={inputCls}
        />
        {state?.error && <p className="text-[14px] text-red-400">{state.error}</p>}
        <button disabled={pending} className={`${btnPrimary} mt-2`}>
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-auto pt-10 text-center text-[13px] text-muted">
        ¿No tienes cuenta? Pídesela a tu coach.
      </p>
    </main>
  );
}
