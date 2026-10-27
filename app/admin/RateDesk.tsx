"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SharePoster } from "@/components/SharePoster";
import { formatAmount, formatLongDate, formatRupees, formatWeekday } from "@/lib/goldRate";
import { posterFileName, posterUrl, shareMessage } from "@/lib/rateShare";
import { GRAMS_PER_PAVAN, type GoldRate } from "@/types/goldRate";

interface RateDeskProps {
  initialRates: GoldRate[];
  today: string;
  storageReady: boolean;
  siteUrl: string;
}

interface FormState {
  date: string;
  gold22: string;
  gold18: string;
  gold24: string;
  silver: string;
  note: string;
}

const FIELDS: { key: keyof Omit<FormState, "date" | "note">; label: string; hint: string }[] = [
  { key: "gold18", label: "18K", hint: "per gram" },
  { key: "gold24", label: "24K", hint: "per gram" },
  { key: "silver", label: "Silver", hint: "per gram" },
];

function toForm(date: string, rate: GoldRate | undefined): FormState {
  return {
    date,
    gold22: rate ? String(rate.gold22) : "",
    gold18: rate?.gold18 ? String(rate.gold18) : "",
    gold24: rate?.gold24 ? String(rate.gold24) : "",
    silver: rate?.silver ? String(rate.silver) : "",
    note: rate?.note ?? "",
  };
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 font-sans text-body text-ivory outline-none transition-colors focus:border-gold";

/**
 * The daily routine in one screen: type today's 22K rate (others optional),
 * save, then share the poster to WhatsApp status straight from the phone.
 */
export function RateDesk({ initialRates, today, storageReady, siteUrl }: RateDeskProps) {
  const router = useRouter();
  const [rates, setRates] = useState(initialRates);
  // New day: start from the latest saved numbers so only changes need typing.
  const [form, setForm] = useState<FormState>(() => ({
    ...toForm(today, initialRates.find((r) => r.date === today) ?? initialRates[0]),
    date: today,
    note: initialRates.find((r) => r.date === today)?.note ?? "",
  }));
  const [format, setFormat] = useState<"story" | "square">("story");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const saved = rates.find((rate) => rate.date === form.date);
  const previous = rates.find((rate) => rate.date < form.date);
  const dirty = useMemo(() => {
    const base = toForm(form.date, saved);
    return (Object.keys(base) as (keyof FormState)[]).some((key) => base[key].trim() !== form[key].trim());
  }, [form, saved]);

  const gold22 = Number(form.gold22.replace(/,/g, ""));
  const change = previous && gold22 > 0 ? gold22 - previous.gold22 : null;

  const pickDate = (date: string) => {
    const existing = rates.find((rate) => rate.date === date);
    setForm(existing ? toForm(date, existing) : { ...form, date, note: "" });
    setError("");
  };

  const set = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = (await response.json().catch(() => ({}))) as { rate?: GoldRate; error?: string };
    setBusy(false);
    if (response.status === 401) return router.refresh();
    if (!response.ok || !body.rate) return setError(body.error ?? "Could not save.");
    const rate = body.rate;
    setRates((list) => [rate, ...list.filter((r) => r.date !== rate.date)].sort((a, b) => b.date.localeCompare(a.date)));
    setForm(toForm(rate.date, rate));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2500);
  };

  const remove = async (date: string) => {
    if (!window.confirm(`Delete the rate for ${formatLongDate(date)}?`)) return;
    const response = await fetch(`/api/admin/rates?date=${date}`, { method: "DELETE" });
    if (response.status === 401) return router.refresh();
    if (response.ok) {
      setRates((list) => list.filter((rate) => rate.date !== date));
      if (form.date === date) setForm(toForm(date, undefined));
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 py-4 backdrop-blur-md">
        <div className="container-lux flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl tracking-wide text-gold">Bright Gold</span>
            <span className="hidden font-sans text-caption uppercase tracking-[0.2em] text-muted sm:inline">Rate Desk</span>
          </div>
          <div className="flex items-center gap-5 font-sans text-sm">
            <a href="/gold-rate" target="_blank" className="text-muted transition-colors hover:text-ivory">
              View public page
            </a>
            <button type="button" onClick={signOut} className="text-muted transition-colors hover:text-ivory">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-lux mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-12">
          {!storageReady ? (
            <p className="rounded-md border border-[#F28B8B]/50 bg-[#F28B8B]/10 p-4 font-sans text-sm text-ivory">
              Saving is not set up on this deployment yet. Connect an Upstash Redis database to the Vercel project
              (Storage → Marketplace), then redeploy.
            </p>
          ) : null}

          <form onSubmit={save} className="rounded-card border border-gold/25 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col gap-1">
              <span className="label-eyebrow">{form.date === today ? "Today's rate" : "Edit rate"}</span>
              <h1 className="font-display text-display-m text-ivory">
                {formatLongDate(form.date)} <span className="text-muted">· {formatWeekday(form.date)}</span>
              </h1>
            </div>

            <label className="mt-6 flex max-w-[220px] flex-col gap-2">
              <span className="font-sans text-caption uppercase tracking-[0.2em] text-muted">Date</span>
              <input type="date" value={form.date} max={today} onChange={(e) => e.target.value && pickDate(e.target.value)} className={inputClass} />
            </label>

            <div className="mt-8 rounded-md border border-gold/60 bg-gold/[0.06] p-5">
              <label className="flex flex-col gap-2">
                <span className="font-sans text-caption uppercase tracking-[0.2em] text-gold">22K · 916 — per gram *</span>
                <div className="flex items-center gap-3">
                  <span className="font-display text-display-m text-gold">₹</span>
                  <input
                    inputMode="decimal"
                    required
                    placeholder="0"
                    value={form.gold22}
                    onChange={set("gold22")}
                    className="w-full bg-transparent font-display text-display-l text-gold outline-none placeholder:text-gold/30"
                  />
                </div>
              </label>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-sans text-sm">
                <span className="text-ivory">
                  1 pavan ({GRAMS_PER_PAVAN}g): {gold22 > 0 ? formatRupees(gold22 * GRAMS_PER_PAVAN) : "—"}
                </span>
                {change !== null && previous ? (
                  <span className={change > 0 ? "text-[#7FD69B]" : change < 0 ? "text-[#F28B8B]" : "text-muted"}>
                    {change === 0 ? "Same as" : change > 0 ? `▲ ₹${formatAmount(change)} from` : `▼ ₹${formatAmount(-change)} from`}{" "}
                    {formatLongDate(previous.date)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-2">
                  <span className="font-sans text-caption uppercase tracking-[0.2em] text-muted">
                    {field.label} <span className="normal-case tracking-normal">· {field.hint}</span>
                  </span>
                  <input inputMode="decimal" placeholder="optional" value={form[field.key]} onChange={set(field.key)} className={inputClass} />
                </label>
              ))}
            </div>

            <label className="mt-6 flex flex-col gap-2">
              <span className="font-sans text-caption uppercase tracking-[0.2em] text-muted">
                Poster line <span className="normal-case tracking-normal">· optional, e.g. &ldquo;0% wastage on bangles this week&rdquo;</span>
              </span>
              <input maxLength={80} value={form.note} onChange={set("note")} className={inputClass} />
            </label>

            {error ? <p className="mt-4 font-sans text-sm text-[#F28B8B]">{error}</p> : null}

            <div className="mt-8 flex items-center gap-4">
              <button type="submit" disabled={busy || !form.gold22 || (!dirty && Boolean(saved))} className="btn-primary disabled:opacity-50">
                {busy ? "Saving…" : saved ? "Update rate & poster" : "Save rate & make poster"}
              </button>
              <span className="font-sans text-sm text-gold" aria-live="polite">
                {savedFlash ? "Saved. The website shows it now." : saved && !dirty ? "Saved" : ""}
              </span>
            </div>
          </form>

          <section>
            <h2 className="font-display text-2xl text-ivory">Recent rates</h2>
            {rates.length === 0 ? (
              <p className="mt-4 font-sans text-body text-muted">No rates saved yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse font-sans text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-caption uppercase tracking-[0.15em] text-muted">
                      <th className="py-3 pr-4 font-normal">Date</th>
                      <th className="py-3 pr-4 font-normal">22K / g</th>
                      <th className="py-3 pr-4 font-normal">Pavan</th>
                      <th className="py-3 pr-4 font-normal">Change</th>
                      <th className="py-3 font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate, index) => {
                      const before = rates[index + 1];
                      const diff = before ? rate.gold22 - before.gold22 : null;
                      return (
                        <tr key={rate.date} className={`border-b border-border/60 ${rate.date === form.date ? "bg-gold/[0.06]" : ""}`}>
                          <td className="py-3 pr-4 text-ivory">{formatLongDate(rate.date)}</td>
                          <td className="py-3 pr-4 text-gold">{formatRupees(rate.gold22)}</td>
                          <td className="py-3 pr-4 text-ivory">{formatRupees(rate.gold22 * GRAMS_PER_PAVAN)}</td>
                          <td className={`py-3 pr-4 ${diff && diff > 0 ? "text-[#7FD69B]" : diff && diff < 0 ? "text-[#F28B8B]" : "text-muted"}`}>
                            {diff === null ? "—" : diff === 0 ? "0" : `${diff > 0 ? "▲" : "▼"} ${formatAmount(Math.abs(diff))}`}
                          </td>
                          <td className="py-3 text-right">
                            <button type="button" onClick={() => pickDate(rate.date)} className="mr-4 text-muted hover:text-gold">
                              Edit
                            </button>
                            <button type="button" onClick={() => remove(rate.date)} className="text-muted hover:text-[#F28B8B]">
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ivory">Poster</h2>
            <div className="flex rounded-pill border border-border p-1 font-sans text-xs">
              {(["story", "square"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormat(option)}
                  className={`rounded-pill px-3 py-1.5 transition-colors ${format === option ? "bg-gold text-background" : "text-muted hover:text-ivory"}`}
                >
                  {option === "story" ? "Status 9:16" : "Square 1:1"}
                </button>
              ))}
            </div>
          </div>

          {saved ? (
            <>
              <div className={`relative mx-auto mt-4 overflow-hidden rounded-md border border-gold/30 ${format === "story" ? "aspect-[9/16] max-w-[340px]" : "aspect-square max-w-[420px]"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={posterUrl(saved, format)}
                  src={posterUrl(saved, format)}
                  alt={`Gold rate poster for ${formatLongDate(saved.date)}`}
                  className={`h-full w-full object-cover transition-opacity ${dirty ? "opacity-40" : ""}`}
                />
                {dirty ? (
                  <span className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-md bg-background/90 p-3 text-center font-sans text-sm text-gold">
                    Save to update the poster
                  </span>
                ) : null}
              </div>
              <div className="mt-5">
                <SharePoster
                  posterUrl={posterUrl(saved, format)}
                  fileName={posterFileName(saved)}
                  message={shareMessage(saved)}
                  pageUrl={`${siteUrl}/gold-rate`}
                />
              </div>
            </>
          ) : (
            <div className="mx-auto mt-4 flex aspect-[9/16] max-w-[340px] items-center justify-center rounded-md border border-dashed border-gold/30 p-8 text-center font-sans text-sm text-muted">
              Save the rate for {formatLongDate(form.date)} to make its poster.
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
