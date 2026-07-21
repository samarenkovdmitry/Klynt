import { Suspense } from "react";

import { AnalyzePageFallback } from "@/components/analyze/AnalyzePageFallback";
import { AnalyzePageView } from "@/components/analyze/AnalyzePageView";

export default function AnalyzePage() {
  return (
    <Suspense fallback={<AnalyzePageFallback />}>
      <AnalyzePageView />
    </Suspense>
  );
}
