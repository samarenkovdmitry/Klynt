import { LANDING_CONTAINER } from "./landingPageStyles";

export function LandingTestSeo() {
  return (
    <div className={`${LANDING_CONTAINER} px-4 pb-16 md:px-8`}>
      <div className="mx-auto max-w-[800px] space-y-2">
        <p className="text-[13px] leading-[1.7] text-[#7A7A74]">
          Klynt is a landing page improvement kit — paste any URL and get copy variants, a UX fix
          checklist, score potential, and export-ready tasks for your team. Built for founders,
          marketers, and designers who want actionable improvements, not abstract audit scores.
        </p>
        <p className="text-[13px] leading-[1.7] text-[#7A7A74]">
          Supports URL analysis and screenshot upload. Context-aware: adapts to your brand stage,
          traffic source, and target audience. Export as Markdown, designer brief, dev task list, or
          Notion-ready summary.
        </p>
      </div>
    </div>
  );
}
