import Link from "next/link";
import { requireClient } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { MEAL_TYPES, getMealFeed } from "@/lib/meals";
import { MealFeed } from "@/components/meal-feed";
import { MealUploader } from "@/components/meal-uploader";
import { Screen } from "@/components/ui";

type Idea = {
  id: string;
  meal_type: string;
  title: string;
  description: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export default async function ComidaPage({ searchParams }: PageProps<"/comida">) {
  const sp = await searchParams;
  const tab = sp.tab === "ideas" ? "ideas" : "fotos";
  const mealFilter = typeof sp.tipo === "string" ? sp.tipo : "desayuno";
  const { supabase, profile } = await requireClient();
  const today = todayISO(profile.timezone);

  return (
    <Screen>
      <h1 className="pt-2 text-[28px] font-bold">Comida</h1>

      <div className="mt-4 grid grid-cols-2 rounded-full bg-card p-1 text-[15px]">
        {[
          { key: "fotos", label: "Mis fotos" },
          { key: "ideas", label: "Ideas" },
        ].map((t) => (
          <Link
            key={t.key}
            href={t.key === "fotos" ? "/comida" : "/comida?tab=ideas"}
            className={`rounded-full py-2 text-center font-medium ${
              tab === t.key ? "bg-accent text-black" : "text-muted"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "fotos" ? (
        <FotosTab supabase={supabase} userId={profile.id} tz={profile.timezone} today={today} />
      ) : (
        <IdeasTab supabase={supabase} meal={mealFilter} />
      )}
    </Screen>
  );
}

async function FotosTab({
  supabase,
  userId,
  tz,
  today,
}: {
  supabase: Awaited<ReturnType<typeof requireClient>>["supabase"];
  userId: string;
  tz: string;
  today: string;
}) {
  const days = await getMealFeed(supabase, userId, tz);
  return (
    <>
      <div className="mt-5">
        <MealUploader userId={userId} />
        <p className="mt-2 text-center text-[13px] text-muted">Tu coach ve cada foto y te puede comentar.</p>
      </div>
      <div className="mt-7">
        {days.length ? (
          <MealFeed days={days} tz={tz} today={today} />
        ) : (
          <div className="rounded-[18px] bg-card p-6 text-center text-muted">
            Aún no subes fotos. Empieza con tu siguiente comida 📸
          </div>
        )}
      </div>
    </>
  );
}

async function IdeasTab({
  supabase,
  meal,
}: {
  supabase: Awaited<ReturnType<typeof requireClient>>["supabase"];
  meal: string;
}) {
  const { data } = await supabase
    .from("meal_ideas")
    .select("id, meal_type, title, description, kcal, protein_g, carbs_g, fat_g")
    .eq("meal_type", meal)
    .order("created_at", { ascending: false });
  const ideas = (data ?? []) as Idea[];

  return (
    <>
      <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5">
        {MEAL_TYPES.map((m) => (
          <Link
            key={m.key}
            href={`/comida?tab=ideas&tipo=${m.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium ${
              meal === m.key ? "bg-white text-black" : "bg-card text-white"
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {ideas.map((i) => (
          <article key={i.id} className="rounded-[18px] bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[17px] font-semibold">{i.title}</p>
              {i.kcal != null && (
                <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent">
                  {i.kcal} kcal
                </span>
              )}
            </div>
            {i.description && <p className="mt-1 text-[14px] text-muted">{i.description}</p>}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Proteína", i.protein_g],
                ["Carbs", i.carbs_g],
                ["Grasa", i.fat_g],
              ].map(([label, v]) => (
                <div key={label as string} className="rounded-xl bg-card-2 py-2">
                  <p className="text-[15px] font-semibold">{v ?? "—"} g</p>
                  <p className="text-[11px] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
        {!ideas.length && (
          <div className="rounded-[18px] bg-card p-6 text-center text-muted">Tu coach aún no agrega ideas aquí.</div>
        )}
      </div>
    </>
  );
}
