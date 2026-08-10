"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage (pinned). The section pins to the viewport so the page does NOT
 * scroll until every word of the Malayalam brand story has turned gold. A
 * margin-aligned, rounded gallery of real store / team photos sits above the
 * story. Only once the last word is gold does the page scroll on.
 * "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a gold-foil brand font. Replaces the
 * previous English copy and the former Chapter 01.
 */
export function BrandIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="about" ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-lux w-full">
          <HeritageGallery />

          <div className="mt-10 md:mt-12">
            <ScrollRevealStory
              text={BRAND.heritageStory[0]}
              progress={scrollYProgress}
              start={0.1}
              end={0.88}
              className="mx-auto max-w-4xl text-center font-malayalam text-[1.7rem] font-medium leading-[1.4] md:text-[2.25rem] md:leading-[1.35]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
