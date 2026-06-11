import Link from "next/link";

import { LANDING_CONTAINER } from "./landingPageStyles";

export function LandingTestFooter() {
  return (
    <footer className="relative overflow-hidden px-4 pb-6 pt-8 md:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(29,158,117,0.12),transparent_70%)]"
        aria-hidden
      />
      <div
        className={`${LANDING_CONTAINER} relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <span className="text-[12px] text-[#7A7A74]">© 2026 Klynt</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-[12px] text-[#7A7A74] transition-colors hover:text-[#9A9A93]">
            Privacy
          </Link>
          <Link href="/terms" className="text-[12px] text-[#7A7A74] transition-colors hover:text-[#9A9A93]">
            Terms
          </Link>
          <Link href="/contact" className="text-[12px] text-[#7A7A74] transition-colors hover:text-[#9A9A93]">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
