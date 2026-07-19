"use client";

import { useRef } from "react";
import { useLoopingVideo } from "@/hooks/useLoopingVideo";
import type { VideoSegments } from "@/types/brand";

interface StoryVideoPlayerProps {
  src: string;
  segments?: VideoSegments;
  label: string;
}

/**
 * Looping Cloudinary story video. When SEGMENTS are supplied, the video starts
 * at `segments.startAt` and loops within its window (Document 3 §5), so each
 * chapter shows a different part of the film. When no segments are provided,
 * native `loop` handles playback. Muted + playsInline so autoplay is permitted.
 *
 * A media fragment (#t=startAt) is appended to the source as a hint so the
 * browser buffers from the right point; the hook enforces the exact window.
 */
export function StoryVideoPlayer({ src, segments, label }: StoryVideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useLoopingVideo(ref, segments);

  const fragment = segments ? `${src}#t=${segments.startAt}` : src;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src={fragment}
        muted
        autoPlay
        playsInline
        loop={!segments}
        preload="metadata"
        aria-label={label}
      />
    </div>
  );
}
