import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-brand-600",
  secondary:
    "bg-brand-100 text-brand-800 hover:bg-brand-200 active:bg-brand-300 focus-visible:outline-brand-600",
  outline:
    "border-2 border-brand-600 text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:outline-brand-600",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/** Estilos do botão, expostos para estilizar links e outros elementos com a mesma aparência. */
export function buttonClasses({ variant = "primary", size = "md", className = "" }: ButtonStyleOptions = {}): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
