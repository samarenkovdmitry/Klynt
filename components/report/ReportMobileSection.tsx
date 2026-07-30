"use client";

import {
  RiErrorWarningLine,
  RiSmartphoneLine,
} from "@remixicon/react";

import type { PageComputedValues, ReportChecklistItem } from "@/lib/audit-report";
import {
  buildMobileSectionExtras,
  buildMobileSectionNarrative,
  getMobileChecklistIssues,
  hasMobileSectionData,
  mobileSectionHeaderSuffix,
  type MobileSectionExtra,
} from "@/lib/report-mobile-section";
import { resolveReportPreviewSrc } from "@/lib/report-preview-url";
import {
  REPORT_MOBILE_PREVIEW_DISPLAY_WIDTH,
  REPORT_MOBILE_PREVIEW_HEIGHT,
  REPORT_MOBILE_PREVIEW_WIDTH,
} from "@/lib/report-preview-size";
import {
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

type Props = {
  routeParam: string;
  checklist?: ReportChecklistItem[];
  computedValues?: PageComputedValues | null;
  mobileComputedValues?: PageComputedValues | null;
  mobilePreviewImage?: string;
  domain?: string;
};

const BODY_CLASS = "text-[15px] leading-[22.5px] text-[#061C2F]";
const ISSUE_TITLE_CLASS = "text-[15px] font-semibold leading-[22px] text-[#061C2F]";
const ISSUE_DETAIL_CLASS = "text-[14px] leading-[21px] text-[#616C77]";
const CAPTION_CLASS = "text-[13px] leading-[1.45] text-[#7D8C99]";

function resolveMobilePreviewSrc(
  routeParam: string,
  mobilePreviewImage?: string
): string | undefined {
  return resolveReportPreviewSrc(routeParam, mobilePreviewImage);
}

function MobileFindingRow({
  title,
  evidence,
  fix,
}: {
  title: string;
  evidence?: string;
  fix?: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <RiErrorWarningLine
        size={18}
        className="mt-0.5 shrink-0 text-status-weak"
        aria-hidden
      />
      <div className="min-w-0">
        <p className={ISSUE_TITLE_CLASS}>{title}</p>
        {evidence ? <p className={`mt-0.5 ${ISSUE_DETAIL_CLASS}`}>{evidence}</p> : null}
        {fix ? <p className={`mt-1.5 ${CAPTION_CLASS}`}>{fix}</p> : null}
      </div>
    </li>
  );
}

function MobilePreviewFrame({
  previewImage,
  domain,
}: {
  previewImage?: string;
  domain?: string;
}) {
  return (
    <div
      className="mx-auto"
      style={{ width: REPORT_MOBILE_PREVIEW_DISPLAY_WIDTH }}
    >
      <div className="overflow-hidden rounded-[20px] border border-black/[0.08] bg-[#F8FAFC] shadow-[0_6px_22px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center border-b border-black/[0.06] bg-white px-2.5 py-1.5">
          <span className="h-1 w-8 rounded-full bg-black/10" aria-hidden />
        </div>

        {previewImage ? (
          <div className="relative aspect-[390/520] overflow-hidden bg-[#F8FAFC]">
            <img
              src={previewImage}
              alt="Mobile hero capture at 390px width"
              width={REPORT_MOBILE_PREVIEW_WIDTH}
              height={REPORT_MOBILE_PREVIEW_HEIGHT}
              className="h-full w-full object-cover object-top"
            />
          </div>
        ) : (
          <div className="relative aspect-[390/520] overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7]">
            <div className="absolute inset-x-4 top-4 space-y-2">
              <div className="h-2 w-2/3 rounded bg-[rgba(6,28,47,0.08)]" />
              <div className="h-2 w-1/2 rounded bg-[rgba(6,28,47,0.06)]" />
              <div className="mt-4 h-10 rounded-md bg-[rgba(6,28,47,0.04)]" />
            </div>
          </div>
        )}

        {domain ? (
          <div className="border-t border-black/[0.06] bg-white px-2.5 py-1">
            <p className="truncate text-center text-[9px] text-[rgba(6,28,47,0.45)]">{domain}</p>
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-center text-[12px] leading-4 text-[#8E99A2]">390px viewport</p>
    </div>
  );
}

function renderExtraRow(extra: MobileSectionExtra) {
  return (
    <MobileFindingRow
      key={extra.id}
      title={extra.title}
      evidence={extra.detail}
      fix={extra.fix}
    />
  );
}

export function ReportMobileSection({
  routeParam,
  checklist = [],
  computedValues,
  mobileComputedValues,
  mobilePreviewImage,
  domain,
}: Props) {
  if (
    !hasMobileSectionData({
      mobileComputedValues,
      mobilePreviewImage,
      checklist,
      computedValues,
    })
  ) {
    return null;
  }

  const issues = getMobileChecklistIssues(checklist, computedValues, mobileComputedValues);
  const extras = buildMobileSectionExtras(issues, computedValues, mobileComputedValues);
  const narrative = buildMobileSectionNarrative({
    issues,
    desktop: computedValues,
    mobile: mobileComputedValues,
  });
  const previewSrc = resolveMobilePreviewSrc(routeParam, mobilePreviewImage);
  const hasFindings = issues.length > 0 || extras.length > 0;

  return (
    <section
      id="mobile"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportNewSectionHeader
        icon={<RiSmartphoneLine size={22} />}
        title="Mobile view"
        suffix={mobileSectionHeaderSuffix(issues.length, extras.length)}
      />

      <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} ${REPORT_SURFACE_CARD_CLASS}`}>
        <div className="grid min-w-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_168px] md:items-stretch">
          <div className="min-w-0 px-6 py-5 md:border-r md:border-[rgba(6,28,47,0.06)]">
            <p className={`mb-4 ${BODY_CLASS}`}>{narrative}</p>

            {!hasFindings ? (
              <p className={`${CAPTION_CLASS} text-status-good`}>
                Key hero elements stay visible on mobile.
              </p>
            ) : (
              <ul className="space-y-3.5">
                {issues.map((item) => (
                  <MobileFindingRow
                    key={item.id}
                    title={item.text}
                    evidence={item.evidence}
                    fix={item.fix}
                  />
                ))}
                {extras.map(renderExtraRow)}
              </ul>
            )}
          </div>

          {previewSrc ? (
            <div className="flex items-start justify-center border-t border-[rgba(6,28,47,0.06)] px-6 py-5 md:border-t-0">
              <MobilePreviewFrame previewImage={previewSrc} domain={domain} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
