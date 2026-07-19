/**
 * Pure, reusable formatting utilities. No brand data lives here.
 */

/** Strip everything but digits (and a leading +) from a phone/WhatsApp value. */
export function toDialable(value: string): string {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** Build a tel: href from a phone number. */
export function telHref(phone: string): string {
  return `tel:${toDialable(phone)}`;
}

/** Build a wa.me link with an optional prefilled message. */
export function whatsappHref(whatsapp: string, message?: string): string {
  const number = whatsapp.replace(/\D/g, "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Human-readable label for a social URL: strip protocol, "www." and trailing slash. */
export function socialLabel(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/** Derive an @handle from a profile URL (uses the last path segment). */
export function socialHandle(url: string): string {
  const handle = url.replace(/\/+$/, "").split("/").pop() ?? "";
  return handle ? `@${handle}` : url;
}

/**
 * Split a brand/business name into a primary line (the main brand word) and a
 * secondary descriptor line (e.g. "Gold", "Gold and Diamonds", "Jewellery").
 * Only splits multi-word names whose combined letters exceed 7, so short or
 * single-word names stay on a single line.
 */
export function splitBrandName(name: string): { primary: string; secondary: string } {
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/);
  const letterCount = trimmed.replace(/\s+/g, "").length;

  if (words.length > 1 && letterCount > 7) {
    return { primary: words[0], secondary: words.slice(1).join(" ") };
  }

  return { primary: trimmed, secondary: "" };
}
