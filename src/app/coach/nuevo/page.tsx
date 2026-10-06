"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { createClientAccount, type NewClientState } from "../actions";
import { btnPrimary, inputCls } from "@/components/ui";

export default function NewClientPage() {
  const [state, action, pending] = useActionState<NewClientState, FormData>(createClientAccount, null);
  const [copied, setCopied] = useState(false);

  if (state && "ok" in state) {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const msg = `¡Hey ${state.name.split(" ")[0]}! 💪 Ya tienes tu cuenta en Project.\n\n1. Entra a ${url}\n2. Email: ${state.email}\n3. Password temporal: ${state.password}\n\nAl entrar te pide cambiar el password. Luego agrégala a tu pantalla de inicio (Safari → Compartir → Agregar a inicio).`;
    return (
      <main className="mx-auto mt-6 max-w-lg">
        <div className="rounded-[18px] bg-card p-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-black">
            <Check />
          </div>
          <h1 className="mt-4 text-[24px] font-bold">Cuenta creada</h1>
          <p className="mt-1 text-muted">Mándale esto por WhatsApp:</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-ink p-4 text-[14px] leading-relaxed">{msg}</pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(msg);
              setCopied(true);
            }}
            className={`${btnPrimary} mt-4 flex items-center justify-center gap-2`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copiado" : "Copiar mensaje"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block rounded-2xl border border-line py-3.5 text-center font-medium"
          >
            Abrir WhatsApp
          </a>
          <Link href="/coach" className="mt-3 block text-center text-[14px] text-muted">
            Volver a clientes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-6 max-w-lg">
      <h1 className="text-[28px] font-bold">Nuevo cliente</h1>
      <p className="mt-1 text-muted">Crea su cuenta y mándale el acceso. Al entrar cambia su password.</p>
      <form action={action} className="mt-6 space-y-3">
        <input name="full_name" required placeholder="Nombre completo" className={inputCls} />
        <input name="email" type="email" required placeholder="Email" className={inputCls} />
        <input name="password" placeholder="Password temporal (vacío = se genera)" className={inputCls} />
        {state && "error" in state && <p className="text-[14px] text-red-400">{state.error}</p>}
        <button disabled={pending} className={btnPrimary}>
          {pending ? "Creando..." : "Crear cuenta"}
        </button>
      </form>
    </main>
  );
}
