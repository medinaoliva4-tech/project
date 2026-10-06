"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MEAL_TYPES, type MealType } from "@/lib/meals";

function defaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "desayuno";
  if (h < 17) return "comida";
  if (h < 22) return "cena";
  return "snack";
}

/** Reduce la foto a máx 1600px JPEG para que suba rápido con datos móviles. */
async function compress(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar"))), "image/jpeg", 0.82),
    );
  } catch {
    return file; // si el navegador no la puede leer, sube la original
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MealUploader({ userId, variant = "button" }: { userId: string; variant?: "button" | "tile" }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMeal(defaultMeal());
    setNote("");
    setError(null);
  }

  function close() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const blob = await compress(file);
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("meals").upload(path, blob, {
        contentType: blob.type || "image/jpeg",
      });
      if (up.error) throw up.error;
      const ins = await supabase
        .from("meal_photos")
        .insert({ client_id: userId, meal_type: meal, note: note.trim() || null, photo_path: path });
      if (ins.error) throw ins.error;
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir, intenta otra vez");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {variant === "tile" ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-line text-muted"
        >
          <span className="flex flex-col items-center gap-1 text-[12px]">
            <Camera size={22} className="text-accent" />
            Foto
          </span>
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-black"
        >
          <Camera size={20} /> Subir foto de comida
        </button>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
          <div className="mt-auto max-h-[92vh] overflow-y-auto rounded-t-[28px] bg-card p-5 pb-safe">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold">Nueva comida</p>
              <button onClick={close} className="p-1 text-muted" aria-label="Cerrar">
                <X />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa" className="mt-4 max-h-[42vh] w-full rounded-2xl object-cover" />
            <div className="mt-4 grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMeal(m.key)}
                  className={`rounded-full py-2 text-[13px] font-medium ${
                    meal === m.key ? "bg-accent text-black" : "bg-card-2 text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional): ej. 200 g pollo + arroz"
              className="mt-3 w-full rounded-2xl border border-line bg-ink px-4 py-3 outline-none focus:border-accent"
            />
            {error && <p className="mt-2 text-[14px] text-red-400">{error}</p>}
            <button
              onClick={upload}
              disabled={busy}
              className="mt-4 w-full rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-black disabled:opacity-50"
            >
              {busy ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
