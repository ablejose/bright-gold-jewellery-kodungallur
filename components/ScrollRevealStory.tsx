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
 * another, as the paragraph scrolls up into view — fully gold near the middle
 * of the viewport. "ബ്രൈറ്റ് ഗോൾഡ്" is rendered in a distinct gold-foil brand
 * font so it stays highlighted throughout.
 */
export function ScrollRevealStory({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.5"],
  });

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

        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <span key={i}>
            <RevealWord
              text={word}
              progress={scrollYProgress}
              range={[start, end]}
            />
            {trailing}
          </span>
        );
      })}
    </p>
  );
}
