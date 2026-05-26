import type { ImpactEntry } from "@/lib/report-impact";

export type ImpactBadgeVariant = "negative" | "positive" | "sky";

type ImpactBadgesProps = {
  entries: ImpactEntry[];
  variant: ImpactBadgeVariant;
  className?: string;
};

const variantClass: Record<ImpactBadgeVariant, string> = {
  negative: "border-red-200 bg-red-50 text-red-500",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-600",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
};

export function ImpactBadges({
  entries,
  variant,
  className = "",
}: ImpactBadgesProps) {
  if (entries.length === 0) return null;

  return (
    <div
      className={`flex max-w-full flex-wrap gap-2 lg:justify-end ${className}`}
    >
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`
            inline-flex
            shrink-0
            items-center
            rounded-full
            border
            px-3.5
            py-2
            text-[12px]
            font-semibold
            md:text-[13px]
            ${variantClass[variant]}
          `}
        >
          {variant === "negative" ? "-" : "+"}
          {Math.abs(entry.value)}% {entry.key}
        </div>
      ))}
    </div>
  );
}
