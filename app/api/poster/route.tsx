import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";
import { formatAmount, formatLongDate, formatWeekday, isIsoDate, todayIST } from "@/lib/goldRate";
import { GRAMS_PER_PAVAN, type GoldRate } from "@/types/goldRate";

/**
 * The shareable gold-rate poster as a PNG.
 *
 *   /api/poster                    latest saved rate, 1080x1920 (WhatsApp status)
 *   /api/poster?date=2026-10-27    that day's rate
 *   /api/poster?format=square      1080x1080 (chats, Instagram feed)
 *
 * Poster text is English: the image renderer cannot shape Malayalam conjuncts.
 *
 * Edge runtime: Next 14's Node build of the image renderer cannot find its own
 * files on Windows, so `npm run dev` would fail there. Edge has no filesystem,
 * so fonts load by URL and the rate comes from /api/rates.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

const GOLD = "#F2D28B";
const GOLD_DEEP = "#A9791F";
const IVORY = "#F6F3F0";
const MUTED = "#9E9EAE";
const BG = "#050509";

const SIZES = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;

type Format = keyof typeof SIZES;

async function loadFonts() {
  // Literal URLs so the bundler ships each font with the function.
  const read = (url: URL) => fetch(url).then((response) => response.arrayBuffer());
  const [display600, display700, sans400, sans600, rupee] = await Promise.all([
    read(new URL("../../../assets/fonts/cormorant-garamond-latin-600-normal.woff", import.meta.url)),
    read(new URL("../../../assets/fonts/cormorant-garamond-latin-700-normal.woff", import.meta.url)),
    read(new URL("../../../assets/fonts/inter-latin-400-normal.woff", import.meta.url)),
    read(new URL("../../../assets/fonts/inter-latin-600-normal.woff", import.meta.url)),
    // Just the rupee sign (U+20B9), which the latin subsets lack.
    read(new URL("../../../assets/fonts/inter-600-rupee.ttf", import.meta.url)),
  ]);
  const normal = "normal" as const;
  return [
    { name: "Display", data: display600, weight: 600 as const, style: normal },
    { name: "Display", data: display700, weight: 700 as const, style: normal },
    { name: "Sans", data: sans400, weight: 400 as const, style: normal },
    { name: "Sans", data: sans600, weight: 600 as const, style: normal },
    { name: "Rupee", data: rupee, weight: 600 as const, style: normal },
  ];
}

/** Cloudinary transform: JPEG (the renderer cannot decode WebP), cropped to fit. */
function posterPhoto(url: string, width: number, height: number): string {
  return url.replace("/upload/", `/upload/f_jpg,q_80,c_fill,g_center,w_${width},h_${height}/`);
}

function Rupee({ size }: { size: number }) {
  return <span style={{ fontFamily: "Rupee", fontWeight: 600, fontSize: size * 0.62, marginRight: size * 0.06, marginTop: size * 0.12 }}>₹</span>;
}

function Change({ rate, previous }: { rate: GoldRate | null; previous: GoldRate | null }) {
  if (!rate || !previous) return null;
  const diff = rate.gold22 - previous.gold22;
  const text =
    diff === 0
      ? "No change from previous rate"
      : `${diff > 0 ? "Up" : "Down"} ₹${formatAmount(Math.abs(diff))} / gram from previous rate`;
  return (
    <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: 28, color: diff > 0 ? "#7FD69B" : diff < 0 ? "#F28B8B" : MUTED }}>
      {text}
    </div>
  );
}

function SmallRate({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        padding: "26px 12px",
        borderRadius: 24,
        border: `1.5px solid rgba(242,210,139,0.35)`,
        background: "rgba(242,210,139,0.06)",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: 24, letterSpacing: 4, color: MUTED }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-start", fontFamily: "Display", fontWeight: 700, fontSize: 64, color: IVORY, marginTop: 6 }}>
        <Rupee size={64} />
        {formatAmount(value)}
      </div>
      <div style={{ display: "flex", fontFamily: "Sans", fontSize: 22, color: MUTED }}>per gram</div>
    </div>
  );
}

function Poster({ rate, previous, format }: { rate: GoldRate | null; previous: GoldRate | null; format: Format }) {
  const { width, height } = SIZES[format];
  const story = format === "story";
  const date = rate?.date ?? todayIST();
  const others = [
    rate?.gold24 ? { label: "24K", value: rate.gold24 } : null,
    rate?.gold18 ? { label: "18K", value: rate.gold18 } : null,
    rate?.silver ? { label: "SILVER", value: rate.silver } : null,
  ].filter((item): item is { label: string; value: number } => item !== null);
  const photoHeight = story ? 680 : 0;
  const phones = [BRAND.phone, BRAND.phone2].filter(Boolean).map((p) => (p as string).replace(/^\+91/, "+91 "));

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: `radial-gradient(ellipse at 50% ${story ? "62%" : "45%"}, #2a2010 0%, ${BG} 62%)`,
        color: IVORY,
        position: "relative",
      }}
    >
      {story ? (
        <div style={{ display: "flex", position: "relative", width, height: photoHeight }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterPhoto(BRAND.ratePoster.image, width, photoHeight)} width={width} height={photoHeight} style={{ objectFit: "cover" }} alt="" />
          <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: `linear-gradient(to bottom, rgba(5,5,9,0) 0%, ${BG} 100%)` }} />
        </div>
      ) : null}

      {/* Gold frame */}
      <div style={{ display: "flex", position: "absolute", top: 28, left: 28, right: 28, bottom: 28, border: `2px solid rgba(242,210,139,0.45)`, borderRadius: 36 }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: story ? "0 90px" : "60px 90px 0",
          marginTop: story ? -150 : 0,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Display", fontWeight: 700, fontSize: story ? 92 : 72, color: GOLD, letterSpacing: 1 }}>
          {BRAND.businessName}
        </div>
        <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: story ? 24 : 20, letterSpacing: 9, color: MUTED, marginTop: 4 }}>
          {BRAND.ratePoster.strapline.toUpperCase()}
        </div>

        <div style={{ display: "flex", width: 420, height: 2, marginTop: story ? 40 : 26, background: `linear-gradient(to right, rgba(242,210,139,0), ${GOLD}, rgba(242,210,139,0))` }} />

        <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: story ? 30 : 26, letterSpacing: 10, color: GOLD, marginTop: story ? 40 : 24 }}>
          {"TODAY'S GOLD RATE"}
        </div>
        <div style={{ display: "flex", fontFamily: "Display", fontWeight: 600, fontSize: story ? 52 : 42, color: IVORY, marginTop: story ? 10 : 6 }}>
          {`${formatLongDate(date)} · ${formatWeekday(date)}`}
        </div>

        {/* 22K headline card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginTop: story ? 40 : 24,
            padding: story ? "36px 40px 40px" : "22px 40px 24px",
            borderRadius: 32,
            border: `2px solid ${GOLD}`,
            background: "linear-gradient(160deg, rgba(242,210,139,0.16) 0%, rgba(169,121,31,0.08) 100%)",
          }}
        >
          <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: 28, letterSpacing: 6, color: GOLD }}>
            22 KARAT · 916 GOLD
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", fontFamily: "Display", fontWeight: 700, fontSize: story ? 168 : 124, lineHeight: 1, color: GOLD, marginTop: story ? 14 : 8 }}>
            <Rupee size={story ? 168 : 124} />
            {rate ? formatAmount(rate.gold22) : "— —"}
          </div>
          <div style={{ display: "flex", fontFamily: "Sans", fontSize: story ? 28 : 24, color: MUTED, marginTop: 6 }}>per gram</div>
          <div style={{ display: "flex", width: "70%", height: 1, background: "rgba(242,210,139,0.35)", margin: story ? "24px 0 20px" : "14px 0 12px" }} />
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Sans", fontWeight: 600, fontSize: story ? 40 : 32, color: IVORY }}>
            {`1 Pavan (${GRAMS_PER_PAVAN}g)  ·  ₹${rate ? formatAmount(rate.gold22 * GRAMS_PER_PAVAN) : "—"}`}
          </div>
          <div style={{ display: "flex", marginTop: story ? 14 : 8 }}>
            <Change rate={rate} previous={previous} />
          </div>
        </div>

        {others.length > 0 && story ? (
          <div style={{ display: "flex", gap: 22, width: "100%", marginTop: 30 }}>
            {others.map((item) => (
              <SmallRate key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        ) : null}

        {others.length > 0 && !story ? (
          <div style={{ display: "flex", gap: 34, marginTop: 20, fontFamily: "Sans", fontWeight: 600, fontSize: 28, color: IVORY }}>
            {others.map((item) => (
              <div key={item.label} style={{ display: "flex" }}>
                <span style={{ color: MUTED, marginRight: 10 }}>{item.label}</span>
                {`₹${formatAmount(item.value)}`}
              </div>
            ))}
          </div>
        ) : null}

        {rate?.note ? (
          <div style={{ display: "flex", fontFamily: "Display", fontWeight: 600, fontSize: story ? 46 : 34, color: GOLD, marginTop: story ? 30 : 16, textAlign: "center" }}>
            {rate.note}
          </div>
        ) : null}
      </div>

      {/* Footer: in the flow, pushed to the bottom, so it can never overlap the rates. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: story ? 24 : 14,
          paddingBottom: story ? 70 : 52,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: story ? 34 : 26, color: IVORY, letterSpacing: 1 }}>
          {phones.join("   |   ")}
        </div>
        <div style={{ display: "flex", fontFamily: "Sans", fontSize: story ? 26 : 20, color: MUTED, marginTop: story ? 10 : 6 }}>
          {`North Nada & West Nada, ${BRAND.city}  ·  ${BRAND.ratePoster.website}`}
        </div>
        <div style={{ display: "flex", fontFamily: "Sans", fontSize: story ? 18 : 16, color: GOLD_DEEP, marginTop: story ? 10 : 6 }}>
          Rates are per gram, exclusive of making charges and GST.
        </div>
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const format: Format = params.get("format") === "square" ? "square" : "story";
  const date = params.get("date");

  const lookup = new URL("/api/rates", request.url);
  if (date && isIsoDate(date)) lookup.searchParams.set("date", date);
  const { rate, previous } = (await fetch(lookup, { cache: "no-store" })
    .then((response) => response.json())
    .catch(() => ({ rate: null, previous: null }))) as { rate: GoldRate | null; previous: GoldRate | null };

  const response = new ImageResponse(<Poster rate={rate} previous={previous} format={format} />, {
    ...SIZES[format],
    fonts: await loadFonts(),
  });
  // A versioned URL (?v=updatedAt) never changes, so it can be cached hard.
  response.headers.set(
    "Cache-Control",
    params.has("v") ? "public, max-age=31536000, immutable" : "public, s-maxage=60, stale-while-revalidate=300",
  );
  return response;
}
