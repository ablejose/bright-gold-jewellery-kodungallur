"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage (pinned). The section pins to the viewport so the page does NOT
 * move while you scroll — instead the Malayalam brand story reveals word-by-word
 * in gold. A compact, rounded gallery of real store / team photos sits above the
 * story, and image + story together fill the centered screen. Only once the last
 * word is gold does the page scroll on. "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a
 * gold-foil brand font. Replaces the previous English copy and the former
 * Chapter 01.
 */
export function BrandIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="about" ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 md:gap-8">
        <div className="mx-auto w-full max-w-xl">
          <HeritageGallery />
        </div>

        <ScrollRevealStory
          text={BRAND.heritageStory[0]}
          progress={scrollYProgress}
          start={0.12}
          end={0.8}
          className="mx-auto max-w-2xl text-center font-malayalam text-[1.5rem] font-medium leading-[1.35] md:text-[1.95rem] md:leading-[1.3]"
        />
      </div>
    </section>
  );
}
