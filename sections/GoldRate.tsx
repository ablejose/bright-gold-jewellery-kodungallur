import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { formatAmount, formatLongDate, todayIST } from "@/lib/goldRate";
import { getLatestRate, getPreviousRate } from "@/lib/rateStore";
import { GRAMS_PER_PAVAN } from "@/types/goldRate";

/**
 * Today's gold rate as one small card, right under the hero. Rates come from the
 * admin desk; the section hides itself until the first rate is saved. Standard
 * sans font throughout so every figure is plain and easy to read.
 */
export async function GoldRate() {
  const today = todayIST();
  const rate = await getLatestRate(today);
  if (!rate) return null;
  const previous = await getPreviousRate(rate.date);
  const diff = previous ? rate.gold22 - previous.gold22 : null;

  const extras = [
    rate.gold24 ? { label: "24K", value: rate.gold24 } : null,
    rate.gold18 ? { label: "18K", value: rate.gold18 } : null,
    rate.silver ? { label: "Silver", value: rate.silver } : null,
  ].filter((item) => item !== null);

  return (
    <section id="gold-rate" className="py-10 md:py-12">
      <div className="container-lux">
        <Reveal>
          <div className="mx-auto max-w-xl rounded-card border border-gold/40 bg-gold/[0.05] p-6 font-sans tabular-nums md:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <span className="label-eyebrow">{rate.date === today ? "Today's Gold Rate" : "Latest Gold Rate"}</span>
              <span className="text-sm text-muted">{formatLongDate(rate.date)}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption uppercase tracking-[0.18em] text-muted">22K · 916 per gram</p>
                <p className="mt-1.5 text-3xl font-semibold leading-none text-gold">₹{formatAmount(rate.gold22)}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-[0.18em] text-muted">1 Pavan · 8g</p>
                <p className="mt-1.5 text-3xl font-semibold leading-none text-ivory">
                  ₹{formatAmount(rate.gold22 * GRAMS_PER_PAVAN)}
                </p>
              </div>
            </div>

            {diff !== null ? (
              <p className={`mt-4 text-sm ${diff > 0 ? "text-[#7FD69B]" : diff < 0 ? "text-[#F28B8B]" : "text-muted"}`}>
                {diff === 0 ? "No change from previous rate" : `${diff > 0 ? "▲" : "▼"} ₹${formatAmount(Math.abs(diff))} per gram from previous rate`}
              </p>
            ) : null}

            {extras.length > 0 ? (
              <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-4 text-sm text-muted">
                {extras.map((item) => (
                  <span key={item.label}>
                    {item.label} <span className="text-ivory">₹{formatAmount(item.value)}</span>
                  </span>
                ))}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>Per gram, exclusive of making charges and GST.</span>
              <Link href="/gold-rate" className="text-gold transition-colors hover:text-ivory">
                Share today&apos;s rate
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
