"use client";

import { useEffect, useRef } from "react";
import { STATUS_HEIGHT, STATUS_WIDTH } from "@/lib/rateAds";
import { drawStatusFrame, loadImage, loadStatusFonts, STILL_FRAME_TIME, type StatusOverlay } from "@/lib/statusVideo";

interface StatusPreviewProps {
  /** A video clip URL (plays and loops) or a photo path (drawn once, still). */
  media: { kind: "video" | "photo"; src: string };
  data: StatusOverlay;
  className?: string;
}

/**
 * Live preview of the status: the chosen clip or photo with the rate panel
 * drawn on top by the same code that makes the real file, so it updates as
 * the rate is typed and matches what gets shared.
 */
export function StatusPreview({ media, data, className = "" }: StatusPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let frame = 0;
    let cancelled = false;

    if (media.kind === "photo") {
      void Promise.all([loadStatusFonts(), loadImage(media.src)]).then(([fonts, image]) => {
        // Redraw only when the overlay data changes, not every frame.
        let last = "";
        const tick = () => {
          if (cancelled) return;
          const key = JSON.stringify(dataRef.current);
          if (key !== last) {
            drawStatusFrame(ctx, image, dataRef.current, STILL_FRAME_TIME, fonts);
            last = key;
          }
          frame = requestAnimationFrame(tick);
        };
        tick();
      });
    } else {
      const video = videoRef.current;
      if (!video) return;
      void loadStatusFonts().then((fonts) => {
        const tick = () => {
          if (cancelled) return;
          drawStatusFrame(ctx, video, dataRef.current, video.currentTime, fonts);
          frame = requestAnimationFrame(tick);
        };
        tick();
      });
      void video.play().catch(() => undefined);
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [media.kind, media.src]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={STATUS_WIDTH}
        height={STATUS_HEIGHT}
        className="h-full w-full"
        aria-label="Status preview"
      />
      {media.kind === "video" ? (
        // Invisible rather than display:none, which can stop frames decoding.
        <video
          ref={videoRef}
          src={media.src}
          muted
          loop
          playsInline
          autoPlay
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
        />
      ) : null}
    </div>
  );
}
