"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage (pinned scrollytelling). A full-viewport-width image band of
 * real store / team photos (edges fading into the black background) sits on
 * top, with the Malayalam brand story below it. The section pins while the
 * story reveals word-by-word in gold; only once the last word is gold does the
 * page scroll on. "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a gold-foil brand font.
 * Replaces the previous English heritage copy and the former Chapter 01.
 */
export function BrandIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="about" ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 overflow-hidden md:gap-12">
        <HeritageGallery />

        <div className="container-lux w-full">
          <ScrollRevealStory
            text={BRAND.heritageStory[0]}
            progress={scrollYProgress}
            start={0.15}
            end={0.85}
            className="mx-auto max-w-4xl text-center font-malayalam text-[1.7rem] font-medium leading-[1.35] md:text-[2.25rem] md:leading-[1.3]"
          />
        </div>
      </div>
    </section>
  );
}
