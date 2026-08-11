"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage. A single margin-aligned, rounded store photo on top, with the
 * Malayalam brand story below it — right-aligned to the margin and led by a
 * premium golden line at the image's left edge that fills with gold in step
 * with the words as the story scrolls into view. Normal (unpinned) scroll.
 * "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a gold-foil brand font.
 */
export function BrandIntro() {
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.9", "end 0.5"],
  });

  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container-lux">
        <HeritageGallery />

        <div className="mt-10 flex gap-4 md:mt-14 md:gap-8">
          {/* Premium golden line at the image's left edge; fills top-to-bottom
              in sync with the words turning gold. */}
          <div
            className="relative w-[3px] shrink-0 self-stretch overflow-hidden rounded-full bg-white/10"
            aria-hidden="true"
          >
            <motion.div
              style={{ scaleY: scrollYProgress }}
              className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-[#FFF1C4] via-[#F2D28B] to-[#B8892F] shadow-[0_0_14px_rgba(242,210,139,0.55)]"
            />
          </div>

          <div ref={textRef} className="flex-1">
            <ScrollRevealStory
              text={BRAND.heritageStory[0]}
              progress={scrollYProgress}
              className="text-right font-malayalam text-[1.4rem] font-medium leading-[1.55] break-words sm:text-[1.7rem] md:text-[2.25rem] md:leading-[1.45]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
