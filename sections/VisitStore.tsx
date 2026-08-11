import Image from "next/image";
import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { telHref } from "@/lib/format";

/**
 * Visit Store (Document 2 §7). A right-to-left auto-scrolling marquee of small
 * storefront / interior photo cards (~1/4 the size of a hero image), with a
 * slight gap between them, plus business details and action buttons. Hovering
 * pauses the scroll. Google Maps is linked, never embedded.
 */
const VISIT_IMAGES = [
  "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453232/bright-gold/visit1.webp",
  "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453233/bright-gold/visit2.webp",
  "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453233/bright-gold/visit3.webp",
];

export function VisitStore() {
  return (
    <section id="visit-store" className="py-24 md:py-32">
      <div className="container-lux">
        <Reveal>
          <SectionHeading
            eyebrow="Come See Us"
            title="Visit Our Store"
            subtitle="Experience timeless craftsmanship in person."
          />
        </Reveal>

        <Reveal>
          <div className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="marquee-rtl flex w-max gap-5">
              {[...VISIT_IMAGES, ...VISIT_IMAGES].map((src, index) => (
                <div key={index} className="w-72 shrink-0">
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-gold/20 shadow-lg shadow-black/40 ring-1 ring-white/5">
                    <Image
                      src={src}
                      alt={`${BRAND.businessName} store view ${(index % VISIT_IMAGES.length) + 1}`}
                      fill
                      sizes="288px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 flex flex-col gap-6 border-t border-border pt-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="font-display text-display-m text-ivory">{BRAND.businessName}</h3>
              <p className="mt-3 max-w-md font-sans text-body text-muted">{BRAND.address}</p>
              <p className="mt-2 font-sans text-body text-muted">{BRAND.openingHours}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href={BRAND.mapsLink} external variant="secondary">
                Get Directions
              </Button>
              <Button href={telHref(BRAND.phone)} variant="primary">
                Call Now
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
