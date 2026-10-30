"use client";

import { useEffect, useRef } from "react";

interface LoopClipProps {
  /** Short, silent MP4 (a few seconds), e.g. a trimmed Cloudinary video URL. */
  src: string;
  /** Still frame shown before the clip loads, and instead of it for reduced motion. */
  poster: string;
  label: string;
  className?: string;
}

/**
 * A "moving photo": a few seconds of footage that loops silently in place of an
 * image. It only plays while on screen (saves phone data and battery), and
 * visitors who ask for reduced motion see just the still frame.
 */
export function LoopClip({ src, poster, label, className = "" }: LoopClipProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== "auto") video.preload = "auto";
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={className}
    />
  );
}
