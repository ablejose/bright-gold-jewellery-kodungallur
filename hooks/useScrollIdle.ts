"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks rapid scrolling. Returns true while the user is actively scrolling,
 * then flips back to false after `idleDelay` ms of no scroll activity.
 * Used to hide the floating WhatsApp button during rapid scroll (Document 2 §10).
 */
export function useScrollIdle(idleDelay = 700): boolean {
  const [scrolling, setScrolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolling(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setScrolling(false), idleDelay);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idleDelay]);

  return scrolling;
}
