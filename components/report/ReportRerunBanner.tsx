import { RiArrowRightUpLine, RiShare2Line } from "@remixicon/react";
import {
  REPORT_HERO_CARD_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

type Props = {
  onRerun: () => void;
  onShare: () => void;
};

export function ReportRerunBanner({ onRerun, onShare }: Props) {
  return (
    <div className={`flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 md:flex-row md:items-center md:justify-between ${REPORT_HERO_CARD_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}>
      <p className="text-center text-[15px] font-bold text-[#061C2F] md:min-w-0 md:text-left">
        Shipped fixes? Re-run to update your score.
      </p>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:shrink-0 md:items-center">
        <button
          onClick={onRerun}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#061C2F] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-80 md:inline-flex md:w-auto"
        >
          <RiArrowRightUpLine size={16} aria-hidden />
          Re-run analysis
        </button>
        <button
          onClick={onShare}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-5 text-[15px] font-medium text-[#061C2F] transition-colors hover:border-[#D0D5DA] md:inline-flex md:w-auto"
        >
          <RiShare2Line size={16} aria-hidden />
          Share
        </button>
      </div>
    </div>
  );
}
