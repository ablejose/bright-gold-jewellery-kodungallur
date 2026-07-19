# Hayaz Gold & Diamonds — Luxury Jewellery Website

A production-grade, **configuration-driven** luxury jewellery website built on a reusable framework (Next.js App Router + TypeScript + Tailwind + motion). Built to the specification in Documents 1–5 (Foundation, UI/UX, Engineering, Implementation Playbook, Design Bible).

**The entire brand is driven by a single file: [`config/brand.ts`](./config/brand.ts).** To launch a different jewellery brand, edit only that file and the Cloudinary asset URLs — no component code changes.

## Business

- **Name:** Hayaz Gold & Diamonds
- **Tagline:** The Largest Aesthetic Lightweight Jewellery Store in Mannarkkad
- **Location:** Ansari Building, Kodathippadi, Mannarkkad, Kerala 678582
- **Hours:** Mon–Sat 9:30 AM–8:00 PM · Sunday 10:00 AM–7:00 PM
- **WhatsApp:** +91 62358 88916
- **Instagram:** [@hayazgoldanddiamonds](https://www.instagram.com/hayazgoldanddiamonds)
- **Facebook:** [facebook.com/hayazgold](https://www.facebook.com/hayazgold)

## Stack

- Next.js 14 (App Router)
- TypeScript (strict mode, no `any`)
- Tailwind CSS (design tokens centralized)
- `motion/react` for subtle scroll reveals
- `next/font` (Cormorant Garamond + Inter), `next/image`
- Cloudinary for all media (hero film, story videos, storefront images)

## Getting Started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL etc.
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run start        # run the production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

## Project Structure

```
config/brand.ts        # SINGLE SOURCE OF TRUTH — all business data
types/brand.ts         # Shared TypeScript interfaces
lib/                   # Pure utilities (format helpers, SEO/JSON-LD builder)
hooks/                 # Client hooks (scroll state, idle, video loop windows)
components/            # Reusable presentational components
sections/              # Page sections (Navbar, Hero, Story, Visit Store, ...)
app/                   # layout (metadata + JSON-LD + fonts), page, sitemap, robots
styles/                # Global CSS + Tailwind layers
public/icons/          # Logo (SVG)
```

No business content lives inside `components/` or `sections/` — they consume `BRAND` only.

## Page Journey

Hero → Brand Story → 4 Editorial Story Chapters → Visit Store → FAQ → Contact → Final CTA → Footer, plus a floating WhatsApp button. (Visit Store intentionally appears **before** FAQ.)

## Media

All media is served from Cloudinary via HTTPS. To swap a video, update its URL in `config/brand.ts`; if the video needs custom loop timing, add a `segments` object (`transitionStart`, `transitionEnd`, `loopStart`, `loopEnd`, `scrollResume`) — the UI never guesses loop windows.

> **Note:** Only one cinematic video URL was supplied, so it is currently reused across all four story chapters. Replace individual `storyVideos[].video` URLs to differentiate the chapters.

## SEO

Metadata, canonical, Open Graph, Twitter cards, `sitemap.xml`, `robots.txt`, and JSON-LD (Organization, JewelryStore/LocalBusiness, WebSite) are all generated dynamically from `config/brand.ts`. No placeholder metadata.

## FAQ

The FAQ section is data-driven from `BRAND.faq`. It is **empty by default** (per brief) and the section renders nothing until you add `{ question, answer }` items.

## Rebranding a New Store

1. Duplicate the project.
2. Replace values in `config/brand.ts`.
3. Replace the Cloudinary URLs (hero video, story videos, store images, OG image).
4. Replace `public/icons/logo.svg` and the favicon.
5. Deploy.

No component code should require modification.

## Deployment

Recommended: **Vercel** (with Cloudinary for media). Set the environment variables from `.env.example` in your Vercel project settings.

Targets: Lighthouse Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO = 100.
