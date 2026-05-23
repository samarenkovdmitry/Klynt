import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  href?: string;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#061C2F] text-white border border-transparent hover:opacity-90",
  secondary:
    "bg-white text-[var(--ink-primary)] border border-[rgba(6,28,47,0.08)] hover:bg-[#F8FBFF]",
  accent:
    "border border-transparent bg-[#14A8E8] text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:-translate-y-px hover:bg-[#1198D2] hover:shadow-[0_14px_34px_rgba(20,168,232,0.24)]",
};

export function Button({
  children,
  disabled,
  className = "",
  variant = "primary",
  icon,
  href,
  fullWidth = true,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6",
    "text-[15px] font-semibold leading-none transition",
    fullWidth ? "w-full" : "w-auto",
    disabled
      ? "cursor-not-allowed border-transparent bg-[#DCE2E7] text-white opacity-60"
      : variantStyles[variant],
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
