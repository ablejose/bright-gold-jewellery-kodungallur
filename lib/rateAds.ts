import { BRAND } from "@/config/brand";
import type { RateAd } from "@/types/brand";

/**
 * Cloudinary URLs for the status-video gallery. Each ad is a segment of a
 * longer video, trimmed (so_/eo_) and cropped to 9:16 on the fly, so the shop
 * only ever uploads full videos.
 */

export const STATUS_WIDTH = 720;
export const STATUS_HEIGHT = 1280;

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

export function adLength(ad: RateAd): number {
  return Math.round((ad.end - ad.start) * 10) / 10;
}
