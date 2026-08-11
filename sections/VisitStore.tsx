import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { StoreImage } from "@/components/StoreImage";
import { Button } from "@/components/Button";
import { telHref } from "@/lib/format";

/**
 * Visit Store (Document 2 §7). A horizontal, swipeable gallery of storefront /
 * team photos sized so ~2.5 images are visible at once while scrolling, plus
 * business details and action buttons. Google Maps is linked, never embedded.
 */
export function VisitStore() {
  // Real store / team photos first, then the storefront set.
  const galleryImages = [...BRAND.heritageImages, ...BRAND.storeImages];

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
          <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {galleryImages.map((src, index) => (
              <div key={index} className="w-[40%] shrink-0 snap-start">
                <StoreImage
                  src={src}
                  alt={`${BRAND.businessName} store view ${index + 1}`}
                />
              </div>
            ))}
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
