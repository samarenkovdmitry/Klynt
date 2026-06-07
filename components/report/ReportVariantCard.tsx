import type { ReactNode } from "react";
import {
  getReportCardClass,
  type ReportCardVariant,
} from "@/components/report/reportStyles";

type ReportVariantCardProps = {
  variant: ReportCardVariant;
  children: ReactNode;
};

export function ReportVariantCard({ variant, children }: ReportVariantCardProps) {
  return <div className={getReportCardClass(variant)}>{children}</div>;
}
