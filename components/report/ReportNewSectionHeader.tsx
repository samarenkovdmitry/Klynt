import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  /** Shown after middle dot in muted color — e.g. "3" or "6.8 → 8.9" */
  suffix?: string;
};

const ICON_BOX_CLASS =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(6,28,47,0.08)] bg-white [&_svg]:text-[#061C2F]";

const SECTION_TITLE_SUFFIX_SEPARATOR_CLASS =
  "mx-2.5 inline-block font-normal text-[#C5CDD6]";

export function ReportSectionTitleSuffix({ children }: { children: ReactNode }) {
  return (
    <>
      <span className={SECTION_TITLE_SUFFIX_SEPARATOR_CLASS} aria-hidden>
        ·
      </span>
      <span className="font-normal text-[#7D8C99]">{children}</span>
    </>
  );
}

export function ReportNewSectionHeader({ icon, title, suffix }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className={ICON_BOX_CLASS} aria-hidden>
        {icon}
      </div>
      <h3 className="text-[22px] font-bold leading-[30px] tracking-[-0.02em] text-[#061C2F] md:text-[23px]">
        {title}
        {suffix ? <ReportSectionTitleSuffix>{suffix}</ReportSectionTitleSuffix> : null}
      </h3>
    </div>
  );
}

export const REPORT_NEW_SECTION_BODY_GAP_CLASS = "mt-6";
