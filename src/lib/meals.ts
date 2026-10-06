import type { SupabaseClient } from "@supabase/supabase-js";
import { localDateOf } from "@/lib/dates";

export const MEAL_TYPES = [
  { key: "desayuno", label: "Desayuno" },
  { key: "comida", label: "Comida" },
  { key: "cena", label: "Cena" },
  { key: "snack", label: "Snack" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["key"];

export const mealLabel = (k: string) => MEAL_TYPES.find((m) => m.key === k)?.label ?? k;

export type MealPhoto = {
  id: string;
  client_id: string;
  meal_type: MealType;
  note: string | null;
  photo_path: string;
  taken_at: string;
  url: string | null;
  comments: { id: string; body: string; created_at: string; author_id: string; author_name: string }[];
};

/** Fotos + URLs firmadas + comentarios, agrupadas por día local. */
export async function getMealFeed(
  supabase: SupabaseClient,
  clientId: string,
  tz: string,
  sinceDays = 14,
) {
  const since = new Date(Date.now() - sinceDays * 24 * 3600e3).toISOString();
  const { data: photos } = await supabase
    .from("meal_photos")
    .select("id, client_id, meal_type, note, photo_path, taken_at")
    .eq("client_id", clientId)
    .gte("taken_at", since)
    .order("taken_at", { ascending: false });

  const list = photos ?? [];
  if (!list.length) return [];

  const [{ data: signed }, { data: comments }] = await Promise.all([
    supabase.storage.from("meals").createSignedUrls(
      list.map((p) => p.photo_path),
      60 * 60 * 6,
    ),
    supabase
      .from("meal_comments")
      .select("id, photo_id, body, created_at, author_id, profiles(full_name)")
      .in("photo_id", list.map((p) => p.id))
      .order("created_at"),
  ]);

  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  const enriched: MealPhoto[] = list.map((p) => ({
    ...p,
    url: urlByPath.get(p.photo_path) ?? null,
    comments: (comments ?? [])
      .filter((c) => c.photo_id === p.id)
      .map((c) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        author_id: c.author_id,
        author_name: (c.profiles as unknown as { full_name: string } | null)?.full_name ?? "",
      })),
  }));

  const days: { date: string; photos: MealPhoto[] }[] = [];
  for (const p of enriched) {
    const date = localDateOf(p.taken_at, tz);
    const d = days.find((x) => x.date === date);
    if (d) d.photos.push(p);
    else days.push({ date, photos: [p] });
  }
  return days;
}
