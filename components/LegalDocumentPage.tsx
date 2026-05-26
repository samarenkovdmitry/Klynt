import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";

type LegalDocumentPageProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalDocumentPage({
  title,
  lastUpdated,
  children,
}: LegalDocumentPageProps) {
  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-[#F5F7FA] px-4 py-5 md:px-6 md:py-8">
        <article
          className="
            mx-auto
            max-w-[760px]
            rounded-[28px]
            border
            border-[rgba(6,28,47,0.06)]
            bg-white
            px-5
            py-6
            shadow-[0_10px_40px_rgba(0,0,0,0.03)]
            md:rounded-[36px]
            md:px-10
            md:py-10
          "
        >
          <header className="border-b border-[rgba(6,28,47,0.06)] pb-6">
            <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[40px]">
              {title}
            </h1>
            <p className="mt-3 text-[14px] text-[#8E99A2]">
              Last updated: {lastUpdated}
            </p>
          </header>

          <div className="legal-prose mt-8 space-y-8 text-[15px] leading-7 text-[#4B5563] md:text-[16px]">
            {children}
          </div>
        </article>
      </main>
    </>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#061C2F] md:text-[22px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export { LegalSection };
