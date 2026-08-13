"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";

/**
 * Heritage gallery. A margin-aligned, rounded card of real store / team photos
 * (trust signals) that auto-advance ("swap") every 1.5s. The frame matches the
 * photo's own 3:2 proportions so the FULL image renders with no crop. Seamless
 * loop; reduced-motion users see a static first image.
 */
export function HeritageGallery() {
  const images = BRAND.heritageImages;
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  // Auto-swap every 1.5s (paused for reduced-motion users / single image).
  useEffect(() => {
    if (typeof window === "undefined" || count <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), 1500);
    return () => window.clearInterval(id);
  }, [count]);

  // Seamless loop: after sliding onto the cloned first slide, snap back to 0
  // with the transition disabled so the reset is invisible.
  useEffect(() => {
    if (index !== count) {
      if (!animate) {
        const raf = requestAnimationFrame(() => setAnimate(true));
        return () => cancelAnimationFrame(raf);
      }
      return;
    }
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [index, count, animate]);

  if (count === 0) return null;

  const slides = [...images, images[0]];
  const active = index % count;

  return (
    <div className="relative w-full overflow-hidden rounded-card border border-border shadow-xl shadow-black/40 ring-1 ring-white/5">
      <div
        className="flex"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: animate
            ? "transform 750ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
      >
        {slides.map((src, i) => (
          <div key={i} className="relative aspect-[32/15] w-full shrink-0">
            <Image
              src={src}
              alt={`${BRAND.businessName}, ${BRAND.city}`}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              sizes="(max-width: 1280px) 92vw, 1200px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all duration-500 ${
                active === i ? "w-7 bg-gold" : "w-2 bg-ivory/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
