import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { requireClient } from "@/lib/auth";
import { exercisesBySplit, findExercise, splitName, thumbnailOf } from "@/lib/exercises";
import { hevyLink } from "@/lib/hevy";
import { SESSIONS } from "@/lib/sessions";
import { VideoPlayer } from "@/components/video-player";
import { Screen } from "@/components/ui";

export default async function ExercisePage({ params }: PageProps<"/train/split/[split]/[slug]">) {
  const { split, slug } = await params;
  const ex = findExercise(split, slug);
  if (!ex) notFound();
  const { profile } = await requireClient();

  const list = exercisesBySplit(ex.split);
  const idx = list.findIndex((e) => e.slug === ex.slug);
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const thumb = thumbnailOf(ex);
  const session = SESSIONS.find((s) => s.split === ex.split)?.key;

  return (
    <Screen>
      <div className="flex items-center gap-2 pt-2">
        <Link
          href={`/train/split/${ex.split}`}
          className="grid h-10 w-10 place-items-center rounded-full bg-card"
          aria-label="Atrás"
        >
          <ChevronLeft />
        </Link>
        <span className="text-[15px] text-muted">{splitName(ex.split)}</span>
        <span className="ml-auto text-[13px] text-muted">
          {idx + 1}/{list.length}
        </span>
      </div>

      <div className="mt-4">
        {ex.youtubeId && thumb ? (
          <VideoPlayer youtubeId={ex.youtubeId} thumb={thumb} title={ex.name} />
        ) : (
          <div className="grid aspect-video place-items-center rounded-[18px] bg-card text-muted">
            Video pronto
          </div>
        )}
      </div>

      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">{ex.muscle}</p>
      <h1 className="text-[26px] font-bold leading-tight">{ex.name}</h1>

      {ex.cues.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ex.cues.map((c, i) => (
            <li key={c} className="flex gap-3 rounded-2xl bg-card p-4 text-[15px]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
                {i + 1}
              </span>
              {c}
            </li>
          ))}
        </ul>
      )}

      <a
        href={hevyLink(profile.hevy_links, session)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-black"
      >
        Registrar en Hevy <ExternalLink size={16} />
      </a>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={`/train/split/${prev.split}/${prev.slug}`} className="rounded-2xl bg-card p-3">
            <span className="flex items-center gap-1 text-[12px] text-muted">
              <ChevronLeft size={14} /> Anterior
            </span>
            <span className="mt-1 block truncate text-[14px]">{prev.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/train/split/${next.split}/${next.slug}`} className="rounded-2xl bg-card p-3 text-right">
            <span className="flex items-center justify-end gap-1 text-[12px] text-muted">
              Siguiente <ChevronRight size={14} />
            </span>
            <span className="mt-1 block truncate text-[14px]">{next.name}</span>
          </Link>
        )}
      </div>
    </Screen>
  );
}
