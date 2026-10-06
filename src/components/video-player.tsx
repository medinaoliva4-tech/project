"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

/** Video de YouTube que se reproduce dentro de la app (sin abrir YouTube). */
export function VideoPlayer({ youtubeId, thumb, title }: { youtubeId: string; thumb: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[18px] bg-card">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlaying(true)} className="absolute inset-0" aria-label={`Ver ${title}`}>
          <Image src={thumb} alt={title} fill sizes="100vw" className="object-cover" priority />
          <span className="absolute inset-0 bg-black/30" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-black shadow-lg">
            <Play size={28} fill="currentColor" className="ml-1" />
          </span>
        </button>
      )}
    </div>
  );
}
