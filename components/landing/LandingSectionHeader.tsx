type LandingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  titleSize?: "lg" | "md";
  className?: string;
};

const titleSizeClass = {
  lg: "md:text-[54px]",
  md: "md:text-[48px]",
} as const;

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  titleSize = "lg",
  className = "",
}: LandingSectionHeaderProps) {
  return (
    <div
      className={`mx-auto max-w-[760px] text-center ${className}`.trim()}
    >
      <div className="text-[17px] font-semibold text-[var(--brand-primary)]">{eyebrow}</div>

      <h2
        className={[
          "mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#061C2F]",
          titleSizeClass[titleSize],
        ].join(" ")}
      >
        {title}
      </h2>

      <p className="mx-auto mt-5 max-w-[620px] text-[18px] leading-7 text-[#6B7280]">
        {description}
      </p>
    </div>
  );
}
