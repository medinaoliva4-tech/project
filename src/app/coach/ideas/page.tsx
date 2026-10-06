import { Trash2 } from "lucide-react";
import { addMealIdea, deleteMealIdea } from "../actions";
import { requireCoach } from "@/lib/auth";
import { MEAL_TYPES, mealLabel } from "@/lib/meals";
import { Card } from "@/components/ui";

const field =
  "w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-[14px] outline-none focus:border-accent";

export default async function IdeasPage() {
  const { supabase, profile } = await requireCoach();
  const { data } = await supabase
    .from("meal_ideas")
    .select("id, coach_id, meal_type, title, description, kcal, protein_g, carbs_g, fat_g")
    .order("meal_type")
    .order("created_at", { ascending: false });

  return (
    <main className="mt-4 grid gap-6 md:grid-cols-[360px_1fr]">
      <div>
        <h1 className="text-[28px] font-bold">Ideas de comida</h1>
        <p className="text-[14px] text-muted">Las ven todos tus clientes en Comida → Ideas.</p>
        <Card className="mt-4">
          <form action={addMealIdea} className="space-y-2">
            <select name="meal_type" className={field}>
              {MEAL_TYPES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <input name="title" required placeholder="Título" className={field} />
            <textarea name="description" rows={3} placeholder="Ingredientes / cómo prepararla" className={field} />
            <div className="grid grid-cols-4 gap-2">
              {["kcal", "protein_g", "carbs_g", "fat_g"].map((k) => (
                <input key={k} name={k} inputMode="numeric" placeholder={k.replace("_g", "")} className={field} />
              ))}
            </div>
            <button className="w-full rounded-xl bg-accent py-2.5 font-semibold text-black">Agregar idea</button>
          </form>
        </Card>
      </div>

      <div className="space-y-2">
        {(data ?? []).map((i) => (
          <Card key={i.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">{mealLabel(i.meal_type)}</p>
              <p className="font-semibold">{i.title}</p>
              <p className="text-[13px] text-muted">
                {i.kcal ?? "—"} kcal · P{i.protein_g ?? "—"} C{i.carbs_g ?? "—"} G{i.fat_g ?? "—"}
                {!i.coach_id && " · idea base"}
              </p>
            </div>
            {i.coach_id === profile.id && (
              <form action={deleteMealIdea}>
                <input type="hidden" name="id" value={i.id} />
                <button className="p-2 text-muted hover:text-red-400" aria-label="Borrar">
                  <Trash2 size={16} />
                </button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
