import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { HeritageGallery } from "@/components/HeritageGallery";

/**
 * Our Heritage. A full-width, auto-swapping gallery of real store / team /
 * family photos (trust signals), followed by the brand story rendered in gold.
 * Replaces the previous English heritage copy and the former Chapter 01.
 */
export function BrandIntro() {
  return (
    <section id="about" className="py-16 md:py-24">
      <HeritageGallery />

      <div className="container-lux mt-12 md:mt-16">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
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
      </div>
    </section>
  );
}
