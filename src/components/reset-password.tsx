"use client";

import { useState, useTransition } from "react";
import { resetClientPassword } from "@/app/coach/actions";

export function ResetPassword({ clientId }: { clientId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          confirm("¿Generar un password temporal nuevo para este cliente?") &&
          start(async () => {
            const r = await resetClientPassword(clientId);
            setResult("password" in r ? `Nuevo password: ${r.password}` : r.error ?? "Error");
          })
        }
        className="rounded-full bg-card-2 px-4 py-2 text-[13px]"
      >
        {pending ? "..." : "Resetear password"}
      </button>
      {result && <p className="mt-2 select-all text-[13px] text-accent">{result}</p>}
    </div>
  );
}
