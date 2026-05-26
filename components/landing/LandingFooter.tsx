import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[rgba(6,28,47,0.06)] px-6 py-8">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 md:flex-row">
        <Link href="/" className="shrink-0" aria-label="Klynt — home">
          <img
            src="/klynt-logo-dark.svg"
            alt="Klynt"
            className="h-[34px] w-auto md:h-[40px]"
          />
        </Link>

        <div className="flex items-center gap-7 text-[14px] font-medium text-[#8F99A2]">
          <Link href="/privacy" className="transition hover:text-[#061C2F]">
            Privacy
          </Link>

          <Link href="/terms" className="transition hover:text-[#061C2F]">
            Terms
          </Link>

          <Link href="/contact" className="transition hover:text-[#061C2F]">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
