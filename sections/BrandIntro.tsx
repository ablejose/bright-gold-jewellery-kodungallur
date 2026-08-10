"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage (pinned scrollytelling). The section pins to the viewport; as
 * you scroll, the Malayalam brand story reveals word-by-word in gold, and only
 * once the last word is gold does the page scroll on. A large auto-swapping
 * gallery of real store / team photos sits on the left; the story is pushed to
 * the right edge. "ബ്രൈറ്റ് ഗോൾഡ്" is highlighted with a gold-foil brand font.
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
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-lux w-full">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-8">
              <HeritageGallery />
            </div>
            <div className="md:col-span-4">
              <ScrollRevealStory
                text={BRAND.heritageStory[0]}
                progress={scrollYProgress}
                start={0.12}
                end={0.85}
                className="font-malayalam text-[1.7rem] font-medium leading-[1.3] md:text-right md:text-[2.25rem] md:leading-[1.25]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
