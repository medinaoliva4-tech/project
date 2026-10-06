import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { shortDate, timeOf } from "@/lib/dates";
import { mealLabel, type MealPhoto } from "@/lib/meals";

/** Feed de fotos por día. Lo usan el cliente y el coach. */
export function MealFeed({
  days,
  tz,
  today,
  renderActions,
}: {
  days: { date: string; photos: MealPhoto[] }[];
  tz: string;
  today: string;
  renderActions?: (photo: MealPhoto) => ReactNode;
}) {
  return (
    <div className="space-y-7">
      {days.map((d) => (
        <section key={d.date}>
          <h3 className="mb-3 text-[15px] font-semibold">
            {d.date === today ? "Hoy" : shortDate(d.date)}
            <span className="ml-2 text-[13px] font-normal text-muted">{d.photos.length} foto{d.photos.length === 1 ? "" : "s"}</span>
          </h3>
          <div className="space-y-3">
            {d.photos.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-[18px] bg-card">
                {p.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={mealLabel(p.meal_type)} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">
                      {mealLabel(p.meal_type)}
                    </span>
                    <span className="text-[13px] text-muted">{timeOf(p.taken_at, tz)}</span>
                  </div>
                  {p.note && <p className="mt-2 text-[15px]">{p.note}</p>}
                  {p.comments.map((c) => (
                    <div key={c.id} className="mt-3 flex gap-2 rounded-2xl bg-card-2 p-3 text-[14px]">
                      <MessageCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                      <p>
                        <span className="font-semibold text-beige">{c.author_name.split(" ")[0] || "Coach"}: </span>
                        {c.body}
                      </p>
                    </div>
                  ))}
                  {renderActions?.(p)}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
