import Image from "next/image";
import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { telHref } from "@/lib/format";

/**
 * Visit Store (Document 2 §7). A single, full-width storefront photo shown at
 * its natural 3:2 proportions (no portrait crop), plus business details and
 * action buttons. Google Maps is linked, never embedded.
 */
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
          <div className="relative mt-12 aspect-[3/2] w-full overflow-hidden rounded-3xl border border-gold/20 shadow-xl shadow-black/40 ring-1 ring-white/5">
            <Image
              src="/images/visit1.webp"
              alt={`${BRAND.businessName} storefront in ${BRAND.city}`}
              fill
              sizes="(max-width: 1280px) 92vw, 1200px"
              className="object-cover"
              priority
            />
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
