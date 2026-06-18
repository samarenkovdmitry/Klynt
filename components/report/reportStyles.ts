export const REPORT_PAGE_CONTAINER_CLASS = "mx-auto w-full max-w-[1040px]";

export const REPORT_PAGE_BG_CLASS = "bg-[#EFF3F6]";

export const REPORT_SECTION_SPACING_CLASS = "mt-8";

export const REPORT_SECTION_SCROLL_MARGIN_CLASS = "scroll-mt-24";

export const REPORT_SECTION_HEADING_CLASS =
  "flex items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]";

export const REPORT_SECTION_META_CLASS = "text-[14px] leading-5 text-[#7D8C99]";

export const REPORT_SURFACE_BORDER_CLASS = "border border-[rgba(6,28,47,0.06)]";

export const REPORT_HERO_CARD_BORDER_CLASS = "border border-[rgba(6,28,47,0.09)]";

export const REPORT_HERO_RADIUS_CLASS = "rounded-[20px]";

export const REPORT_SURFACE_SHADOW_CLASS = "shadow-[0_10px_40px_rgba(0,0,0,0.03)]";

export const REPORT_SURFACE_CARD_CLASS = [
  "overflow-hidden bg-white",
  REPORT_HERO_RADIUS_CLASS,
  "shadow-[0_0_0_1px_rgba(6,28,47,0.08)]",
].join(" ");

export const REPORT_PANEL_HEADER_CLASS =
  "flex items-center justify-between gap-4 rounded-t-[20px] bg-[#ECF0F6] px-5 py-3 md:px-6 md:py-3.5";

export const REPORT_PANEL_TITLE_CLASS =
  "flex min-w-0 items-center gap-2 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#061C2F]";

export const REPORT_PANEL_META_CLASS = "shrink-0 text-[14px] leading-5 text-[#7D8C99]";

export const REPORT_ROW_DIVIDER_CLASS = "border-b border-[#EBEFF3]";

export const REPORT_SECTION_TITLE_CLASS =
  "text-[24px] md:text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]";

const REPORT_CARD_BASE_CLASS =
  "rounded-[18px] px-[21px] py-[21px] transition-all duration-200 hover:-translate-y-[1px] md:px-[33px] md:py-[25px]";

const REPORT_CARD_INTERACTION_CLASS =
  "hover:shadow-[0_0_0_1px_rgba(6,28,47,0.14)]";

export const REPORT_CARD_CLASS = [
  REPORT_CARD_BASE_CLASS,
  "bg-white",
  REPORT_CARD_INTERACTION_CLASS,
  "shadow-[0_0_0_1px_rgba(6,28,47,0.08)]",
].join(" ");

export const REPORT_CARD_CLASS_ANIMATED = REPORT_CARD_CLASS;

export type ReportCardVariant = "issue" | "improvement" | "copy";

const REPORT_CARD_VARIANT_CLASS: Record<ReportCardVariant, string> = {
  issue: ["bg-white", "shadow-[0_0_0_1px_rgba(6,28,47,0.08)]", REPORT_CARD_INTERACTION_CLASS].join(" "),
  improvement: ["bg-white", "shadow-[0_0_0_1px_rgba(6,28,47,0.08)]", REPORT_CARD_INTERACTION_CLASS].join(" "),
  copy: ["bg-white", "shadow-[0_0_0_1px_rgba(6,28,47,0.08)]", REPORT_CARD_INTERACTION_CLASS].join(" "),
};

export function getReportCardClass(variant: ReportCardVariant) {
  return [REPORT_CARD_BASE_CLASS, REPORT_CARD_VARIANT_CLASS[variant]].join(" ");
}

export const REPORT_CARD_TITLE_CLASS =
  "max-w-[42rem] text-[18px] font-semibold leading-6 tracking-[-0.02em] text-[var(--ink-primary)] md:text-[20px] md:leading-7";

export const REPORT_CARD_CONTENT_GAP_CLASS = "mt-3 md:mt-4";

export const REPORT_CARD_HEADLINE_BOTTOM_CLASS = "mb-4";

export const REPORT_SECTION_LABEL_CLASS =
  "text-[13px] font-medium uppercase tracking-[0.08em] text-[#8F99A2]";

export const REPORT_TAG_CLASS =
  "rounded-lg border border-[rgba(6,28,47,0.10)] bg-white px-[11px] py-[3px] text-[13px] font-medium leading-[19.5px] text-[#616C77]";

export const REPORT_WHY_BODY_CLASS =
  "text-[15px] font-normal leading-[20px] text-[rgba(6,28,47,0.5)]";

export const REPORT_WHY_BODY_MEASURE_CLASS = "max-w-[40rem]";

export const REPORT_WHY_DIVIDER_CLASS = "mt-4 border-t border-[rgba(6,28,47,0.06)] pt-4";

export const REPORT_METRIC_DESCRIPTION_CLASS =
  "mt-2 mb-2 text-[15px] leading-5 text-[rgba(6,28,47,0.5)] md:mt-3 md:mb-3";

export const REPORT_ACTION_BUTTON_CLASS =
  "flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 py-3 text-[14px] font-medium text-[var(--ink-primary)] transition-colors duration-200 hover:border-[rgba(20,168,232,0.25)] hover:bg-[#F8FBFF] md:flex-none md:rounded-full md:px-5";
