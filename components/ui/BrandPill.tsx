import type { ReactNode } from "react";

type BrandPillProps = {
  children: ReactNode;
  className?: string;
};

export function BrandPill({ children, className = "" }: BrandPillProps) {
  return (
    <div
      className={`brand-pill mx-auto inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold md:text-[12px] ${className}`}
    >
      {children}
    </div>
  );
}
