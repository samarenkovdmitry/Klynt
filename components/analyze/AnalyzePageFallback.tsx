import { RiLoader4Line } from "@remixicon/react";

import {
  ANALYZE_CARD_CLASS,
  ANALYZE_PAGE_CONTAINER_CLASS,
} from "@/lib/analyze-page-styles";

export function AnalyzePageFallback() {
  return (
    <main className="flex flex-1 flex-col bg-white px-4 pb-10 pt-6 text-[var(--ink-primary)] md:px-6 md:pb-12 md:pt-10">
      <div className={`${ANALYZE_PAGE_CONTAINER_CLASS} flex flex-1 flex-col justify-center`}>
        <div
          className={`${ANALYZE_CARD_CLASS} mx-auto mt-5 w-full max-w-[500px] px-8 py-10`}
          role="status"
          aria-live="polite"
          aria-label="Loading analyze page"
        >
          <div className="flex items-center justify-center gap-3">
            <RiLoader4Line
              size={22}
              className="shrink-0 animate-spin text-[var(--brand-primary)]"
              aria-hidden
            />
            <p className="text-[15px] leading-5 text-[#8E99A2]">Loading…</p>
          </div>
        </div>
      </div>
    </main>
  );
}
