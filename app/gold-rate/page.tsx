import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { SharePoster } from "@/components/SharePoster";
import { FloatingWhatsApp } from "@/sections/FloatingWhatsApp";
import { formatAmount, formatLongDate, formatRupees, formatWeekday, todayIST } from "@/lib/goldRate";
import { posterFileName, posterUrl, shareMessage } from "@/lib/rateShare";
import { getLatestRate, listRates } from "@/lib/rateStore";
import { getSiteUrl } from "@/lib/seo";
import { GRAMS_PER_PAVAN } from "@/types/goldRate";

// Rebuilt whenever the admin saves (revalidatePath), and at least every 10 min.
export const revalidate = 600;

/**
 * /gold-rate — the link that goes out on WhatsApp. Its link preview is the
 * day's poster, so a forwarded link looks like the status image.
 */
export async function generateMetadata(): Promise<Metadata> {
  const rate = await getLatestRate(todayIST());
  const title = `Today's Gold Rate in ${BRAND.city}`;
  const description = rate
    ? `22K gold ${formatRupees(rate.gold22)}/g · 1 pavan ${formatRupees(rate.gold22 * GRAMS_PER_PAVAN)} on ${formatLongDate(rate.date)} at ${BRAND.businessName}, ${BRAND.city}.`
    : `Daily 22K gold rate at ${BRAND.businessName}, ${BRAND.city}.`;
  const image = rate ? posterUrl(rate, "square") : BRAND.seo.ogImage;
  return {
    title,
    description,
    alternates: { canonical: "/gold-rate" },
    openGraph: { title, description, url: "/gold-rate", images: [{ url: image, width: 1080, height: 1080 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function GoldRatePage() {
  const rates = await listRates(14);
  const today = todayIST();
  const rate = rates.find((r) => r.date <= today) ?? null;

  return (
    <>
      <header className="border-b border-border py-5">
        <div className="container-lux flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wide text-gold">
            Bright Gold
          </Link>
          <Link href="/#visit-store" className="font-sans text-sm text-muted hover:text-ivory">
            Visit store
          </Link>
        </div>
      </header>

      <main className="container-lux grid grid-cols-[minmax(0,1fr)] gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <span className="label-eyebrow">{rate?.date === today ? "Today's Gold Rate" : "Latest Gold Rate"}</span>
          <h1 className="mt-3 font-display text-display-l text-ivory">
            {rate ? formatLongDate(rate.date) : "Updated every morning"}
          </h1>
          {rate ? <p className="mt-1 font-sans text-body text-muted">{formatWeekday(rate.date)} · {BRAND.businessName}, {BRAND.city}</p> : null}

          {rate ? (
            <>
              <div className="mt-8 rounded-card border border-gold/60 bg-gold/[0.06] p-6 md:p-8">
                <p className="font-sans text-caption uppercase tracking-[0.2em] text-gold">22 Karat · 916 Gold</p>
                <p className="mt-2 font-display text-display-xl text-gold-sweep">₹{formatAmount(rate.gold22)}</p>
                <p className="font-sans text-body text-muted">per gram</p>
                <p className="mt-4 border-t border-gold/25 pt-4 font-sans text-body-lg text-ivory">
                  1 Pavan ({GRAMS_PER_PAVAN}g): <span className="text-gold">{formatRupees(rate.gold22 * GRAMS_PER_PAVAN)}</span>
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  { label: "24K", value: rate.gold24 },
                  { label: "18K", value: rate.gold18 },
                  { label: "Silver", value: rate.silver },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div key={item.label} className="rounded-md border border-border bg-white/[0.02] p-4">
                      <p className="font-sans text-caption uppercase tracking-[0.18em] text-muted">{item.label}</p>
                      <p className="mt-1 font-display text-2xl text-ivory">{formatRupees(item.value as number)}</p>
                      <p className="font-sans text-xs text-muted">per gram</p>
                    </div>
                  ))}
              </div>

              {rate.note ? <p className="mt-6 font-display text-2xl text-gold">{rate.note}</p> : null}

              <div className="mt-8">
                <SharePoster
                  posterUrl={posterUrl(rate)}
                  fileName={posterFileName(rate)}
                  message={shareMessage(rate)}
                  pageUrl={`${getSiteUrl(BRAND)}/gold-rate`}
                />
              </div>
              <p className="font-sans text-xs text-muted">Rates are per gram, exclusive of making charges and GST.</p>
            </>
          ) : (
            <p className="mt-6 font-sans text-body text-muted">Today&rsquo;s rate will be posted here shortly. Call or WhatsApp us for the current rate.</p>
          )}

          {rates.length > 1 ? (
            <section className="mt-14">
              <h2 className="font-display text-2xl text-ivory">Last two weeks</h2>
              <ul className="mt-4 divide-y divide-border border-y border-border font-sans text-sm">
                {rates.map((item, index) => {
                  const before = rates[index + 1];
                  const diff = before ? item.gold22 - before.gold22 : null;
                  return (
                    <li key={item.date} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-muted">{formatLongDate(item.date)}</span>
                      <span className="flex items-center gap-4">
                        {diff !== null && diff !== 0 ? (
                          <span className={diff > 0 ? "text-[#7FD69B]" : "text-[#F28B8B]"}>
                            {diff > 0 ? "▲" : "▼"} {formatAmount(Math.abs(diff))}
                          </span>
                        ) : null}
                        <span className="text-ivory">{formatRupees(item.gold22)}/g</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>

        {rate ? (
          <aside className="lg:sticky lg:top-8 lg:self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl(rate)}
              alt={`${BRAND.businessName} gold rate poster for ${formatLongDate(rate.date)}`}
              className="mx-auto w-full max-w-[340px] rounded-md border border-gold/30 shadow-2xl shadow-black/60"
            />
          </aside>
        ) : null}
      </main>
      <FloatingWhatsApp />
    </>
  );
}
