import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

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
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4",
    "text-[15px] font-semibold leading-none transition",
    fullWidth ? "w-full sm:w-auto" : "w-auto",
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
