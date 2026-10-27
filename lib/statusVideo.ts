"use client";

import { BRAND } from "@/config/brand";
import { formatAmount, formatLongDate, formatWeekday } from "@/lib/goldRate";
import { STATUS_HEIGHT as H, STATUS_WIDTH as W } from "@/lib/rateAds";
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
      document.fonts.load(`600 24px ${fonts.sans}`),
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

/** Draw a row of [text, color] pieces centered on one line. */
function pieces(ctx: CanvasRenderingContext2D, parts: [string, string][], y: number) {
  const width = parts.reduce((sum, [text]) => sum + ctx.measureText(text).width, 0);
  let x = (W - width) / 2;
  ctx.textAlign = "left";
  for (const [text, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    x += ctx.measureText(text).width;
  }
  ctx.textAlign = "center";
}

/**
 * One frame: video (cover-fit) + brand header + animated rate panel.
 * `t` is seconds since the clip started; it drives the slide-in and shimmer.
 */
export function drawStatusFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  data: StatusOverlay,
  t: number,
  fonts: Fonts,
) {
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, W, H);
  if (video && video.readyState >= 2 && video.videoWidth) {
    const scale = Math.max(W / video.videoWidth, H / video.videoHeight);
    const vw = video.videoWidth * scale;
    const vh = video.videoHeight * scale;
    ctx.drawImage(video, (W - vw) / 2, (H - vh) / 2, vw, vh);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Header: brand over a soft dark fade.
  const top = ctx.createLinearGradient(0, 0, 0, 260);
  top.addColorStop(0, `rgba(${BG},0.78)`);
  top.addColorStop(1, `rgba(${BG},0)`);
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 260);
  ctx.fillStyle = GOLD;
  ctx.font = `700 56px ${fonts.display}`;
  ctx.fillText(BRAND.businessName, W / 2, 96);
  ctx.fillStyle = "rgba(246,243,240,0.8)";
  ctx.font = `600 15px ${fonts.sans}`;
  spaced(ctx, BRAND.ratePoster.strapline.toUpperCase(), 126, 5);
  if (data.note) {
    ctx.fillStyle = GOLD;
    ctx.font = `600 32px ${fonts.display}`;
    ctx.fillText(data.note, W / 2, 176, W - 80);
  }

  // Rate panel slides up over the first second.
  const p = easeOut((t - 0.15) / 0.8);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(0, (1 - p) * 140);

  const fade = ctx.createLinearGradient(0, 600, 0, 820);
  fade.addColorStop(0, `rgba(${BG},0)`);
  fade.addColorStop(1, `rgba(${BG},0.93)`);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 600, W, 220);
  ctx.fillStyle = `rgba(${BG},0.93)`;
  ctx.fillRect(0, 819, W, H - 819 + 140);

  ctx.fillStyle = GOLD;
  ctx.font = `600 20px ${fonts.sans}`;
  spaced(ctx, "TODAY'S GOLD RATE", 790, 6);
  ctx.fillStyle = IVORY;
  ctx.font = `700 30px ${fonts.malayalam}`;
  ctx.fillText(MALAYALAM_HEADING, W / 2, 836);
  ctx.font = `600 34px ${fonts.display}`;
  ctx.fillText(`${formatLongDate(data.date)} · ${formatWeekday(data.date)}`, W / 2, 882);

  // 22K card.
  const card = ctx.createLinearGradient(0, 906, 0, 1126);
  card.addColorStop(0, "rgba(242,210,139,0.18)");
  card.addColorStop(1, "rgba(169,121,31,0.07)");
  roundRect(ctx, 44, 906, W - 88, 220, 26);
  ctx.fillStyle = card;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.font = `600 18px ${fonts.sans}`;
  spaced(ctx, "22 KARAT · 916 GOLD", 944, 5);

  // Price with a gold light sweeping across it every few seconds.
  const amount = formatAmount(data.gold22);
  ctx.font = `600 52px ${fonts.sans}`;
  const rupeeWidth = ctx.measureText("₹").width;
  ctx.font = `700 108px ${fonts.display}`;
  const amountWidth = ctx.measureText(amount).width;
  const startX = (W - rupeeWidth - 10 - amountWidth) / 2;
  const sweep = ((t * 0.45) % 1.8) - 0.4;
  const shine = ctx.createLinearGradient(sweep * W - 120, 0, sweep * W + 120, 0);
  shine.addColorStop(0, GOLD);
  shine.addColorStop(0.5, "#FFF6DA");
  shine.addColorStop(1, GOLD);
  ctx.fillStyle = shine;
  ctx.textAlign = "left";
  ctx.font = `600 52px ${fonts.sans}`;
  ctx.fillText("₹", startX, 1000);
  ctx.font = `700 108px ${fonts.display}`;
  ctx.fillText(amount, startX + rupeeWidth + 10, 1040);
  ctx.textAlign = "center";

  ctx.font = `500 22px ${fonts.sans}`;
  pieces(
    ctx,
    [
      ["per gram   ·   1 Pavan (8g) ", MUTED],
      [`₹${formatAmount(data.gold22 * GRAMS_PER_PAVAN)}`, IVORY],
    ],
    1078,
  );
  if (data.change !== null) {
    ctx.font = `600 20px ${fonts.sans}`;
    ctx.fillStyle = data.change > 0 ? UP : data.change < 0 ? DOWN : MUTED;
    ctx.fillText(
      data.change === 0
        ? "No change from previous rate"
        : `${data.change > 0 ? "▲" : "▼"} ₹${formatAmount(Math.abs(data.change))} / gram from previous rate`,
      W / 2,
      1108,
    );
  }

  const others: [string, number | undefined][] = [
    ["24K", data.gold24],
    ["18K", data.gold18],
    ["Silver", data.silver],
  ];
  const row = others
    .filter(([, value]) => value)
    .flatMap(([label, value], index): [string, string][] => [
      [`${index ? "      " : ""}${label} `, MUTED],
      [`₹${formatAmount(value as number)}`, IVORY],
    ]);
  if (row.length) {
    ctx.font = `600 23px ${fonts.sans}`;
    pieces(ctx, row, 1166);
  }

  const phones = [BRAND.phone, BRAND.phone2].filter(Boolean).map((phone) => (phone as string).replace(/^\+91/, "+91 "));
  ctx.fillStyle = IVORY;
  ctx.font = `600 24px ${fonts.sans}`;
  ctx.fillText(phones.join("   |   "), W / 2, 1214);
  ctx.fillStyle = MUTED;
  ctx.font = `400 17px ${fonts.sans}`;
  ctx.fillText(`North Nada & West Nada, ${BRAND.city}  ·  ${BRAND.ratePoster.website}`, W / 2, 1244);
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
  format: "mp4" | "webm";
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
