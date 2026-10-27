"use client";

import { useEffect, useRef } from "react";
import { STATUS_HEIGHT, STATUS_WIDTH } from "@/lib/rateAds";
import { drawStatusFrame, loadStatusFonts, type StatusOverlay } from "@/lib/statusVideo";

interface StatusPreviewProps {
  clipUrl: string;
  data: StatusOverlay;
  className?: string;
}

/**
 * Live preview of the status video: the chosen clip loops silently and the
 * rate panel is drawn on top with the same code that records the real video,
 * so it updates as the rate is typed.
 */
export function StatusPreview({ clipUrl, data, className = "" }: StatusPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let frame = 0;
    let cancelled = false;
    void loadStatusFonts().then((fonts) => {
      const tick = () => {
        if (cancelled) return;
        drawStatusFrame(ctx, video, dataRef.current, video.currentTime, fonts);
        frame = requestAnimationFrame(tick);
      };
      tick();
    });
    void video.play().catch(() => undefined);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [clipUrl]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={STATUS_WIDTH}
        height={STATUS_HEIGHT}
        className="h-full w-full"
        aria-label="Status video preview"
      />
      {/* Invisible rather than display:none, which can stop frames decoding. */}
      <video
        ref={videoRef}
        src={clipUrl}
        muted
        loop
        playsInline
        autoPlay
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />
    </div>
  );
}
