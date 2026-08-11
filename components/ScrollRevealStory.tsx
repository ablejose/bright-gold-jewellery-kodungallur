"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/** Words kept permanently highlighted (gold-foil brand font): "Bright Gold". */
const HIGHLIGHT_WORDS = new Set(["ബ്രൈറ്റ്", "ഗോൾഡ്"]);

const DIM = "#66666F"; // subdued starting colour
const GOLD = "#F2D28B"; // brand gold

function RevealWord({
  text,
  progress,
  range,
}: {
  text: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, [DIM, GOLD]);
  return <motion.span style={{ color }}>{text}</motion.span>;
}

/**
 * Scroll-linked story text. Each word fades from a dim tone to gold, one after
 * another, as the paragraph scrolls up into view. An optional external
 * `progress` MotionValue lets a parent drive the reveal so a sibling element —
 * e.g. the heritage timeline line — can gold in perfect sync; when omitted the
 * paragraph tracks its own scroll. "ബ്രൈറ്റ് ഗോൾഡ്" is rendered in a distinct
 * gold-foil brand font so it stays highlighted throughout.
 */
export function ScrollRevealStory({
  text,
  progress,
  start = 0,
  end = 1,
  className = "",
}: {
  text: string;
  progress?: MotionValue<number>;
  start?: number;
  end?: number;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const local = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.5"],
  });
  const activeProgress = progress ?? local.scrollYProgress;
  const span = end - start;

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const trailing = i < words.length - 1 ? " " : "";

        if (HIGHLIGHT_WORDS.has(word)) {
          return (
            <span key={i}>
              <span className="font-brand font-bold text-gold-foil">{word}</span>
              {trailing}
            </span>
          );
        }

        const wStart = start + (span * i) / words.length;
        const wEnd = start + (span * (i + 1)) / words.length;
        return (
          <span key={i}>
            <RevealWord text={word} progress={activeProgress} range={[wStart, wEnd]} />
            {trailing}
          </span>
        );
      })}
    </p>
  );
}
