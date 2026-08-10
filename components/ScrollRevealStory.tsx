"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/** Words kept emphasised (bolder + brighter gold): "Bright Gold". */
const HIGHLIGHT_WORDS = new Set(["ബ്രൈറ്റ്", "ഗോൾഡ്"]);

const DIM = "#6E6E7A"; // subdued starting colour
const GOLD = "#F2D28B"; // brand gold
const GOLD_BRIGHT = "#FFDE93"; // brighter gold for the highlighted words

function Word({
  text,
  progress,
  range,
  highlight,
}: {
  text: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlight: boolean;
}) {
  const color = useTransform(progress, range, [
    DIM,
    highlight ? GOLD_BRIGHT : GOLD,
  ]);
  return (
    <motion.span
      style={{ color }}
      className={highlight ? "font-bold" : undefined}
    >
      {text}
    </motion.span>
  );
}

/**
 * Scroll-linked story text. Each word fades from a dim tone to gold, one after
 * another, as the paragraph scrolls up the viewport — fully gold by the time it
 * reaches the top of the range. "ബ്രൈറ്റ് ഗോൾഡ്" stays bolder and a brighter
 * gold so the brand name is highlighted.
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
    offset: ["start 0.85", "end 0.5"],
  });

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <Word
            key={i}
            text={i < words.length - 1 ? `${word} ` : word}
            progress={scrollYProgress}
            range={[start, end]}
            highlight={HIGHLIGHT_WORDS.has(word)}
          />
        );
      })}
    </p>
  );
}
