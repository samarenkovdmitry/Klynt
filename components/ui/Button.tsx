import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonTone = "light" | "dark";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Light surfaces (app/report) vs dark surfaces (landing hero/CTA). Applies to primary and secondary. */
  tone?: ButtonTone;
  icon?: ReactNode;
  href?: string;
  fullWidth?: boolean;
};

const primaryStyles: Record<ButtonTone, string> = {
  light:
    "border border-transparent bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]",
  dark: "border border-transparent bg-white text-[#18181B] hover:bg-[#F4F4F5]",
};

const accentStyles =
  "border border-transparent bg-[var(--brand-primary)] text-white shadow-[0_10px_30px_rgba(37,99,235,0.22)] hover:-translate-y-px hover:bg-[var(--brand-primary-hover)] hover:shadow-[0_14px_34px_rgba(37,99,235,0.28)]";

const secondaryStyles: Record<ButtonTone, string> = {
  light:
    "border border-[rgba(6,28,47,0.08)] bg-white text-[var(--ink-primary)] hover:bg-[#F8FBFF]",
  dark:
    "border border-[rgba(255,255,255,0.12)] bg-transparent text-white hover:bg-white/10",
};

export function Button({
  children,
  disabled,
  className = "",
  variant = "primary",
  tone = "light",
  icon,
  href,
  fullWidth = true,
  type = "button",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary"
      ? secondaryStyles[tone]
      : variant === "accent"
        ? accentStyles
        : primaryStyles[tone];

  const classes = [
    "inline-flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6",
    "text-[15px] font-semibold leading-none transition",
    fullWidth ? "w-full" : "w-auto",
    disabled
      ? "cursor-not-allowed border-transparent bg-[#DCE2E7] text-white opacity-60"
      : variantClass,
    className,
  ].join(" ");

  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...props}>
      {content}
    </button>
  );
}
