import { BRAND } from "@/config/brand";
import { formatLongDate, formatRupees } from "@/lib/goldRate";
import { GRAMS_PER_PAVAN, type GoldRate } from "@/types/goldRate";

/** Bump when the poster design changes, so cached old posters are not reused. */
const POSTER_DESIGN = "1";

/** Versioned poster URL: changes whenever the day's rate is re-saved. */
export function posterUrl(rate: GoldRate, format: "story" | "square" = "story"): string {
  const params = new URLSearchParams({ date: rate.date, v: `${rate.updatedAt}.${POSTER_DESIGN}` });
  if (format === "square") params.set("format", "square");
  return `/api/poster?${params.toString()}`;
}

export function posterFileName(rate: GoldRate): string {
  return `bright-gold-rate-${rate.date}.png`;
}

/** The plain-text rate message for WhatsApp. */
export function shareMessage(rate: GoldRate): string {
  const lines = [
    `✨ ${BRAND.businessName}, ${BRAND.city}`,
    `Gold rate · ${formatLongDate(rate.date)}`,
    `22K: ${formatRupees(rate.gold22)}/g · Pavan ${formatRupees(rate.gold22 * GRAMS_PER_PAVAN)}`,
  ];
  if (rate.gold18) lines.push(`18K: ${formatRupees(rate.gold18)}/g`);
  if (rate.silver) lines.push(`Silver: ${formatRupees(rate.silver)}/g`);
  return lines.join("\n");
}
