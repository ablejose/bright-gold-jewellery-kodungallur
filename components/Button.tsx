import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Reusable pill button (Document 5 §10). Renders an internal Next link,
 * or an external anchor with rel="noopener noreferrer" (Document 3 §11).
 */
export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  ariaLabel,
  className = "",
}: ButtonProps) {
  const classes = `${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`.trim();

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={classes}>
      {children}
    </Link>
  );
}
