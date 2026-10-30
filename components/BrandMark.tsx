import Image from "next/image";

interface BrandMarkProps {
  /** Tailwind height class, e.g. "h-16". Width follows the artwork's proportions. */
  className?: string;
  /** Preload it (use for the loading screen and hero, which are on screen first). */
  priority?: boolean;
}

/**
 * The Bright Gold emblem: a transparent PNG at the artwork's native size
 * (429x355), lightly sharpened. `unoptimized` keeps the exact pixels instead of
 * letting the image optimizer re-compress a small, detailed logo into mush.
 */
export function BrandMark({ className = "h-16", priority = false }: BrandMarkProps) {
  return (
    <Image
      src="/brand/logo-emblem-lg.png"
      alt=""
      width={429}
      height={355}
      unoptimized
      priority={priority}
      draggable={false}
      className={`block w-auto select-none ${className}`}
    />
  );
}
