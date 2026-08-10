"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";

/**
 * Heritage gallery. Full-viewport-width cinematic band of real store / team
 * photos (trust signals) that auto-advance ("swap") every 1.5s. No rounded
 * corners; the left and right edges fade into the black background via a
 * horizontal mask. Seamless loop; reduced-motion users see a static first
 * image.
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

  const edgeFade =
    "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ WebkitMaskImage: edgeFade, maskImage: edgeFade }}
    >
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
          <div key={i} className="relative h-[46vh] w-full shrink-0 md:h-[58vh]">
            <Image
              src={src}
              alt={`${BRAND.businessName}, ${BRAND.city}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-[center_38%]"
            />
          </div>
        ))}
      </div>

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
    </div>
  );
}
