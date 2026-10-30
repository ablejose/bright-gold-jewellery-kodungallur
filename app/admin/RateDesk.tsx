"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/config/brand";
import { SharePoster } from "@/components/SharePoster";
import { formatAmount, formatLongDate, formatRupees, formatWeekday } from "@/lib/goldRate";
import { adClipUrl, adLength, adThumbUrl, findMedia, mediaTitle, type RateMedia } from "@/lib/rateAds";
import { posterFileName, posterUrl, shareMessage } from "@/lib/rateShare";
import {
  canMakeStatusVideo,
  DEFAULT_MUSIC_URL,
  makeStatusImage,
  makeStatusVideo,
  type StatusVideoResult,
} from "@/lib/statusVideo";
import { GRAMS_PER_PAVAN, type GoldRate } from "@/types/goldRate";
import { StatusPreview } from "./StatusPreview";

interface RateDeskProps {
  initialRates: GoldRate[];
  today: string;
  storageReady: boolean;
  siteUrl: string;
}

interface FormState {
  date: string;
  adId: string;
  gold22: string;
  gold18: string;
  gold24: string;
  silver: string;
  note: string;
}

const ADS = BRAND.ratePoster.ads;
const PHOTOS = BRAND.ratePoster.photos;
type Tab = RateMedia["kind"];

const EXTRA_FIELDS: { key: "gold18" | "gold24" | "silver"; label: string }[] = [
  { key: "gold18", label: "18K" },
  { key: "gold24", label: "24K" },
  { key: "silver", label: "Silver" },
];

function toForm(date: string, rate: GoldRate | undefined, adId?: string): FormState {
  return {
    date,
    adId: rate?.adId ?? adId ?? ADS[0].id,
    gold22: rate ? String(rate.gold22) : "",
    gold18: rate?.gold18 ? String(rate.gold18) : "",
    gold24: rate?.gold24 ? String(rate.gold24) : "",
    silver: rate?.silver ? String(rate.silver) : "",
    note: rate?.note ?? "",
  };
}

const toNumber = (value: string) => {
  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

// Without a database the desk still works: recent rates stay in this browser, which is
// all the poster needs for its "since yesterday" line.
const LOCAL_KEY = "bright-gold:rates";

function readLocalRates(): GoldRate[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]") as GoldRate[];
    return Array.isArray(list) ? list.filter((rate) => rate?.date && rate.gold22 > 0) : [];
  } catch {
    return [];
  }
}

function writeLocalRates(list: GoldRate[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 60)));
  } catch {
    // Private mode or full storage: the file is still made, only the history is lost.
  }
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 font-sans text-body text-ivory outline-none transition-colors focus:border-gold";

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-gold/25 bg-white/[0.03] p-5 md:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-gold font-sans text-sm font-semibold text-background">
          {number}
        </span>
        <h2 className="font-display text-2xl text-ivory md:text-[1.75rem]">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * The daily routine on one phone screen:
 *   1. pick an ad video or a photo from the gallery (two tabs)
 *   2. type today's rate
 *   3. Done → the status video / image is made → Share to WhatsApp (status or chat)
 */
export function RateDesk({ initialRates, today, storageReady, siteUrl }: RateDeskProps) {
  const router = useRouter();
  const [rates, setRates] = useState(initialRates);
  // New day: start from the latest numbers and video so only changes need typing.
  const [form, setForm] = useState<FormState>(() => {
    const saved = initialRates.find((r) => r.date === today);
    return saved ? toForm(today, saved) : { ...toForm(today, initialRates[0]), date: today, note: "" };
  });
  const [busy, setBusy] = useState<"" | "saving" | "recording">("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(StatusVideoResult & { url: string; key: string }) | null>(null);
  const [canRecord, setCanRecord] = useState(true);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => setCanRecord(canMakeStatusVideo()), []);

  useEffect(() => {
    if (storageReady) return;
    const local = readLocalRates().sort((a, b) => b.date.localeCompare(a.date));
    if (local.length === 0) return;
    setRates(local);
    setForm((current) => {
      const existing = local.find((rate) => rate.date === current.date);
      return existing ? toForm(current.date, existing) : { ...toForm(current.date, local[0]), note: "" };
    });
  }, [storageReady]);

  const saved = rates.find((rate) => rate.date === form.date);
  const previous = rates.find((rate) => rate.date < form.date);
  const media: RateMedia = findMedia(form.adId) ?? { kind: "video", ad: ADS[0] };
  const [tab, setTab] = useState<Tab>(media.kind);
  const isPhoto = media.kind === "photo";
  const gold22 = toNumber(form.gold22);
  const change = previous && gold22 ? gold22 - previous.gold22 : null;
  const formKey = JSON.stringify(form);

  const dirty = useMemo(() => {
    if (!saved) return true;
    const base = toForm(form.date, saved);
    return (Object.keys(base) as (keyof FormState)[]).some((key) => base[key].trim() !== form[key].trim());
  }, [form, saved]);

  const overlay = {
    date: form.date,
    gold22: gold22 ?? 0,
    gold18: toNumber(form.gold18),
    gold24: toNumber(form.gold24),
    silver: toNumber(form.silver),
    note: form.note.trim() || undefined,
    change,
  };

  // A finished video belongs to the exact form it was made from.
  const ready = result && result.key === formKey ? result : null;

  useEffect(() => {
    if (!ready) return;
    setCanShareFiles(typeof navigator.canShare === "function" && navigator.canShare({ files: [ready.file] }));
  }, [ready]);

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError("");
  };

  const pickDate = (date: string) => {
    const existing = rates.find((rate) => rate.date === date);
    setForm(existing ? toForm(date, existing) : { ...form, date, note: "" });
    const kind = findMedia(existing?.adId)?.kind;
    if (kind) setTab(kind);
    setError("");
  };

  const done = async () => {
    // Created inside the tap, so the browser lets the video's music be recorded.
    if (!isPhoto && !audioRef.current && typeof AudioContext !== "undefined") audioRef.current = new AudioContext();
    if (!isPhoto) void audioRef.current?.resume();

    setError("");
    let rate = saved;
    if (dirty && !storageReady) {
      const local: GoldRate = {
        date: form.date,
        adId: form.adId,
        gold22: toNumber(form.gold22) ?? 0,
        gold18: toNumber(form.gold18),
        gold24: toNumber(form.gold24),
        silver: toNumber(form.silver),
        note: form.note.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      rate = local;
      const next = [local, ...rates.filter((r) => r.date !== local.date)].sort((a, b) => b.date.localeCompare(a.date));
      setRates(next);
      writeLocalRates(next);
    } else if (dirty) {
      setBusy("saving");
      const response = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as { rate?: GoldRate; error?: string };
      if (response.status === 401) {
        setBusy("");
        return router.refresh();
      }
      if (!response.ok || !body.rate) {
        setBusy("");
        return setError(body.error ?? "Could not save.");
      }
      rate = body.rate;
      const savedRate = body.rate;
      setRates((list) =>
        [savedRate, ...list.filter((r) => r.date !== savedRate.date)].sort((a, b) => b.date.localeCompare(a.date)),
      );
    }
    if (!rate || (!isPhoto && !canRecord)) {
      setBusy("");
      return;
    }

    setBusy("recording");
    setProgress(0);
    try {
      const fileName = `bright-gold-rate-${rate.date}`;
      const made =
        media.kind === "photo"
          ? await makeStatusImage({ photoSrc: media.photo.src, data: overlay, fileName })
          : await makeStatusVideo({
              clipUrl: adClipUrl(media.ad),
              data: overlay,
              fileName,
              // Every video gets the same light background music.
              audio: audioRef.current ?? undefined,
              musicUrl: DEFAULT_MUSIC_URL,
              onProgress: setProgress,
            });
      setResult({ ...made, url: URL.createObjectURL(made.file), key: formKey });
    } catch (problem) {
      setError((problem as Error).message);
    }
    setBusy("");
  };

  const shareVideo = async () => {
    if (!ready) return;
    try {
      await navigator.share({ files: [ready.file] });
    } catch (problem) {
      if ((problem as Error).name !== "AbortError") downloadVideo();
    }
  };

  const downloadVideo = () => {
    if (!ready) return;
    const link = document.createElement("a");
    link.href = ready.url;
    link.download = ready.file.name;
    link.click();
  };

  const remove = async (date: string) => {
    if (!window.confirm(`Delete the rate for ${formatLongDate(date)}?`)) return;
    if (!storageReady) {
      const next = rates.filter((rate) => rate.date !== date);
      setRates(next);
      writeLocalRates(next);
      if (form.date === date) setForm(toForm(date, undefined, form.adId));
      return;
    }
    const response = await fetch(`/api/admin/rates?date=${date}`, { method: "DELETE" });
    if (response.status === 401) return router.refresh();
    if (response.ok) {
      setRates((list) => list.filter((rate) => rate.date !== date));
      if (form.date === date) setForm(toForm(date, undefined, form.adId));
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
              Public page
            </a>
            <button type="button" onClick={signOut} className="text-muted transition-colors hover:text-ivory">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container-lux mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
        <div className="flex flex-col gap-6">
          {!storageReady ? (
            <p className="rounded-md border border-[#F28B8B]/50 bg-[#F28B8B]/10 p-4 font-sans text-sm text-ivory">
              Videos and images download as usual. Recent rates are kept on this device only, and the
              website&apos;s rate strip stays hidden until a database is connected.
            </p>
          ) : null}

          <div>
            <p className="label-eyebrow">{form.date === today ? "Today" : "Editing"}</p>
            <h1 className="mt-1 font-display text-display-m text-ivory">
              {formatLongDate(form.date)} <span className="text-muted">· {formatWeekday(form.date)}</span>
            </h1>
          </div>

          <Step number={1} title={tab === "photo" ? "Choose today's image" : "Choose today's video"}>
            <div role="tablist" className="mb-4 inline-flex rounded-pill border border-border p-1 font-sans text-sm">
              {(
                [
                  ["video", `Videos (${ADS.length})`],
                  ["photo", `Images (${PHOTOS.length})`],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`rounded-pill px-5 py-2 transition-colors ${tab === key ? "bg-gold text-background" : "text-muted hover:text-ivory"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "photo" ? (
              <div className="grid max-h-[62vh] grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4">
                {PHOTOS.map((item) => {
                  const selected = item.id === form.adId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => update({ adId: item.id })}
                      aria-pressed={selected}
                      title={item.title}
                      className={`relative aspect-[36/31] overflow-hidden rounded-md border-2 transition-all ${
                        selected ? "border-gold shadow-[0_0_24px_rgba(242,210,139,0.35)]" : "border-transparent opacity-85 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.src} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      {selected ? (
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-pill bg-gold font-sans text-xs font-bold text-background">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div
              className={`grid max-h-[62vh] grid-cols-3 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-4 ${tab === "photo" ? "hidden" : ""}`}
            >
              {ADS.map((item) => {
                const selected = item.id === form.adId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => update({ adId: item.id })}
                    aria-pressed={selected}
                    title={item.title}
                    className={`group relative aspect-[36/31] overflow-hidden rounded-md border-2 text-left transition-all ${
                      selected ? "border-gold shadow-[0_0_24px_rgba(242,210,139,0.35)]" : "border-transparent opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={adThumbUrl(item)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1 pt-5">
                      <span className="block truncate font-sans text-[11px] font-medium leading-tight text-ivory">{item.title}</span>
                      <span className="block font-sans text-[10px] text-muted">{adLength(item)} sec</span>
                    </span>
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-pill bg-gold font-sans text-xs font-bold text-background">
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Step>

          <Step number={2} title="Today's gold rate">
            <label className="flex flex-col gap-2 rounded-md border border-gold/60 bg-gold/[0.06] p-4">
              <span className="font-sans text-caption uppercase tracking-[0.2em] text-gold">22K · 916 — per gram</span>
              <div className="flex items-center gap-3">
                <span className="font-display text-display-m text-gold">₹</span>
                <input
                  inputMode="decimal"
                  placeholder="0"
                  value={form.gold22}
                  onChange={(e) => update({ gold22: e.target.value })}
                  className="w-full bg-transparent font-display text-display-l text-gold outline-none placeholder:text-gold/30"
                />
              </div>
              <span className="flex flex-wrap gap-x-5 gap-y-1 font-sans text-sm">
                <span className="text-ivory">1 pavan: {gold22 ? formatRupees(gold22 * GRAMS_PER_PAVAN) : "—"}</span>
                {change !== null && previous ? (
                  <span className={change > 0 ? "text-[#7FD69B]" : change < 0 ? "text-[#F28B8B]" : "text-muted"}>
                    {change === 0 ? "Same as" : change > 0 ? `▲ ₹${formatAmount(change)} from` : `▼ ₹${formatAmount(-change)} from`}{" "}
                    {formatLongDate(previous.date)}
                  </span>
                ) : null}
              </span>
            </label>

            {/* Closed by default; the saved 18K / 24K / silver values still apply. */}
            <details className="group mt-4">
              <summary className="cursor-pointer list-none font-sans text-sm text-muted hover:text-ivory">
                <span className="group-open:hidden">+ 18K, 24K, silver, offer line, other date (optional)</span>
                <span className="hidden group-open:inline">− Optional extras</span>
              </summary>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {EXTRA_FIELDS.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1.5">
                    <span className="font-sans text-caption uppercase tracking-[0.15em] text-muted">{field.label} / g</span>
                    <input
                      inputMode="decimal"
                      placeholder="—"
                      value={form[field.key]}
                      onChange={(e) => update({ [field.key]: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
              <label className="mt-3 flex flex-col gap-1.5">
                <span className="font-sans text-caption uppercase tracking-[0.15em] text-muted">Offer line</span>
                <input
                  maxLength={60}
                  placeholder="e.g. 0% wastage on bangles this week"
                  value={form.note}
                  onChange={(e) => update({ note: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="mt-3 flex max-w-[220px] flex-col gap-1.5">
                <span className="font-sans text-caption uppercase tracking-[0.15em] text-muted">Date</span>
                <input type="date" value={form.date} max={today} onChange={(e) => e.target.value && pickDate(e.target.value)} className={inputClass} />
              </label>
            </details>
          </Step>
        </div>

        {/* Preview + Done + Share. On phones this comes right after step 2. */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:row-span-2 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-gold font-sans text-sm font-semibold text-background">
              3
            </span>
            <h2 className="font-display text-2xl text-ivory md:text-[1.75rem]">{ready ? "Share it" : "Preview & done"}</h2>
          </div>

          <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-md border border-gold/30 bg-black">
            {ready && ready.format === "jpg" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ready.url} alt="Status image" className="aspect-[9/16] w-full" />
            ) : ready ? (
              <video src={ready.url} controls playsInline autoPlay muted loop className="aspect-[9/16] w-full" />
            ) : (
              <StatusPreview
                media={media.kind === "photo" ? { kind: "photo", src: media.photo.src } : { kind: "video", src: adClipUrl(media.ad) }}
                data={overlay}
                className="aspect-[9/16] w-full"
              />
            )}
          </div>

          {error ? <p className="font-sans text-sm text-[#F28B8B]">{error}</p> : null}

          {ready ? (
            <div className="flex flex-col gap-3">
              <p className="text-center font-sans text-sm text-gold">
                {ready.format === "jpg"
                  ? "Saved · image ready"
                  : `Saved · video ready${ready.withMusic ? " with music" : ""}`}
                {ready.format === "webm" ? " · WebM: if WhatsApp refuses it, use the poster below" : ""}
              </p>
              {canShareFiles ? (
                <button type="button" onClick={shareVideo} className="btn-primary w-full">
                  Share to WhatsApp status / chat
                </button>
              ) : null}
              <button type="button" onClick={downloadVideo} className={`${canShareFiles ? "btn-secondary" : "btn-primary"} w-full`}>
                {ready.format === "jpg" ? "Download image" : "Download video"}
              </button>
              {!canShareFiles ? (
                <p className="text-center font-sans text-xs text-muted">
                  On a phone this button opens WhatsApp directly. On a computer, download and send it from WhatsApp.
                </p>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={done}
              disabled={Boolean(busy) || !gold22}
              className="btn-primary relative w-full overflow-hidden disabled:opacity-60"
            >
              {busy === "recording" ? (
                <span className="absolute inset-y-0 left-0 bg-ivory/40 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              ) : null}
              <span className="relative">
                {busy === "saving"
                  ? "Saving…"
                  : busy === "recording"
                    ? isPhoto
                      ? "Making image…"
                      : `Making video… ${Math.round(progress * 100)}%`
                    : !gold22
                      ? "Enter the 22K rate"
                      : isPhoto
                        ? "Done — make status image"
                        : canRecord
                          ? "Done — make status video"
                          : "Done — save rate"}
              </span>
            </button>
          )}
          {busy === "recording" && media.kind === "video" ? (
            <p className="text-center font-sans text-xs text-muted">
              Keep this screen open — it records in real time ({adLength(media.ad)} sec).
            </p>
          ) : null}
          {!canRecord && !isPhoto ? (
            <p className="text-center font-sans text-xs text-muted">This browser cannot make videos; the poster image below still works.</p>
          ) : null}

          {saved && !dirty && storageReady ? (
            <details className="rounded-md border border-border p-4">
              <summary className="cursor-pointer font-sans text-sm text-muted hover:text-ivory">Other ways to share</summary>
              <div className="mt-4">
                <SharePoster
                  compact
                  posterUrl={posterUrl(saved)}
                  fileName={posterFileName(saved)}
                  message={shareMessage(saved)}
                  pageUrl={`${siteUrl}/gold-rate`}
                />
              </div>
            </details>
          ) : null}
        </aside>

        <section className="lg:col-start-1">
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
                    <th className="py-3 pr-4 font-normal">Change</th>
                    <th className="py-3 pr-4 font-normal">Video / image</th>
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
                        <td className={`py-3 pr-4 ${diff && diff > 0 ? "text-[#7FD69B]" : diff && diff < 0 ? "text-[#F28B8B]" : "text-muted"}`}>
                          {diff === null ? "—" : diff === 0 ? "0" : `${diff > 0 ? "▲" : "▼"} ${formatAmount(Math.abs(diff))}`}
                        </td>
                        <td className="py-3 pr-4 text-muted">{mediaTitle(rate.adId) ?? "—"}</td>
                        <td className="py-3 text-right">
                          <button type="button" onClick={() => pickDate(rate.date)} className="mr-4 text-muted hover:text-gold">
                            Open
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
      </main>
    </div>
  );
}
