import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { HeritageGallery } from "@/components/HeritageGallery";
import { ScrollRevealStory } from "@/components/ScrollRevealStory";

/**
 * Our Heritage. Left: a large, uncropped auto-swapping gallery of real store /
 * team photos (trust signals). Right: gold "our story" heading + the Malayalam
 * brand story, whose words turn gold one-by-one as you scroll ("ബ്രൈറ്റ് ഗോൾഡ്"
 * stays highlighted). Replaces the previous English copy and the former
 * Chapter 01.
 */
export function BrandIntro() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container-lux">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-5 md:gap-12">
          <div className="md:col-span-3">
            <Reveal>
              <HeritageGallery />
            </Reveal>
          </div>

          <div className="md:col-span-2">
            <h2 className="font-display text-display-m font-bold text-gold break-words">
              {BRAND.heritageHeading}
            </h2>
            <ScrollRevealStory
              text={BRAND.heritageStory[0]}
              className="mt-6 font-malayalam text-[1.8rem] font-medium leading-[1.5] md:text-[2.25rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
