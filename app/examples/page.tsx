import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";

import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { fetchExampleReports, getDomain, getTopFinding } from "@/lib/example-reports";
import { FaviconImg } from "@/components/examples/FaviconImg";

export const revalidate = 3600;

const TITLE = "Real UX Audit Examples";
const DESCRIPTION =
  "Browse recent landing page audits — real scores, real findings, no mockups. See what Klynt catches in under 60 seconds.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/examples") },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absoluteUrl("/examples"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

function scoreColor(score: number): { text: string; bg: string } {
  if (score >= 7) return { text: "#1E8A4F", bg: "#DCF0E3" };
  if (score >= 5) return { text: "#BA7517", bg: "#F5EAD6" };
  return { text: "#C0392B", bg: "#FDECEA" };
}

export default async function ExamplesPage() {
  const reports = await fetchExampleReports();

  return (
    <div className="min-h-screen bg-lv2-cream font-sans text-v2-dark antialiased">
      <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-16 md:pt-20">
        {/* Header */}
        <div className="mb-12 max-w-[600px]">
          <span className="mb-4 inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-faint">
            REAL AUDITS · NO MOCKUPS
          </span>
          <h1 className="mb-4 text-[38px] font-bold leading-[1.08] tracking-[-0.03em] md:text-[48px]">
            See what Klynt finds.
          </h1>
          <p className="text-[17px] leading-[1.6] text-[#57544C]">
            Recent landing page audits — real scores, real findings. Each one
            ran in under 60 seconds.
          </p>
        </div>

        {/* Grid */}
        {reports.length === 0 ? (
          <p className="text-[15px] text-v2-ink-faint">No examples yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((row) => {
              const domain = getDomain(row.audited_url);
              const score = Number(row.payload.score ?? 0);
              const colors = scoreColor(score);
              const topFinding = getTopFinding(row.payload);

              return (
                <Link
                  key={row.id}
                  href={`/report/${row.id}?demo=true`}
                  className="group flex flex-col rounded-[20px] border border-[#DCD8CD] bg-lv2-card p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(27,26,23,0.10)]"
                >
                  {/* Top row: favicon + domain + score */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#E8E4DB] bg-[#F4F1EB]">
                        <FaviconImg domain={domain} />
                      </div>
                      <span className="truncate font-mono text-[12.5px] font-medium tracking-[.02em] text-[#57544C]">
                        {domain}
                      </span>
                    </div>

                    <span
                      className="shrink-0 rounded-full px-[10px] py-[4px] font-mono text-[12px] font-semibold"
                      style={{ color: colors.text, background: colors.bg }}
                    >
                      {score.toFixed(1)}/10
                    </span>
                  </div>

                  {/* Top finding */}
                  {topFinding && (
                    <p className="mb-5 line-clamp-3 flex-1 text-[14px] leading-[1.55] text-[#3A3830]">
                      {topFinding}
                    </p>
                  )}

                  {/* CTA */}
                  <span className="mt-auto inline-flex items-center gap-[6px] text-[13.5px] font-semibold text-v2-accent transition-gap group-hover:gap-[9px]">
                    View report
                    <RiArrowRightLine size={15} aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] text-[#57544C]">
            Want to see your own landing page audited?
          </p>
          <Link
            href="/analyze"
            className="inline-flex h-[48px] items-center gap-2 rounded-[12px] bg-v2-dark px-[22px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Run a free audit
            <RiArrowRightLine size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
