import {
  ANALYSIS_BENTO_CARDS,
  type BentoVariant,
} from "@/lib/landing-content";

const accentStyles: Record<
  BentoVariant,
  { pill: string; dot: string; panel: string }
> = {
  red: {
    pill: "border-red-200 bg-[#FFF3F3] text-[#D94848]",
    dot: "bg-red-400",
    panel: "bg-red-50/80",
  },
  emerald: {
    pill: "border-emerald-200 bg-[#E8F7EE] text-[#2E7D4F]",
    dot: "bg-emerald-400",
    panel: "bg-emerald-50/80",
  },
  sky: {
    pill: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-400",
    panel: "bg-sky-50/80",
  },
};

function MiniReportPreview({ variant }: { variant: BentoVariant }) {
  const styles = accentStyles[variant];

  return (
    <div
      className={`flex h-full min-h-[220px] items-center justify-center rounded-[24px] p-6 md:min-h-[280px] ${styles.panel}`}
    >
      <div className="w-full max-w-[300px] rounded-2xl border border-[rgba(6,28,47,0.06)] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <div className="h-2 flex-1 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="mt-3 h-2.5 w-[75%] rounded-full bg-[#E5E7EB]" />
        <div className="mt-2 h-2 w-[55%] rounded-full bg-[#E5E7EB]" />
        <div className="mt-4 space-y-2">
          <div className="h-8 rounded-lg bg-[#F3F4F6]" />
          <div className="h-8 rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

export function TestAnalysisSection() {
  const [primary, ...secondary] = ANALYSIS_BENTO_CARDS;

  return (
    <section className="bg-white px-5 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1040px]">
        <div className="mx-auto max-w-[720px] text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            What Klynt analyzes
          </p>
          <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#061C2F] md:text-[48px]">
            One report, three layers of clarity
          </h2>
          <p className="mx-auto mt-5 max-w-[580px] text-[17px] leading-7 text-[#6B7280] md:text-[18px]">
            Diagnose friction, prioritize fixes, and sharpen copy — without
            jumping between tools or generic checklists.
          </p>
        </div>

        <article className="mt-14 overflow-hidden rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] md:mt-16 md:rounded-[32px]">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-[12px] font-semibold ${accentStyles[primary.variant].pill}`}
              >
                {primary.pillLabel}
              </span>
              <h3 className="mt-5 text-[26px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#061C2F] md:text-[32px]">
                {primary.title}
              </h3>
              <p className="mt-4 text-[15px] leading-6 text-[#6B7280] md:text-[16px]">
                {primary.description}
              </p>
            </div>
            <MiniReportPreview variant={primary.variant} />
          </div>
        </article>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {secondary.map((card) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC]"
            >
              <div className="grid md:grid-rows-[auto_1fr]">
                <MiniReportPreview variant={card.variant} />
                <div className="p-6 md:p-8">
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-[12px] font-semibold ${accentStyles[card.variant].pill}`}
                  >
                    {card.pillLabel}
                  </span>
                  <h3 className="mt-4 text-[22px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#061C2F]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-6 text-[#6B7280]">
                    {card.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
