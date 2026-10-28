import { BRAND } from "@/config/brand";
import type { RateAd, RatePhoto } from "@/types/brand";

/**
 * Cloudinary URLs for the status-video gallery. Each ad is a segment of a
 * longer video, trimmed (so_/eo_) and cropped to 9:16 on the fly, so the shop
 * only ever uploads full videos.
 */

export const STATUS_WIDTH = 720;
export const STATUS_HEIGHT = 1280;
/** Gallery photos fill this band at the top of the status image. */
export const PHOTO_HEIGHT = 620;

export type RateMedia = { kind: "video"; ad: RateAd } | { kind: "photo"; photo: RatePhoto };

function transform(ad: RateAd, extra: string): string {
  return ad.video.replace("/upload/", `/upload/so_${ad.start},eo_${ad.end},c_fill,g_center,${extra}/`);
}

/** Full-size 9:16 clip with its music, used to make the status video. */
export function adClipUrl(ad: RateAd): string {
  return transform(ad, `w_${STATUS_WIDTH},h_${STATUS_HEIGHT},q_auto`);
}

/** Still frame from the middle of the clip for the gallery card. */
export function adThumbUrl(ad: RateAd): string {
  const middle = Math.round(((ad.start + ad.end) / 2) * 10) / 10;
  return ad.video
    .replace("/upload/", `/upload/so_${middle},c_fill,g_center,w_270,h_480,q_auto/`)
    .replace(/\.mp4$/, ".jpg");
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
  return Math.round((ad.end - ad.start) * 10) / 10;
}
