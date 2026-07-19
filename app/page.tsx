import { Navbar } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
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
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
