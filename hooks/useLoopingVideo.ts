"use client";

import { useEffect, type RefObject } from "react";
import type { VideoSegments } from "@/types/brand";

/**
 * Drives per-chapter playback for a story video using the supplied SEGMENTS.
 * Each chapter starts at `startAt` and loops back to it once playback reaches
 * `loopEnd`, so scrolling through the page shows a different part of the film
 * in every section. The UI never guesses timing — it comes entirely from
 * config (Document 1 §8, Document 3 §5). When no segments are supplied, native
 * `loop` on the element handles playback and this hook is a no-op.
 */
export function useLoopingVideo(
  ref: RefObject<HTMLVideoElement>,
  segments?: VideoSegments,
): void {
  useEffect(() => {
    const video = ref.current;
    if (!video || !segments) return;

    const { startAt, loopEnd } = segments;

    const seekToStart = () => {
      // Only rewind if we're outside this chapter's window.
      if (video.currentTime < startAt || video.currentTime >= loopEnd) {
        try {
          video.currentTime = startAt;
        } catch {
          /* metadata may not be ready yet; onLoadedMetadata will retry */
        }
      }
    };

    const onLoadedMetadata = () => {
      video.currentTime = startAt;
      void video.play();
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= loopEnd) {
        video.currentTime = startAt;
        void video.play();
      }
    };

    // If metadata is already available, seek immediately; otherwise wait.
    if (video.readyState >= 1) {
      seekToStart();
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [ref, segments]);
}
