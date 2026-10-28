import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/Reveal";
import { SharePoster } from "@/components/SharePoster";
import { formatAmount, formatLongDate, todayIST } from "@/lib/goldRate";
import { posterFileName, posterUrl, shareMessage } from "@/lib/rateShare";
import { getLatestRate, getPreviousRate } from "@/lib/rateStore";
import { getSiteUrl } from "@/lib/seo";
import { GRAMS_PER_PAVAN } from "@/types/goldRate";

/**
 * Today's gold rate, right under the hero. Rates come from the admin desk;
 * the section hides itself until the first rate is saved.
 */
export async function GoldRate() {
  const today = todayIST();
  const rate = await getLatestRate(today);
  if (!rate) return null;
  const previous = await getPreviousRate(rate.date);
  const diff = previous ? rate.gold22 - previous.gold22 : null;

  const cards = [
    { label: "22K · 916", value: rate.gold22, unit: "per gram", main: true },
    { label: "1 Pavan · 8g", value: rate.gold22 * GRAMS_PER_PAVAN, unit: "22K", main: true },
    rate.gold24 ? { label: "24K", value: rate.gold24, unit: "per gram", main: false } : null,
    rate.gold18 ? { label: "18K", value: rate.gold18, unit: "per gram", main: false } : null,
    rate.silver ? { label: "Silver", value: rate.silver, unit: "per gram", main: false } : null,
  ].filter((card) => card !== null);

  return (
    <section id="gold-rate" className="border-y border-gold/15 bg-gradient-to-b from-gold/[0.05] to-transparent py-16 md:py-20">
      <div className="container-lux">
        <Reveal>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="label-eyebrow">{rate.date === today ? "Today's Gold Rate" : "Latest Gold Rate"}</span>
              <h2 className="mt-2 font-display text-display-m text-ivory">{formatLongDate(rate.date)}</h2>
            </div>
            {diff !== null ? (
              <p className={`font-sans text-sm ${diff > 0 ? "text-[#7FD69B]" : diff < 0 ? "text-[#F28B8B]" : "text-muted"}`}>
                {diff === 0 ? "No change from previous rate" : `${diff > 0 ? "▲" : "▼"} ₹${formatAmount(Math.abs(diff))} per gram from previous rate`}
              </p>
            ) : null}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`rounded-md border p-5 ${card.main ? "border-gold/60 bg-gold/[0.07]" : "border-border bg-white/[0.02]"}`}
              >
                <p className="font-sans text-caption uppercase tracking-[0.18em] text-muted">{card.label}</p>
                <p className={`mt-2 font-display text-[2rem] leading-none ${card.main ? "text-gold" : "text-ivory"}`}>
                  ₹{formatAmount(card.value)}
                </p>
                <p className="mt-1 font-sans text-xs text-muted">{card.unit}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8">
            <SharePoster
              compact
              posterUrl={posterUrl(rate)}
              fileName={posterFileName(rate)}
              message={shareMessage(rate)}
              pageUrl={`${getSiteUrl(BRAND)}/gold-rate`}
            />
          </div>
          <p className="font-sans text-xs text-muted">Rates are per gram, exclusive of making charges and GST.</p>
        </Reveal>
      </div>
    </section>
  );
}
