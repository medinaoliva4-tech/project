import Image from "next/image";
import Link from "next/link";
import { thumbnailOf, type Exercise } from "@/lib/exercises";
import { Pill } from "@/components/ui";

/** Card con thumbnail estilo "Trending Plans". */
export function ExerciseCard({ ex, wide = false }: { ex: Exercise; wide?: boolean }) {
  const thumb = thumbnailOf(ex);
  return (
    <Link
      href={`/train/split/${ex.split}/${ex.slug}`}
      className={`relative block aspect-[16/10] shrink-0 snap-start overflow-hidden rounded-[18px] bg-card ${
        wide ? "w-full" : "w-[85%]"
      }`}
    >
      {thumb && <Image src={thumb} alt={ex.name} fill sizes="85vw" className="object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold">{ex.name}</p>
          <p className="truncate text-[13px] text-white/80">{ex.muscle}</p>
        </div>
        <Pill className="shrink-0">Ver</Pill>
      </div>
    </Link>
  );
}
