import type { ReactNode } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { REPORT_PAGE_CONTAINER_CLASS } from "@/components/report/reportStyles";

export type LegalSectionNav = {
  id: string;
  title: string;
};

type LegalDocumentPageProps = {
  title: string;
  lastUpdated: string;
  sections: LegalSectionNav[];
  children: ReactNode;
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  sections,
  children,
}: LegalDocumentPageProps) {
  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-white px-4 pb-12 pt-6 text-[var(--ink-primary)] md:px-6 md:pt-10">
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-[88px] lg:self-start">
              <nav
                aria-label="Table of contents"
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="shrink-0 rounded-full border border-[rgba(6,28,47,0.08)] px-3 py-1.5 text-[13px] font-medium text-[rgba(6,28,47,0.65)] transition hover:border-[rgba(6,28,47,0.12)] hover:bg-[rgba(6,28,47,0.03)] hover:text-[var(--ink-primary)] lg:shrink lg:rounded-lg lg:border-0 lg:px-2 lg:py-2 lg:hover:bg-[rgba(6,28,47,0.04)]"
                  >
                    {section.title}
                  </Link>
                ))}
              </nav>
            </aside>

            <article className="min-w-0">
              <header className="border-b border-[rgba(6,28,47,0.06)] pb-6">
                <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[40px] md:leading-[1.05]">
                  {title}
                </h1>
                <p className="mt-3 text-[14px] text-[#8E99A2]">
                  Last updated: {lastUpdated}
                </p>
              </header>

              <div className="legal-prose mt-8 space-y-10 text-[15px] leading-7 text-[rgba(6,28,47,0.72)] md:text-[16px]">
                {children}
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#061C2F] md:text-[22px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
