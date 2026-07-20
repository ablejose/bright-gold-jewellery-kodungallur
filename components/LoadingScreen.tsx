"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";

/**
 * Full-screen brand loading overlay.
 *
 * A black screen showing ONLY the business name with three pulsing dots
 * beneath it. It is painted immediately, then fades out once the page has
 * finished loading (with a short minimum so it never merely flashes).
 * Reduced-motion users get an instant transition via app/globals.css.
 *
 * Reads the business name from config/brand.ts, so it is automatically
 * correct for every generated site with no per-site code changes.
 */
export function LoadingScreen() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let removeTimer: ReturnType<typeof setTimeout>;

    const dismiss = () => {
      setFading(true);
      removeTimer = setTimeout(() => setMounted(false), 600);
    };

    // Keep the screen up for a brief minimum, then wait for full page load.
    const minTimer = setTimeout(() => {
      if (document.readyState === "complete") {
        dismiss();
      } else {
        window.addEventListener("load", dismiss, { once: true });
      }
    }, 1000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(removeTimer);
      window.removeEventListener("load", dismiss);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${BRAND.businessName}`}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-500 ease-lux ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="px-6 text-center font-display text-display-m font-medium tracking-tight text-ivory">
        {BRAND.businessName}
      </span>
      <span className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-bounce rounded-pill bg-gold [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-pill bg-gold [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-pill bg-gold" />
      </span>
    </div>
  );
}
