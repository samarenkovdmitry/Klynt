import type { ReactNode } from "react";

import {
  REPORT_SECTION_HEADING_CLASS,
  REPORT_SECTION_META_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

type ReportSectionShellProps = {
  id?: string;
  icon?: ReactNode;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  withCard?: boolean;
  className?: string;
};

export function ReportSectionShell({
  id,
  icon,
  title,
  meta,
  children,
  withCard = true,
  className = "",
}: ReportSectionShellProps) {
  return (
    <section
      id={id}
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS} ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className={REPORT_SECTION_HEADING_CLASS}>
          {icon ? <span className="text-[#7D8C99]">{icon}</span> : null}
          {title}
        </h2>
        {meta ? <div className={REPORT_SECTION_META_CLASS}>{meta}</div> : null}
      </div>

      {withCard ? (
        <div className={REPORT_SURFACE_CARD_CLASS}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}
