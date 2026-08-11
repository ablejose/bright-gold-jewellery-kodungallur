"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage — STRICT scroll lock.
 *
 * The section is pinned to the viewport across a tall scroll region, so the
 * page does NOT advance past it until the golden lettering AND the golden line
 * are completely filled. The gold fill of both the words and the vertical line
 * is driven by the same scroll progress, so they gold in lockstep; the story is
 * right-aligned to the margin, with the premium golden line at the image's left
 * edge. Only after the animation is fully filled (and a short hold) does the
 * page release and continue scrolling.
 */
const REVEAL_START = 0.08;
const REVEAL_END = 0.85;

export function BrandIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const lineScale = useTransform(
    scrollYProgress,
    [REVEAL_START, REVEAL_END],
    [0, 1],
  );

  return (
    <section id="about" ref={sectionRef} className="relative h-[230vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-14">
        <div className="container-lux w-full">
          <HeritageGallery />

          <div className="mt-8 flex gap-5 md:mt-10 md:gap-8">
            {/* Premium golden line at the image's left edge; fills top-to-bottom
                in lockstep with the words as the pinned section is scrolled. */}
            <div
              className="relative w-[3px] shrink-0 self-stretch overflow-hidden rounded-full bg-white/10"
              aria-hidden="true"
            >
              <motion.div
                style={{ scaleY: lineScale }}
                className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-[#FFF1C4] via-[#F2D28B] to-[#B8892F] shadow-[0_0_14px_rgba(242,210,139,0.55)]"
              />
            </div>

            <div className="flex-1">
              <ScrollRevealStory
                text={BRAND.heritageStory[0]}
                progress={scrollYProgress}
                start={REVEAL_START}
                end={REVEAL_END}
                className="text-right font-malayalam text-[1.7rem] font-medium leading-[1.5] md:text-[2.25rem] md:leading-[1.45]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
