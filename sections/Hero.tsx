import { BRAND } from "@/config/brand";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { telHref } from "@/lib/format";

/**
 * Full-viewport hero with an autoplay, muted, looping Cloudinary film behind
 * the brand name, tagline and a single CTA (Document 2 §4, Document 5 §7).
 * The brand is shown as the logo alone. Content anchored slightly left of center.
 */
export function Hero() {
  return (
    <section id="top" className="relative flex h-svh min-h-[640px] w-full items-center overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={BRAND.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="container-lux relative z-10">
        <div className="max-w-2xl">
          {/* The logo alone stands in for the brand name; the h1 stays for screen
              readers and search engines. */}
          <h1 className="sr-only">Bright Gold Jewellery</h1>
          <span className="logo-glow" aria-hidden="true">
            <BrandMark priority className="!h-[clamp(5.5rem,15vw,10rem)]" />
          </span>
          <p className="mt-4 font-sans text-sm tracking-wide text-gold-glow">{BRAND.tagline}</p>
          <p className="mt-4 max-w-xl font-sans text-body-lg text-gold">
            3 Decades of purity, elegance, and unmatched trust in Kodungallur. Celebrate your golden moments with Bright Gold Jewellery.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="#visit-store">Visit Store</Button>
            <Button href={telHref(BRAND.phone)} variant="secondary">
              Call Now
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <span className="flex flex-col items-center gap-2 text-muted" aria-hidden="true">
          <span className="text-caption uppercase tracking-[0.2em]">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gold/60" />
        </span>
      </div>
    </section>
  );
}
