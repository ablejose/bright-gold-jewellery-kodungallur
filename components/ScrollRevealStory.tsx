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
 * another, as the paragraph scrolls up into view. Newlines ("\n") in the text
 * are honoured as hard line breaks, so the copy can be arranged into a fixed
 * number of lines. An optional external `progress` MotionValue lets a parent
 * drive the reveal so a sibling (e.g. the heritage timeline line) golds in
 * sync. "ബ്രൈറ്റ് ഗോൾഡ്" stays highlighted in a gold-foil brand font throughout.
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

  const lines = text.split("\n").map((line) => line.split(" ").filter(Boolean));
  const totalWords = lines.reduce((n, words) => n + words.length, 0);

  let wordIndex = 0;
  return (
    <p ref={ref} className={className}>
      {lines.map((words, li) => (
        <span key={li} className="block">
          {words.map((word, wi) => {
            const idx = wordIndex++;
            const trailing = wi < words.length - 1 ? " " : "";

            if (HIGHLIGHT_WORDS.has(word)) {
              return (
                <span key={wi}>
                  <span className="font-brand font-bold text-gold-foil">{word}</span>
                  {trailing}
                </span>
              );
            }

            const wStart = start + (span * idx) / totalWords;
            const wEnd = start + (span * (idx + 1)) / totalWords;
            return (
              <span key={wi}>
                <RevealWord text={word} progress={activeProgress} range={[wStart, wEnd]} />
                {trailing}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}
