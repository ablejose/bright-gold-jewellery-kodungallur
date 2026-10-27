/**
 * Pure helpers for gold-rate dates and money. No storage, no brand data.
 */

const IST = "Asia/Kolkata";

/** Today's date in India as YYYY-MM-DD (the shop's calendar day). */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(now);
}

/** True for a well-formed YYYY-MM-DD string. */
export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** "27 October 2026" from YYYY-MM-DD. */
export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "Tuesday" from YYYY-MM-DD. */
export function formatWeekday(date: string): string {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** Indian grouping without the symbol: 58,400. */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

/** Indian grouping with the rupee symbol: ₹58,400. */
export function formatRupees(value: number): string {
  return `₹${formatAmount(value)}`;
}
