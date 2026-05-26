import { MOCKUP_HIGHLIGHTS } from "@/lib/landing-content";

export function FeatureHighlightGrid() {
  return (
    <section className="px-5 pt-12 md:px-6 md:pt-20">
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
        {MOCKUP_HIGHLIGHTS.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <Icon size={18} className="shrink-0 text-[#2563EB]" />
                <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#061C2F] md:text-[15px]">
                  {item.title}
                </span>
              </div>
              <p className="mt-2 max-w-[200px] text-[13px] leading-[1.45] text-[#6B7280] md:text-[14px]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
