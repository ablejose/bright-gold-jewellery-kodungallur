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

export interface StoreLocation {
  /** Street address line for this shop / branch. */
  address: string;
  /** Optional contact number shown beneath this address (footer). */
  phone?: string;
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

  /** Our Heritage: gold heading shown above the brand story */
  heritageHeading: string;
  /** Our Heritage: brand story paragraphs (Malayalam) rendered in gold */
  heritageStory: string[];
  /** Our Heritage: full-width auto-swapping gallery images */
  heritageImages: string[];

  /** Shop / store addresses, each optionally paired with a contact number. */
  storeAddresses: StoreLocation[];
  city: string;
  state: string;
  pincode: string;

  phone: string;
  /** Optional secondary contact number. Omit or leave empty for a single-line brand. */
  phone2?: string;
  whatsapp: string;
  email: string;

  mapsLink: string;

  openingHours: string;
  /** Optional workshop addresses shown under an "Our Workshops" heading in Visit Store. */
  workshops?: string[];

  instagram: string;
  facebook: string;
  youtube?: string;

  seo: SeoConfig;

  faq: FaqItem[];

  whatsappMessage: string;

  /** Daily gold-rate poster (shared as a WhatsApp status / message image). */
  ratePoster: RatePosterConfig;
}

export interface RatePosterConfig {
  /** Tall product photo for the top of the 9:16 poster (any Cloudinary image). */
  image: string;
  /** Short line under the brand name on the poster. */
  strapline: string;
  /** Website shown in the poster footer, without https://. */
  website: string;
  /** Address lines printed on the poster, one per line, top to bottom. */
  addressLines: string[];
  /** Gallery of short ad clips the admin picks from for the daily status video. */
  ads: RateAd[];
  /** Gallery of photos for a still status image (same rate panel, no motion). */
  photos: RatePhoto[];
}

/**
 * One gallery photo, pre-cropped to the poster's photo window (720x620): the
 * jewellery sits in the clear middle, between the shop name and the rate panel.
 */
export interface RatePhoto {
  /** Stable id stored with the day's rate. Never reuse an id for a different photo. */
  id: string;
  title: string;
  /** Same-origin path under /public, so the canvas can export it. */
  src: string;
}

/**
 * One gallery clip, stored in the repo at public/rate-videos/<id>.mp4 with a
 * still at <id>.jpg, already trimmed and cropped to the 720x620 window.
 */
export interface RateAd {
  /** Stable id (and file name) stored with the day's rate. Never reuse an id for a different clip. */
  id: string;
  title: string;
  /** Seconds; the status video is this long. */
  length: number;
  /** Where the footage came from (licence record). */
  source: string;
}
