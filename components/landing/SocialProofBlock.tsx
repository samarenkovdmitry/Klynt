import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";

export function SocialProofBlock() {
  return (
    <div className="mt-12 flex flex-col items-center px-5 py-[60px] text-center md:mt-24 md:px-6">
      <div className="relative z-10 flex -space-x-3">
        {SOCIAL_PROOF_AVATARS.map((src, i) => (
          <div
            key={src}
            className="
              relative
              h-12
              w-12
              shrink-0
              overflow-hidden
              rounded-full
              border-2
              border-white
              bg-[#E8F0F5]
              ring-1
              ring-[rgba(6,28,47,0.06)]
            "
            style={{ zIndex: SOCIAL_PROOF_AVATARS.length - i }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              width={48}
              height={48}
              className="block h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <p className="mt-6 text-[17px] font-medium text-[var(--brand-primary)]">
        Used by designers, founders and product teams
      </p>

      <p
        className="
          mt-4
          max-w-[620px]
          text-[24px]
          font-semibold
          leading-[1.2]
          tracking-[-0.04em]
          text-[#061C2F]
          md:text-[32px]
        "
      >
        &ldquo;The fastest way to spot UX problems before launch.&rdquo;
      </p>
    </div>
  );
}
