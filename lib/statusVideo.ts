"use client";

import { BRAND } from "@/config/brand";
import { displayPhone } from "@/lib/format";
import { formatAmount, formatFullDate } from "@/lib/goldRate";
import { PHOTO_HEIGHT, STATUS_HEIGHT as H, STATUS_WIDTH as W } from "@/lib/rateAds";
import { GRAMS_PER_PAVAN } from "@/types/goldRate";

/**
 * The daily WhatsApp status video, made in the browser:
 * the chosen ad clip plays on a 720x1280 canvas with the rate panel drawn on
 * top, and MediaRecorder captures canvas + music into an MP4.
 *
 * Done client-side because the canvas uses the page's own fonts (Malayalam
 * shapes correctly) and no video server is needed. The same drawStatusFrame
 * powers the admin's live preview, so the preview is exactly what is shared.
 */

const GOLD = "#F2D28B";
const IVORY = "#F6F3F0";
const MUTED = "#9E9EAE";
const BG = "5,5,9";
const UP = "#7FD69B";
const DOWN = "#F28B8B";

export interface StatusOverlay {
  date: string;
  gold22: number;
  gold18?: number;
  gold24?: number;
  silver?: number;
  note?: string;
  /** 22K change per gram from the previous saved day, if any. */
  change: number | null;
  /** "since yesterday" / "since 24 Oct", shown with the change. */
  changeSince?: string;
}

interface Fonts {
  display: string;
  sans: string;
  malayalam: string;
}

const MALAYALAM_HEADING = "ഇന്നത്തെ സ്വർണ്ണ വില";

/** The next/font families the site already loads (CSS variables on <html>). */
function pageFonts(): Fonts {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    display: read("--font-cormorant", "Georgia, serif"),
    sans: read("--font-inter", "system-ui, sans-serif"),
    malayalam: read("--font-brand", read("--font-malayalam", "sans-serif")),
  };
}

let fontsReady: Promise<Fonts> | null = null;

/** Load the exact weights the overlay uses before drawing with them. */
export function loadStatusFonts(): Promise<Fonts> {
  if (!fontsReady) {
    const fonts = pageFonts();
    fontsReady = Promise.all([
      document.fonts.load(`700 100px ${fonts.display}`),
      document.fonts.load(`600 40px ${fonts.display}`),
      document.fonts.load(`700 96px ${fonts.sans}`),
      document.fonts.load(`600 24px ${fonts.sans}`),
      document.fonts.load(`500 24px ${fonts.sans}`),
      document.fonts.load(`400 24px ${fonts.sans}`),
      document.fonts.load(`700 30px ${fonts.malayalam}`, MALAYALAM_HEADING),
    ])
      .then(() => fonts)
      .catch(() => fonts);
  }
  return fontsReady;
}

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

/** Centered text with manual letter spacing (canvas letterSpacing is not everywhere). */
function spaced(ctx: CanvasRenderingContext2D, text: string, y: number, spacing: number) {
  const chars = [...text];
  const width = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
  let x = (W - width) / 2;
  ctx.textAlign = "left";
  for (const ch of chars) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = "center";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

interface Run {
  text: string;
  font: string;
  color: string | CanvasGradient;
  /** Space after this run, in px. */
  gap?: number;
}

/** Draw runs of differently styled text centered on one shared baseline. */
function runs(ctx: CanvasRenderingContext2D, parts: Run[], y: number) {
  const widths = parts.map((part) => {
    ctx.font = part.font;
    return ctx.measureText(part.text).width;
  });
  const total = widths.reduce((sum, width, i) => sum + width + (parts[i].gap ?? 0), 0) - (parts.at(-1)?.gap ?? 0);
  let x = (W - total) / 2;
  ctx.textAlign = "left";
  parts.forEach((part, i) => {
    ctx.font = part.font;
    ctx.fillStyle = part.color;
    ctx.fillText(part.text, x, y);
    x += widths[i] + (part.gap ?? 0);
  });
  ctx.textAlign = "center";
}

/**
 * One frame: video (cover-fit) + brand header + animated rate panel.
 * `t` is seconds since the clip started; it drives the slide-in and shimmer.
 */
export function drawStatusFrame(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement | null,
  data: StatusOverlay,
  t: number,
  fonts: Fonts,
) {
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, W, H);
  const photo = source instanceof HTMLImageElement;
  if (photo && source.complete && source.naturalWidth) {
    // Gallery photos are pre-cropped to exactly this band.
    ctx.drawImage(source, 0, 0, W, PHOTO_HEIGHT);
  } else if (source instanceof HTMLVideoElement && source.readyState >= 2 && source.videoWidth) {
    const scale = Math.max(W / source.videoWidth, H / source.videoHeight);
    const vw = source.videoWidth * scale;
    const vh = source.videoHeight * scale;
    ctx.drawImage(source, (W - vw) / 2, (H - vh) / 2, vw, vh);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Header: brand over a dark fade. Photos are often bright gold edge to edge,
  // so they get a deeper fade and a soft shadow behind the name.
  const top = ctx.createLinearGradient(0, 0, 0, photo ? 300 : 280);
  top.addColorStop(0, `rgba(${BG},${photo ? 0.92 : 0.8})`);
  top.addColorStop(photo ? 0.5 : 0.6, `rgba(${BG},${photo ? 0.55 : 0.3})`);
  top.addColorStop(1, `rgba(${BG},0)`);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 300);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = GOLD;
  ctx.font = `700 56px ${fonts.display}`;
  ctx.fillText(BRAND.businessName, W / 2, 92);
  ctx.fillStyle = "rgba(246,243,240,0.85)";
  ctx.font = `600 15px ${fonts.sans}`;
  spaced(ctx, BRAND.ratePoster.strapline.toUpperCase(), 132, 5);
  ctx.restore();
  if (data.note) {
    ctx.fillStyle = GOLD;
    ctx.font = `600 30px ${fonts.display}`;
    ctx.fillText(data.note, W / 2, 186, W - 96);
  }

  // Rate panel slides up over the first second. Lines sit ~40–50 px apart.
  const p = easeOut((t - 0.15) / 0.8);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(0, (1 - p) * 140);

  const fade = ctx.createLinearGradient(0, 430, 0, 590);
  fade.addColorStop(0, `rgba(${BG},0)`);
  fade.addColorStop(1, `rgba(${BG},0.94)`);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 430, W, 160);
  ctx.fillStyle = `rgba(${BG},0.94)`;
  ctx.fillRect(0, 589, W, H - 589 + 140);

  ctx.fillStyle = GOLD;
  ctx.font = `600 20px ${fonts.sans}`;
  spaced(ctx, "TODAY'S GOLD RATE", 640, 6);
  ctx.fillStyle = IVORY;
  ctx.font = `700 30px ${fonts.malayalam}`;
  ctx.fillText(MALAYALAM_HEADING, W / 2, 690);
  ctx.font = `600 32px ${fonts.display}`;
  ctx.fillText(formatFullDate(data.date), W / 2, 740);

  // 22K card.
  const cardTop = 774;
  const cardHeight = 264;
  const card = ctx.createLinearGradient(0, cardTop, 0, cardTop + cardHeight);
  card.addColorStop(0, "rgba(242,210,139,0.18)");
  card.addColorStop(1, "rgba(169,121,31,0.07)");
  roundRect(ctx, 52, cardTop, W - 104, cardHeight, 26);
  ctx.fillStyle = card;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = `600 18px ${fonts.sans}`;
  spaced(ctx, "22 KARAT  ·  916 GOLD", 816, 5);

  // Price in lining figures, with a gold light sweeping across it.
  const sweep = ((t * 0.45) % 1.8) - 0.4;
  const shine = ctx.createLinearGradient(sweep * W - 120, 0, sweep * W + 120, 0);
  shine.addColorStop(0, GOLD);
  shine.addColorStop(0.5, "#FFF6DA");
  shine.addColorStop(1, GOLD);
  runs(
    ctx,
    [
      { text: "₹", font: `600 60px ${fonts.sans}`, color: shine, gap: 8 },
      { text: formatAmount(data.gold22), font: `700 92px ${fonts.sans}`, color: shine },
    ],
    912,
  );
  ctx.fillStyle = MUTED;
  ctx.font = `500 20px ${fonts.sans}`;
  ctx.fillText("per gram", W / 2, 956);

  ctx.fillStyle = "rgba(242,210,139,0.3)";
  ctx.fillRect(150, 982, W - 300, 1);

  runs(
    ctx,
    [
      { text: `1 Pavan (${GRAMS_PER_PAVAN} g)`, font: `500 22px ${fonts.sans}`, color: MUTED, gap: 16 },
      { text: `₹${formatAmount(data.gold22 * GRAMS_PER_PAVAN)}`, font: `700 27px ${fonts.sans}`, color: IVORY },
    ],
    1016,
  );

  // Change since the previous rate, as a small pill under the card.
  if (data.change !== null) {
    const since = data.changeSince ?? "since last rate";
    const text =
      data.change === 0
        ? `No change ${since}`
        : `${data.change > 0 ? "▲" : "▼"}  ₹${formatAmount(Math.abs(data.change))} ${since}`;
    const tint = data.change > 0 ? UP : data.change < 0 ? DOWN : MUTED;
    ctx.font = `600 20px ${fonts.sans}`;
    const width = ctx.measureText(text).width + 44;
    roundRect(ctx, (W - width) / 2, 1058, width, 40, 20);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = tint;
    ctx.fillText(text, W / 2, 1085);
  }

  // Other rates as evenly spaced columns.
  const others = (
    [
      ["24K", data.gold24],
      ["18K", data.gold18],
      ["SILVER", data.silver],
    ] as [string, number | undefined][]
  ).filter(([, value]) => value);
  others.forEach(([label, value], index) => {
    const x = W / 2 + (index - (others.length - 1) / 2) * 200;
    ctx.fillStyle = MUTED;
    ctx.font = `600 15px ${fonts.sans}`;
    ctx.fillText(label, x, 1136);
    ctx.fillStyle = IVORY;
    ctx.font = `600 26px ${fonts.sans}`;
    ctx.fillText(`₹${formatAmount(value as number)}`, x, 1168);
  });

  ctx.fillStyle = "rgba(242,210,139,0.25)";
  ctx.fillRect(120, 1188, W - 240, 1);
  const phones = [BRAND.phone, BRAND.phone2].filter(Boolean).map((phone) => displayPhone(phone as string));
  ctx.fillStyle = IVORY;
  ctx.font = `600 22px ${fonts.sans}`;
  ctx.fillText(phones.join("     ·     "), W / 2, 1218);
  ctx.fillStyle = MUTED;
  ctx.font = `400 15px ${fonts.sans}`;
  ctx.fillText(`North Nada & West Nada, ${BRAND.city}   ·   ${BRAND.ratePoster.website}`, W / 2, 1245);
  ctx.restore();

  // Gold frame on top of everything.
  roundRect(ctx, 16, 16, W - 32, H - 32, 28);
  ctx.strokeStyle = "rgba(242,210,139,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Best recording format this browser offers; MP4 first (what WhatsApp expects). */
function pickFormat(): { mimeType: string; extension: "mp4" | "webm" } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates: [string, "mp4" | "webm"][] = [
    ["video/mp4;codecs=avc1.42E01F,mp4a.40.2", "mp4"],
    ["video/mp4;codecs=avc1,mp4a", "mp4"],
    ["video/mp4", "mp4"],
    ["video/webm;codecs=vp9,opus", "webm"],
    ["video/webm", "webm"],
  ];
  const found = candidates.find(([type]) => MediaRecorder.isTypeSupported(type));
  return found ? { mimeType: found[0], extension: found[1] } : null;
}

export function canMakeStatusVideo(): boolean {
  return typeof document !== "undefined" && "captureStream" in HTMLCanvasElement.prototype && pickFormat() !== null;
}

export interface StatusVideoResult {
  file: File;
  /** False when the browser would not play the music (e.g. iPhone after a wait). */
  withMusic: boolean;
  format: "mp4" | "webm" | "jpg";
}

/**
 * The still image is drawn at this moment of the animation: the panel is fully
 * in and the gold light sits across the middle of the price.
 */
export const STILL_FRAME_TIME = 2;

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The photo could not be loaded."));
    image.src = src;
  });
}

/** Status image: the chosen photo with the rate panel, as a 720x1280 JPEG. */
export async function makeStatusImage(options: {
  photoSrc: string;
  data: StatusOverlay;
  fileName: string;
}): Promise<StatusVideoResult> {
  const [fonts, image] = await Promise.all([loadStatusFonts(), loadImage(options.photoSrc)]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  drawStatusFrame(ctx, image, options.data, STILL_FRAME_TIME, fonts);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("Could not make the image.");
  return {
    file: new File([blob], `${options.fileName}.jpg`, { type: "image/jpeg" }),
    withMusic: false,
    format: "jpg",
  };
}

/**
 * Record the status video in real time (as long as the clip, ~4–8 s).
 * `audio` must be an AudioContext created inside the tap that started this,
 * or the music is left out. Keep the screen on while it records.
 */
export async function makeStatusVideo(options: {
  clipUrl: string;
  data: StatusOverlay;
  fileName: string;
  audio?: AudioContext;
  onProgress?: (fraction: number) => void;
}): Promise<StatusVideoResult> {
  const format = pickFormat();
  if (!format) throw new Error("This browser cannot record video. Use Chrome on Android or Safari on iPhone.");
  const fonts = await loadStatusFonts();

  // Download the clip first so recording never stalls on the network.
  const response = await fetch(options.clipUrl);
  if (!response.ok) throw new Error("Could not load the video. Check the internet connection and try again.");
  const source = URL.createObjectURL(await response.blob());

  const video = document.createElement("video");
  video.src = source;
  video.playsInline = true;
  video.preload = "auto";
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("The video could not be decoded."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  drawStatusFrame(ctx, video, options.data, 0, fonts);

  const stream = canvas.captureStream(30);
  let withMusic = false;
  let gain: GainNode | null = null;
  if (options.audio) {
    try {
      await options.audio.resume();
      const node = options.audio.createMediaElementSource(video);
      gain = options.audio.createGain();
      const out = options.audio.createMediaStreamDestination();
      node.connect(gain).connect(out);
      out.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      withMusic = true;
    } catch {
      withMusic = false;
    }
  }
  video.muted = !withMusic;

  const recorder = new MediaRecorder(stream, { mimeType: format.mimeType, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

  try {
    await video.play();
  } catch {
    // Unmuted playback refused (no recent tap): record silently instead.
    video.muted = true;
    withMusic = false;
    stream.getAudioTracks().forEach((track) => stream.removeTrack(track));
    await video.play();
  }
  video.pause();
  video.currentTime = 0;

  const duration = video.duration;
  if (gain && options.audio) {
    // Soft music fade in/out so the cut segment does not start or end abruptly.
    const now = options.audio.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + 0.4);
    gain.gain.setValueAtTime(1, now + Math.max(duration - 0.6, 0.5));
    gain.gain.linearRampToValueAtTime(0, now + duration);
  }

  recorder.start(250);
  await video.play();
  await new Promise<void>((resolve) => {
    const tick = () => {
      drawStatusFrame(ctx, video, options.data, video.currentTime, fonts);
      options.onProgress?.(Math.min(video.currentTime / duration, 1));
      if (video.ended) resolve();
      else requestAnimationFrame(tick);
    };
    video.onended = () => resolve();
    requestAnimationFrame(tick);
  });
  drawStatusFrame(ctx, video, options.data, duration, fonts);
  await new Promise((resolve) => setTimeout(resolve, 150));
  recorder.stop();
  await stopped;

  stream.getTracks().forEach((track) => track.stop());
  URL.revokeObjectURL(source);
  options.onProgress?.(1);

  const type = format.mimeType.split(";")[0];
  return {
    file: new File([new Blob(chunks, { type })], `${options.fileName}.${format.extension}`, { type }),
    withMusic,
    format: format.extension,
  };
}
