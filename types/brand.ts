export interface StoryVideo {
  /** Editorial quote shown in the chapter */
  quote: string;
  /** Supporting paragraph */
  description: string;
  /** Cloudinary video URL */
  video: string;
  /** Optional loop timing windows (seconds). UI never guesses these. */
  segments?: VideoSegments;
}

export interface VideoSegments {
  /** Where this chapter's clip begins playing (seconds). Distinct per chapter
   *  so scrollers see a different part of the film in each section. */
  startAt: number;
  /** End of this chapter's window (seconds). Playback loops back to startAt
   *  when it reaches loopEnd. */
  loopEnd: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage: string;
}

export interface BrandConfig {
  businessName: string;
  tagline: string;
  description: string;

  logo: string;
  favicon: string;

  heroVideo: string;

  storyVideos: StoryVideo[];

  storeImages: string[];

  address: string;
  city: string;
  state: string;
  pincode: string;

  phone: string;
  whatsapp: string;
  email: string;

  mapsLink: string;

  openingHours: string;

  instagram: string;
  facebook: string;
  youtube?: string;

  seo: SeoConfig;

  faq: FaqItem[];

  whatsappMessage: string;
}
