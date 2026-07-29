/** Neutral charcoal base — Luma-style, slightly lifted from near-black */
export const LANDING_DARK = "#18181B";

export const LANDING_DARK_BG = "bg-[#18181B]";

/** Raised surface for inline UI previews on dark landing */
export const LANDING_SURFACE = "#1C1C1F";

export const LANDING_SURFACE_BG = "bg-[#1C1C1F]";

export const LANDING_SECTION =
  "border-t border-white/[0.06] px-5 py-20 md:px-6 md:py-28";

export const LANDING_CONTAINER = "mx-auto max-w-[1180px]";

export const LANDING_EYEBROW =
  "inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-[12px] font-medium tracking-[0.02em] text-indigo-200/85 md:px-3.5 md:py-1.5 md:text-[13px]";

export const LANDING_TITLE =
  "mt-3 max-w-[640px] text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-white md:text-[36px] md:leading-[1.08]";

export const LANDING_LEAD =
  "mt-3 max-w-[540px] text-[15px] leading-[26px] text-white/55 md:text-[16px] md:leading-[28px]";

export const LANDING_BUTTON =
  "!h-[52px] !min-h-[52px] !rounded-full !px-7 !text-[15px] !font-semibold";

/** Secondary pill — light border, matches hero + bottom CTA */
export const LANDING_BUTTON_SECONDARY = [
  LANDING_BUTTON,
  "inline-flex items-center justify-center border border-white/[0.12] bg-transparent text-white transition-colors hover:border-white/25 hover:bg-white/[0.04]",
].join(" ");

/** Primary pill on dark landing — white fill */
export const LANDING_BUTTON_PRIMARY = [
  LANDING_BUTTON,
  "inline-flex items-center justify-center gap-2 bg-white text-[#18181B] transition-opacity hover:opacity-90",
].join(" ");

export const LANDING_LINK =
  "text-[14px] font-medium text-white/50 underline-offset-4 transition hover:text-white/80 hover:underline";

/** Text link with bottom border — subtle at rest, full on hover */
export const LANDING_BORDER_LINK =
  "inline-flex items-center gap-2 border-b border-white/10 pb-1.5 text-[15px] font-medium text-white/60 transition-[color,border-color] hover:border-white hover:text-white/90";
