"use client";

import { useEffect, useRef, useState } from "react";

interface SharePosterProps {
  /** Poster image URL (versioned, e.g. /api/poster?date=…&v=…). */
  posterUrl: string;
  /** File name offered to the share sheet / download. */
  fileName: string;
  /** Text sent with the image, and in the WhatsApp text message. */
  message: string;
  /** Public link to the gold-rate page, appended to text shares. */
  pageUrl: string;
  /** Smaller buttons for the homepage strip. */
  compact?: boolean;
}

/**
 * Share the daily-rate poster the way the shop actually uses it:
 *  1. Share image  → phone share sheet → WhatsApp status / chat (Android & iOS)
 *  2. Download     → save the PNG to post manually
 *  3. WhatsApp text → wa.me with the rate and the link (link preview shows the poster)
 *  4. Copy link
 *
 * The image is fetched ahead of the click: Safari only opens the share sheet
 * if navigator.share runs straight from the tap, not after a network wait.
 */
export function SharePoster({ posterUrl, fileName, message, pageUrl, compact = false }: SharePosterProps) {
  const fileRef = useRef<File | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    fileRef.current = null;
    fetch(posterUrl)
      .then((response) => response.blob())
      .then((blob) => {
        if (cancelled) return;
        const file = new File([blob], fileName, { type: "image/png" });
        fileRef.current = file;
        setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [posterUrl, fileName]);

  const flash = (text: string) => {
    setStatus(text);
    window.setTimeout(() => setStatus(""), 2500);
  };

  const download = () => {
    const link = document.createElement("a");
    link.href = fileRef.current ? URL.createObjectURL(fileRef.current) : posterUrl;
    link.download = fileName;
    link.click();
  };

  const shareImage = async () => {
    const file = fileRef.current;
    if (!file || !canShareFiles) {
      download();
      flash("Saved — post it from your gallery");
      return;
    }
    try {
      await navigator.share({ files: [file], text: message });
    } catch (error) {
      if ((error as Error).name !== "AbortError") download();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      flash("Link copied");
    } catch {
      flash(pageUrl);
    }
  };

  const whatsappText = `https://wa.me/?text=${encodeURIComponent(`${message}\n${pageUrl}`)}`;
  const size = compact ? "!px-5 text-[13px]" : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={shareImage} className={`btn-primary ${size}`}>
          {canShareFiles ? "Share poster" : "Download poster"}
        </button>
        <a href={whatsappText} target="_blank" rel="noopener noreferrer" className={`btn-secondary ${size}`}>
          Send on WhatsApp
        </a>
        {!compact && canShareFiles ? (
          <button type="button" onClick={download} className="btn-secondary">
            Download
          </button>
        ) : null}
        <button type="button" onClick={copyLink} className={`btn-secondary ${size}`}>
          Copy link
        </button>
      </div>
      <p className="min-h-[1.25rem] font-sans text-caption text-gold" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
