import { Suspense } from "react";

import { AnalyzePageView } from "@/components/analyze/AnalyzePageView";

export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzePageView />
    </Suspense>
  );
}
