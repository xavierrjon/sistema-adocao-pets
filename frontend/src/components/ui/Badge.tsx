import type { HTMLAttributes } from "react";

export type BadgeTone = "success" | "warning" | "neutral" | "brand";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Exibe um ponto colorido antes do texto. */
  withDot?: boolean;
};

const TONES: Record<BadgeTone, string> = {
  success: "bg-available/10 text-available",
  warning: "bg-process/10 text-process",
  neutral: "bg-adopted/10 text-adopted",
  brand: "bg-brand-100 text-brand-800",
};

export function Badge({ tone = "brand", withDot = false, className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${TONES[tone]} ${className}`}
      {...props}
    >
      {withDot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
