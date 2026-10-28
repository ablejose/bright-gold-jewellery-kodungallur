import { BRAND } from "@/config/brand";
import type { RateAd, RatePhoto } from "@/types/brand";

/**
 * The status gallery: clips in public/rate-videos and photos in
 * public/rate-photos, both pre-cut to the 720x620 window at the top of the
 * status. Served from the site itself (same origin), so the canvas can record
 * them without any cross-origin setup.
 */

export const STATUS_WIDTH = 720;
export const STATUS_HEIGHT = 1280;
/** Gallery photos fill this band at the top of the status image. */
export const PHOTO_HEIGHT = 620;

export type RateMedia = { kind: "video"; ad: RateAd } | { kind: "photo"; photo: RatePhoto };

/** The clip (with music, for the shop's own footage) used to make the status video. */
export function adClipUrl(ad: RateAd): string {
  return `/rate-videos/${ad.id}.mp4`;
}

/** Still frame from the middle of the clip for the gallery card. */
export function adThumbUrl(ad: RateAd): string {
  return `/rate-videos/${ad.id}.jpg`;
}

export function findAd(id: string | undefined): RateAd | undefined {
  return BRAND.ratePoster.ads.find((ad) => ad.id === id);
}

export function findPhoto(id: string | undefined): RatePhoto | undefined {
  return BRAND.ratePoster.photos.find((photo) => photo.id === id);
}

/** The day's chosen gallery item, whichever tab it came from. */
export function findMedia(id: string | undefined): RateMedia | undefined {
  const ad = findAd(id);
  if (ad) return { kind: "video", ad };
  const photo = findPhoto(id);
  return photo ? { kind: "photo", photo } : undefined;
}

export function mediaTitle(id: string | undefined): string | undefined {
  const media = findMedia(id);
  return media?.kind === "video" ? media.ad.title : media?.photo.title;
}

export function adLength(ad: RateAd): number {
  return ad.length;
}
