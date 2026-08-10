import { BRAND } from "@/config/brand";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage. A full-viewport-width image band of real store / team photos
 * (shown in full, no crop; edges fading into the black background) sits on top,
 * with the Malayalam brand story below it. The story reveals word-by-word in
 * gold as it scrolls into view, and "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a
 * gold-foil brand font. Replaces the previous English heritage copy and the
 * former Chapter 01.
 */
export function BrandIntro() {
  return (
    <section id="about" className="py-16 md:py-24">
      <HeritageGallery />

      <div className="container-lux mt-10 md:mt-14">
        <ScrollRevealStory
          text={BRAND.heritageStory[0]}
          className="mx-auto max-w-4xl text-center font-malayalam text-[1.7rem] font-medium leading-[1.4] md:text-[2.25rem] md:leading-[1.35]"
        />
      </div>
    </section>
  );
}
