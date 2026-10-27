import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { GoldRate } from "@/sections/GoldRate";
import { BrandIntro } from "@/sections/BrandIntro";
import { StoryChapters } from "@/sections/StoryChapters";
import { VisitStore } from "@/sections/VisitStore";
import { Faq } from "@/sections/Faq";
import { Contact } from "@/sections/Contact";
import { FinalCta } from "@/sections/FinalCta";
import { Footer } from "@/sections/Footer";
import { FloatingWhatsApp } from "@/sections/FloatingWhatsApp";

/**
 * Page composition follows the user journey in Document 1 §3:
 * Hero → Brand Story → Story Chapters → Visit Store → FAQ → Contact →
 * Final CTA → Footer. Visit Store appears before FAQ (Document 2 §17).
 * Today's gold rate sits right under the hero.
 */

// Stays static; rebuilt when the admin saves a rate, and at least every 10 min.
export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <GoldRate />
        <BrandIntro />
        <StoryChapters />
        <VisitStore />
        <Faq />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
