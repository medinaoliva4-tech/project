import { Share, SquarePlus } from "lucide-react";

export function InstallHint() {
  return (
    <div className="rounded-[18px] bg-card p-4">
      <p className="text-[16px] font-semibold">Ponla en tu pantalla de inicio</p>
      <ul className="mt-3 space-y-2 text-[14px] text-muted">
        <li className="flex items-center gap-2">
          <span className="font-semibold text-white">iPhone:</span> Safari → <Share size={16} className="text-accent" />{" "}
          Compartir → <SquarePlus size={16} className="text-accent" /> Agregar a inicio
        </li>
        <li>
          <span className="font-semibold text-white">Android:</span> Chrome → menú ⋮ → Instalar app
        </li>
      </ul>
    </div>
  );
}
