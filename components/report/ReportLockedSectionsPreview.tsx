import { ReportLockedSectionCard } from "@/components/report/ReportLockedSectionCard";

type ReportLockedSectionsPreviewProps = {
  remainingSuggestions: number;
  remainingCopy: number;
};

export function ReportLockedSectionsPreview({
  remainingSuggestions,
  remainingCopy,
}: ReportLockedSectionsPreviewProps) {
  if (remainingSuggestions <= 0 && remainingCopy <= 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-8 max-w-[640px] space-y-3">
      <ReportLockedSectionCard
        title="Suggested Improvements"
        count={remainingSuggestions}
        description="prioritized fixes for this page"
      />
      <ReportLockedSectionCard
        title="Copy Refinement"
        count={remainingCopy}
        description="before/after rewrites"
      />
    </section>
  );
}
