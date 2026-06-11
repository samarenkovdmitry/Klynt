import Link from "next/link";

import { LANDING_CONTAINER } from "./landingPageStyles";

export function LandingTestFooter() {
  return (
    <footer className="border-t border-white/[0.08] px-4 py-6 md:px-8">
      <div className={`${LANDING_CONTAINER} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
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
