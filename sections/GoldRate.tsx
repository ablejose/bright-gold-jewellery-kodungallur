import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { formatAmount, formatLongDate, todayIST } from "@/lib/goldRate";
import { getLatestRate, getPreviousRate } from "@/lib/rateStore";
import { GRAMS_PER_PAVAN } from "@/types/goldRate";

/** A small up / down triangle with the change in rupees, no wording. */
function ChangeMark({ diff }: { diff: number }) {
  const tint = diff > 0 ? "text-[#7FD69B]" : diff < 0 ? "text-[#F28B8B]" : "text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${tint}`}
      role="img"
      aria-label={diff === 0 ? "No change" : `${diff > 0 ? "Up" : "Down"} ₹${formatAmount(Math.abs(diff))}`}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
        {diff > 0 ? <path d="M5 0.5 9.5 9H0.5z" /> : diff < 0 ? <path d="M5 9.5 0.5 1h9z" /> : <rect x="0.5" y="4" width="9" height="2" />}
      </svg>
      {diff === 0 ? null : <span aria-hidden="true">₹{formatAmount(Math.abs(diff))}</span>}
    </span>
  );
}

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
          <div className="mx-auto max-w-xl rounded-card border border-gold/40 bg-gold/[0.05] p-5 font-sans tabular-nums sm:p-6 md:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="label-eyebrow">{rate.date === today ? "Today's Gold Rate" : "Latest Gold Rate"}</span>
              <span className="text-sm text-muted">{formatLongDate(rate.date)}</span>
            </div>

            {/* One price per row on phones so the figures never touch; two columns from sm up. */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <p className="text-caption uppercase tracking-[0.18em] text-muted">22K · 916 per gram</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-3xl font-semibold leading-none text-gold">₹{formatAmount(rate.gold22)}</span>
                  {diff !== null ? <ChangeMark diff={diff} /> : null}
                </p>
              </div>
              <div className="border-t border-border pt-4 sm:border-t-0 sm:pt-0">
                <p className="text-caption uppercase tracking-[0.18em] text-muted">1 Pavan · 8g</p>
                <p className="mt-1.5 text-3xl font-semibold leading-none text-ivory">
                  ₹{formatAmount(rate.gold22 * GRAMS_PER_PAVAN)}
                </p>
              </div>
            </div>

            {extras.length > 0 ? (
              <dl className="mt-4 grid grid-cols-3 gap-x-3 border-t border-border pt-4 sm:flex sm:gap-x-8">
                {extras.map((item) => (
                  <div key={item.label}>
                    <dt className="text-caption uppercase tracking-[0.18em] text-muted">{item.label}</dt>
                    <dd className="mt-0.5 text-base font-medium text-ivory">₹{formatAmount(item.value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-4 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <span>Per gram, exclusive of making charges and GST.</span>
              <Link href="/gold-rate" className="-my-1 inline-block py-2 text-sm text-gold transition-colors hover:text-ivory">
                Share today&apos;s rate
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
