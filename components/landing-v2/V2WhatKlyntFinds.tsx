const ROWS = [
  {
    num: "01",
    title: "Trust signals",
    description:
      "Logos, testimonials, and credibility cues visible before the visitor scrolls.",
    method:
      "Puppeteer scans for logo imgs, star-rating widgets, testimonial blocks and review badges — counts only those above 768px fold boundary.",
  },
  {
    num: "02",
    title: "Messaging clarity",
    description:
      "Whether headline, subline and CTA say who this is for and what happens next.",
    method:
      "h1_text and cta_text extracted verbatim, passed to LLM with instruction to cite the exact element before evaluating — no guessing allowed.",
  },
  {
    num: "03",
    title: "Cognitive friction",
    description:
      "Layout and copy complexity that makes visitors think harder than they should.",
    method:
      "nav_link_count computed from visible top-of-page anchors, deduplicated by href. Threshold: more than 5 links flags as competing with CTA.",
  },
  {
    num: "04",
    title: "Visual hierarchy",
    description:
      "Whether the page guides the eye to headline, CTA and social proof in the right order.",
    method:
      "WCAG contrast ratio computed from h1_color vs hero_bg using luminance formula. cta_border_radius and font-weight extracted for hierarchy scoring.",
  },
];

export function V2WhatKlyntFinds() {
  return (
    <section className="border-t border-lv2-border bg-lv2-cream px-6 py-[80px] md:px-12">
      <div className="mx-auto max-w-[1080px]">
        {/* Section header */}
        <div className="mb-[52px]">
          <div className="mb-[18px] flex items-end justify-between">
            <span className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-muted">
              <span
                className="h-[8px] w-[8px] shrink-0 rounded-full"
                style={{ backgroundColor: "#639922" }}
                aria-hidden
              />
              WHAT KLYNT FINDS
            </span>
            <span
              className="text-right font-mono text-[12px] leading-[1.4]"
              style={{ color: "#A09690" }}
            >
              47 signals computed
              <br />
              per audit
            </span>
          </div>
          <h2 className="text-[38px] font-bold leading-[1.08] tracking-[-0.03em] md:text-[44px]">
            Not a model squinting
            <br />
            at a screenshot.
          </h2>
        </div>

        {/* Rows */}
        <div>
          {ROWS.map((row) => (
            <div
              key={row.num}
              className="grid grid-cols-[36px_1fr] gap-x-6 md:grid-cols-[36px_1fr_300px] md:gap-x-10"
              style={{
                borderTop: "0.5px solid #E4DACC",
                padding: "32px 0",
              }}
            >
              {/* Number */}
              <span
                className="pt-[2px] font-mono text-[12px] leading-[1.65]"
                style={{ color: "#A09690" }}
              >
                {row.num}
              </span>

              {/* Title + description */}
              <div>
                <p
                  className="mb-[6px] text-[17px] font-medium leading-snug"
                  style={{ color: "#1A1814" }}
                >
                  {row.title}
                </p>
                <p
                  className="text-[13px] leading-[1.55]"
                  style={{ color: "#6B6358" }}
                >
                  {row.description}
                </p>
                {/* Method shown below on mobile */}
                <p
                  className="mt-3 font-mono text-[12px] leading-[1.65] md:hidden"
                  style={{ color: "#A09690" }}
                >
                  {row.method}
                </p>
              </div>

              {/* Method — right column, desktop only */}
              <p
                className="hidden font-mono text-[12px] leading-[1.65] md:block"
                style={{ color: "#A09690" }}
              >
                {row.method}
              </p>
            </div>
          ))}
          {/* Bottom border after last row */}
          <div style={{ borderTop: "0.5px solid #E4DACC" }} />
        </div>
      </div>
    </section>
  );
}
