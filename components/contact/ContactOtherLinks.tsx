import { RiMailLine, RiTwitterXLine } from "@remixicon/react";

const LINKS = [
  {
    href: "mailto:hello@klynt.one",
    label: "Email",
    value: "hello@klynt.one",
    icon: RiMailLine,
    accent: true,
    external: false,
  },
  {
    href: "https://x.com/useklynt",
    label: "X",
    value: "@useklynt",
    icon: RiTwitterXLine,
    accent: false,
    external: true,
  },
] as const;

type ContactOtherLinksProps = {
  className?: string;
  showHeading?: boolean;
};

export function ContactOtherLinks({
  className = "",
  showHeading = false,
}: ContactOtherLinksProps) {
  return (
    <div className={className}>
      {showHeading ? (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.07em] text-[#7A7A74]">
          Other ways to reach us
        </p>
      ) : null}

      <ul className="space-y-1">
        {LINKS.map(({ href, label, value, icon: Icon, accent, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group inline-flex items-center gap-2.5 rounded-lg py-1.5 text-[13px] text-[#9A9A93] transition-colors hover:text-[#F2F2EF]"
            >
              <Icon
                size={16}
                className={accent ? "text-[#1D9E75]" : "text-[#7A7A74]"}
                aria-hidden
              />
              <span className="text-[#7A7A74]">{label}</span>
              <span className="font-medium text-[#F2F2EF] group-hover:underline">{value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
