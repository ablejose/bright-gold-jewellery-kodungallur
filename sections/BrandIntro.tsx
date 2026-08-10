import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { HeritageGallery } from "@/components/HeritageGallery";

/**
 * Our Heritage. Left: gold "our story" heading + Malayalam brand story.
 * Right: an auto-swapping gallery card of real store / team / family photos
 * (trust signals), fully contained within the layout margins. Replaces the
 * previous English heritage copy and the former Chapter 01.
 */
export function BrandIntro() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container-lux">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div>
              <h2 className="font-malayalam text-3xl font-semibold text-gold md:text-4xl">
                {BRAND.heritageHeading}
              </h2>
              <div className="mt-6 flex flex-col gap-5">
                {BRAND.heritageStory.map((paragraph, index) => (
                  <p
                    key={index}
                    className="font-malayalam text-[1rem] font-medium leading-[1.85] text-gold/90 md:text-[1.0625rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <HeritageGallery />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
