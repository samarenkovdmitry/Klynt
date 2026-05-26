import { TRUST_BADGES } from "@/lib/trust-badges";

type TrustBadgeRowProps = {
  variant?: "dark" | "light";
  className?: string;
};

const variantStyles = {
  dark: {
    row: "text-white/70",
    icon: "text-white/85",
    dot: "bg-white/30",
  },
  light: {
    row: "text-[#8E99A2]",
    icon: "text-[#14A8E8]",
    dot: "bg-[#D5DDE5]",
  },
} as const;

export function TrustBadgeRow({
  variant = "dark",
  className = "",
}: TrustBadgeRowProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] md:text-[13px]",
        styles.row,
        className,
      ].join(" ")}
    >
      {TRUST_BADGES.map((badge, index) => {
        const Icon = badge.icon;

        return (
          <div key={badge.label} className="contents">
            {index > 0 && (
              <div
                className={`hidden h-1 w-1 rounded-full md:block ${styles.dot}`}
              />
            )}
            <div className="flex items-center gap-2">
              <Icon size={16} className={`shrink-0 ${styles.icon}`} />
              <span>{badge.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
