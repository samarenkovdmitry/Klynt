import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import { REPORT_SECTION_SCROLL_MARGIN_CLASS } from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-xl bg-[rgba(6,28,47,0.06)]",
        className,
      ].join(" ")}
      aria-hidden
    />
  );
}

function SectionSkeleton({
  variant,
  cards,
}: {
  variant: "issues" | "improvements" | "copy";
  cards: number;
}) {
  const anchor = REPORT_SECTION_ANCHORS[variant];

  return (
    <section className={`mt-10 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`} id={anchor}>
      <ReportSectionHeader variant={variant} count={cards} />

      <div className="mt-6 space-y-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={`${variant}-skeleton-${index}`}
            className="rounded-2xl border border-[rgba(6,28,47,0.08)] bg-white p-5 shadow-[0_1px_2px_rgba(6,28,47,0.04)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-6 w-20" />
            </div>
            <SkeletonBlock className="mt-4 h-5 w-full max-w-[92%]" />
            <SkeletonBlock className="mt-2 h-5 w-full max-w-[78%]" />
            <SkeletonBlock className="mt-4 h-4 w-full max-w-[65%]" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportSectionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading report findings">
      <p className="mb-2 text-center text-[13px] font-medium text-[#8E99A2]">
        Generating findings…
      </p>
      <SectionSkeleton variant="issues" cards={3} />
      <SectionSkeleton variant="improvements" cards={2} />
      <SectionSkeleton variant="copy" cards={2} />
    </div>
  );
}
