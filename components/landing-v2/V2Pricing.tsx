import { RiAddLine, RiCheckLine, RiPriceTag3Line } from "@remixicon/react";

const FREE_FEATURES = [
  "Full UX report",
  "What needs fixing, ranked",
  "1 copy variant per issue",
  "Visual & hierarchy fixes",
  "Trust & meta checks",
];

const PAID_EXTRAS = [
  "All copy variants per issue",
  "Export — Markdown / Figma / Dev",
  "Designer brief & dev task list",
  "Yours forever — no subscription",
];

export function V2Pricing() {
  return (
    <section className="border-t border-lv2-border bg-lv2-cream px-6 py-[96px] md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 max-w-[620px]">
          <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-muted">
            <RiPriceTag3Line size={14} className="text-lv2-green" aria-hidden />
            PRICING
          </span>
          <h2 className="text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">
            One audit. One price. Yours forever.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-[20px] border border-lv2-card-border bg-white px-[34px] pb-[36px] pt-[34px]">
            <div className="mb-[6px] flex items-baseline justify-between">
              <h3 className="text-[22px] font-bold tracking-[-0.01em]">Free</h3>
              <span className="font-mono text-[12px] tracking-[.05em] text-v2-ink-muted">NO SIGNUP</span>
            </div>
            <p className="mb-6 text-[15px] text-v2-ink-secondary">See exactly what needs fixing.</p>
            <div className="mb-[30px] flex flex-col gap-[13px]">
              {FREE_FEATURES.map((f) => (
                <span key={f} className="flex items-center gap-[11px] text-[15px] text-v2-dim">
                  <RiCheckLine size={17} className="shrink-0 text-lv2-green" aria-hidden />
                  {f}
                </span>
              ))}
            </div>
            <a
              href="/analyze"
              className="mt-auto flex h-[54px] items-center justify-center gap-[9px] rounded-[13px] border border-[1.5px] border-v2-dark bg-transparent font-sans text-[16px] font-semibold text-v2-dark transition-colors hover:bg-v2-dark hover:text-white"
            >
              Start free audit →
            </a>
          </div>

          {/* Full report */}
          <div className="relative flex flex-col rounded-[20px] border-2 border-v2-dark bg-white px-[34px] pb-[36px] pt-[34px]">
            <span className="absolute -top-[11px] left-[34px] inline-flex items-center gap-[6px] rounded-full bg-lv2-green px-[11px] py-[5px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-white">
              RECOMMENDED
            </span>
            <div className="mb-[6px] flex items-baseline justify-between">
              <h3 className="text-[22px] font-bold tracking-[-0.01em]">Full report</h3>
              <span className="flex items-baseline gap-[3px]">
                <span className="text-[30px] font-bold leading-none tracking-[-0.02em] text-v2-dark">$12</span>
                <span className="font-mono text-[11.5px] tracking-[.05em] text-v2-ink-muted">ONCE</span>
              </span>
            </div>
            <p className="mb-6 text-[15px] text-v2-ink-secondary">
              Everything in Free, plus the parts you act on.
            </p>
            <div className="mb-[30px] flex flex-col gap-[13px]">
              {PAID_EXTRAS.map((f) => (
                <span key={f} className="flex items-center gap-[11px] text-[15px] text-v2-dim">
                  <RiAddLine size={17} className="shrink-0 text-lv2-green" aria-hidden />
                  {f}
                </span>
              ))}
            </div>
            <a
              href="/analyze"
              className="mt-auto flex h-[54px] items-center justify-center gap-[9px] rounded-[13px] border-none bg-v2-dark font-sans text-[16px] font-semibold text-white transition-colors hover:bg-v2-dark-alt"
            >
              Analyse free, then unlock →
            </a>
          </div>
        </div>

        <p className="mt-[26px] text-center font-mono text-[12px] tracking-[.04em] text-v2-ink-faint">
          Need multiple audits?{" "}
          <span className="text-v2-ink-secondary">Team plan coming soon.</span>
        </p>
      </div>
    </section>
  );
}
