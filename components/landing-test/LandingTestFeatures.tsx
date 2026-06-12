import {
  RiAlertLine,
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiCodeSSlashLine,
  RiDownloadLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiFontSize,
  RiLayoutGridLine,
  RiListCheck3,
  RiNotification4Line,
  RiPencilLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiTextSnippet,
} from "@remixicon/react";

import {
  LANDING_CARD_TITLE,
  LANDING_CONTAINER,
  LANDING_DIVIDER,
  LANDING_EYEBROW,
  LANDING_FEATURES_MAX,
  LANDING_ICON_ACCENT,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

function FeatureIcon({ accent, children }: { accent?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "mb-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border",
        accent ? LANDING_ICON_ACCENT : "border-white/[0.06] bg-white/[0.03] text-[#7A7A74]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Badge({ tone, children }: { tone: "miss" | "weak" | "pass"; children: React.ReactNode }) {
  const styles = {
    miss: "bg-[rgba(186,117,23,0.15)] text-[#E8A83A]",
    weak: "bg-[rgba(123,94,167,0.15)] text-[#B09FD4]",
    pass: "bg-[rgba(29,158,117,0.12)] text-[#2EC99A]",
  }[tone];

  return (
    <span className={`rounded-full px-[7px] py-[2px] text-[10px] font-medium ${styles}`}>
      {children}
    </span>
  );
}

function Cell({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#141412] p-7 ${className}`}>
      {children}
    </div>
  );
}

export function LandingTestFeatures() {
  return (
    <section className={LANDING_SECTION} aria-labelledby="features-heading">
      <div className={LANDING_CONTAINER}>
        <p className={`${LANDING_EYEBROW} text-center`}>What&apos;s inside</p>
        <h2 id="features-heading" className={`${LANDING_TITLE} mx-auto mt-3.5 max-w-[640px] text-center`}>
          Everything to improve,
          <br />
          nothing to interpret
        </h2>
        <p className={`${LANDING_LEAD} mx-auto mt-3.5 max-w-[440px] text-center`}>
          No abstract scores. Just copy, checklists, and tasks your team can act on today.
        </p>

        <div className={`${LANDING_FEATURES_MAX} mt-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]`}>
          <div className="grid grid-cols-1 gap-px md:grid-cols-3">
            <Cell className="md:col-span-2">
              <FeatureIcon accent>
                <RiPencilLine size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Copy studio</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                Three ready-to-paste variants for headline, CTA, and subheadline — tailored to your
                brand stage and audience.
              </p>
              <div className="mt-[18px] space-y-[5px]">
                <div className="rounded-[7px] border border-[rgba(29,158,117,0.15)] bg-[rgba(29,158,117,0.07)] px-2.5 py-2">
                  <div className="text-[10px] text-[#1D9E75]">Category + audience</div>
                  <div className="text-[12px] font-medium leading-[1.45] text-[#F2F2EF]">
                    SOC 2 compliance monitoring for engineering teams.
                  </div>
                </div>
                <div className="rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[12px] leading-[1.45] text-[#9A9A93]">
                  <span className="mb-0.5 block text-[10px] text-[#7A7A74]">Problem + solution</span>
                  Your SOC 2 is drifting. Liance catches it before auditors do.
                </div>
                <div className="rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[12px] leading-[1.45] text-[#9A9A93]">
                  <span className="mb-0.5 block text-[10px] text-[#7A7A74]">Outcome + audience</span>
                  Pass your next SOC 2 audit — without last-minute scrambles.
                </div>
              </div>
            </Cell>

            <Cell>
              <FeatureIcon>
                <RiListCheck3 size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Fix checklist</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                Above-the-fold gaps and passes — not a vague score. Each gap links directly to the
                fix.
              </p>
              <div className="mt-[18px] space-y-[5px]">
                {[
                  { icon: RiErrorWarningLine, color: "#E8A83A", text: "Product category missing", badge: "miss" as const },
                  { icon: RiAlertLine, color: "#B09FD4", text: "Subheadline content weak", badge: "weak" as const },
                  { icon: RiCheckboxCircleLine, color: "#2EC99A", text: "Single CTA above fold", badge: "pass" as const },
                ].map(({ icon: Icon, color, text, badge }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px] text-[12px]"
                  >
                    <Icon size={13} className="shrink-0" style={{ color }} aria-hidden />
                    <span className="flex-1 text-[#9A9A93]">{text}</span>
                    <Badge tone={badge}>{badge === "miss" ? "Missing" : badge === "weak" ? "Weak" : "Pass"}</Badge>
                  </div>
                ))}
              </div>
            </Cell>

            <Cell>
              <FeatureIcon>
                <RiBarChartLine size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Score potential</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                See where you can get after fixes — specific estimates per gap, not vague promises.
              </p>
              <div className="mt-[18px] flex items-center gap-2.5">
                <span className="font-sans text-[32px] font-bold leading-none tracking-[-0.04em] text-[#BA7517]">6.8</span>
                <span className="text-[#7A7A74]">→</span>
                <span className="font-sans text-[32px] font-bold leading-none tracking-[-0.04em] text-[#1D9E75]">8.5</span>
                <span className="text-[11px] text-[#7A7A74]">estimate</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  ["Category", "+0.8"],
                  ["CTA clarity", "+0.6"],
                  ["Trust", "+0.4"],
                ].map(([label, delta]) => (
                  <span
                    key={label}
                    className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] text-[#9A9A93]"
                  >
                    {label} <strong className="font-medium text-[#1D9E75]">{delta}</strong>
                  </span>
                ))}
              </div>
            </Cell>

            <Cell>
              <FeatureIcon>
                <RiDownloadLine size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Export for your team</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                One click to share a copy deck, designer brief, dev tasks, or Notion summary.
              </p>
              <div className="mt-[18px] grid grid-cols-2 gap-[5px]">
                {[
                  { icon: RiFileTextLine, title: "Copy deck", sub: "Markdown / CSV" },
                  { icon: RiLayoutGridLine, title: "Designer brief", sub: "Figma-ready" },
                  { icon: RiCodeSSlashLine, title: "Dev tasks", sub: "CSS + text" },
                  { icon: RiNotification4Line, title: "Notion / Slack", sub: "Formatted" },
                ].map(({ icon: Icon, title, sub }) => (
                  <div
                    key={title}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-[11px] py-2.5"
                  >
                    <Icon size={14} className="mb-1.5 block text-[#7A7A74]" aria-hidden />
                    <div className="text-[12px] font-medium text-[#F2F2EF]">{title}</div>
                    <div className="text-[11px] text-[#7A7A74]">{sub}</div>
                  </div>
                ))}
              </div>
            </Cell>

            <Cell>
              <FeatureIcon>
                <RiSettings3Line size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Context-aware</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                Tell Klynt your brand stage, traffic source, and audience — copy adapts to your
                situation.
              </p>
              <div className="mt-[18px] space-y-[5px]">
                {[
                  ["Brand stage", "Just launched"],
                  ["Visitor type", "Cold traffic"],
                  ["Audience", "B2B"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px] text-[12px]"
                  >
                    <span className="text-[#7A7A74]">{label}</span>
                    <span className="rounded-[5px] bg-white/[0.07] px-2 py-[2px] font-medium text-[#F2F2EF]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </Cell>

            <Cell className="md:col-span-2">
              <FeatureIcon>
                <RiTextSnippet size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Typography &amp; meta</h3>
              <p className="mt-2 max-w-[560px] text-[13px] leading-[1.65] text-[#9A9A93]">
                Suggested type scale improvements and generated meta title + description for SEO.
              </p>
              <div className="mt-[18px] grid gap-3 md:grid-cols-2 md:gap-3">
                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#7A7A74]">
                    Typography suggestions
                  </div>
                  <div className="space-y-[5px]">
                    <div className="flex items-center gap-1.5 rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px] text-[12px] text-[#9A9A93]">
                      <RiFontSize size={13} className="shrink-0 text-[#7A7A74]" aria-hidden />
                      Subhead: 16px → 18px / weight 500
                    </div>
                    <div className="flex items-center gap-1.5 rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px] text-[12px] text-[#9A9A93]">
                      <RiTextSnippet size={13} className="shrink-0 text-[#7A7A74]" aria-hidden />
                      Body: 15px → 16px / max-width 640px
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#7A7A74]">
                    Meta suggestions
                  </div>
                  <div className="space-y-[5px]">
                    <div className="rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px]">
                      <div className="text-[10px] text-[#7A7A74]">Title</div>
                      <div className="text-[12px] font-medium text-[#F2F2EF]">
                        Liance — SOC 2 Compliance Monitoring
                      </div>
                    </div>
                    <div className="rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px]">
                      <div className="text-[10px] text-[#7A7A74]">Description</div>
                      <div className="text-[12px] leading-[1.45] text-[#9A9A93]">
                        Monitor SOC 2 controls in real time. Alerts before auditors do.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Cell>

            <Cell>
              <FeatureIcon>
                <RiShieldCheckLine size={15} aria-hidden />
              </FeatureIcon>
              <h3 className={LANDING_CARD_TITLE}>Trust &amp; proof</h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[#9A9A93]">
                Trust gaps above the fold — with concrete proof suggestions, not vague advice.
              </p>
              <div className="mt-[18px] space-y-[5px]">
                {[
                  "No logos or testimonials visible above the fold",
                  "«Try Liance» suggests risk without reassurance",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-start gap-1.5 rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-2 py-[7px] text-[12px] text-[#9A9A93]"
                  >
                    <RiErrorWarningLine size={13} className="mt-0.5 shrink-0 text-[#E8A83A]" aria-hidden />
                    <span>{text}</span>
                  </div>
                ))}
                <div className="rounded-[7px] border border-[rgba(29,158,117,0.15)] bg-[rgba(29,158,117,0.07)] px-2 py-[7px] text-[12px] text-[#1D9E75]">
                  Add CISO quote below CTA
                </div>
              </div>
            </Cell>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFeaturesDivider() {
  return (
    <div className={LANDING_CONTAINER}>
      <div className={LANDING_DIVIDER} aria-hidden />
    </div>
  );
}
