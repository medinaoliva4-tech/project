import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { SPLITS, exercisesBySplit, groupByMuscle, splitCover, type SplitKey } from "@/lib/exercises";
import { hevyLink } from "@/lib/hevy";
import { SESSIONS } from "@/lib/sessions";
import { ExerciseCard } from "@/components/exercise-card";
import { Screen } from "@/components/ui";

export default async function SplitPage({ params }: PageProps<"/train/split/[split]">) {
  const { split } = await params;
  const info = SPLITS.find((s) => s.key === split);
  if (!info) notFound();
  const { profile } = await requireClient();

  const list = exercisesBySplit(info.key as SplitKey);
  const groups = groupByMuscle(list);
  const cover = splitCover(info.key);
  const session = SESSIONS.find((s) => s.split === info.key)?.key;

  return (
    <Screen>
      <div className="relative -mx-5 -mt-4 aspect-[4/3] overflow-hidden">
        {cover && <Image src={cover} alt={info.name} fill sizes="100vw" className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-black/30" />
        <Link
          href="/train"
          className="pt-safe absolute left-4 top-0 mt-2 grid h-10 w-10 place-items-center rounded-full bg-black/50 backdrop-blur"
          aria-label="Atrás"
        >
          <ChevronLeft />
        </Link>
        <div className="absolute inset-x-5 bottom-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Split</p>
          <h1 className="text-[32px] font-bold leading-tight">{info.name}</h1>
          <p className="text-[14px] text-white/80">
            {list.length} ejercicios · {info.tagline}
          </p>
        </div>
      </div>

      <a
        href={hevyLink(profile.hevy_links, session)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-black"
      >
        Entrenar en Hevy <ExternalLink size={16} />
      </a>

      {groups.map((g) => (
        <section key={g.muscle} className="mt-7">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-beige/80">
            {g.muscle}
          </h2>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5">
            {g.items.map((ex) => (
              <ExerciseCard key={ex.slug} ex={ex} wide={g.items.length === 1} />
            ))}
          </div>
        </section>
      ))}
    </Screen>
  );
}
