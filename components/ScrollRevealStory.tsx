"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

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
 * Scroll-linked story text driven by an external scroll `progress` value (the
 * section is pinned, so the page stays still while these words turn gold one
 * after another across the [start, end] slice of progress). "ബ്രൈറ്റ് ഗോൾഡ്"
 * is rendered in a distinct gold-foil brand font so it stays highlighted.
 */
export function ScrollRevealStory({
  text,
  progress,
  start = 0,
  end = 1,
  className = "",
}: {
  text: string;
  progress: MotionValue<number>;
  start?: number;
  end?: number;
  className?: string;
}) {
  const words = text.split(" ");
  const span = end - start;

  return (
    <p className={className}>
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
            <RevealWord text={word} progress={progress} range={[wStart, wEnd]} />
            {trailing}
          </span>
        );
      })}
    </p>
  );
}
