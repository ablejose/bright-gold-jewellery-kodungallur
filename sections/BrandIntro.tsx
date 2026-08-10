import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { HeritageGallery } from "@/components/HeritageGallery";

/**
 * Our Heritage. Left: a large, uncropped auto-swapping gallery of real store /
 * team / family photos (trust signals). Right (narrower column): gold "our
 * story" heading sized like the chapter headings + the Malayalam brand story.
 * Replaces the previous English heritage copy and the former Chapter 01.
 */
export function BrandIntro() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container-lux">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3 md:gap-12">
          <div className="md:col-span-2">
            <Reveal>
              <HeritageGallery />
            </Reveal>
          </div>

          <div className="md:col-span-1">
            <Reveal delay={0.1}>
              <h2 className="font-display text-display-m font-bold text-gold break-words">
                {BRAND.heritageHeading}
              </h2>
              <div className="mt-6 flex flex-col gap-5">
                {BRAND.heritageStory.map((paragraph, index) => (
                  <p
                    key={index}
                    className="font-malayalam text-body-lg font-medium leading-[1.85] text-gold/90"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
