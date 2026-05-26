import { MOCKUP_HIGHLIGHTS } from "@/lib/landing-content";

export function TestFeatureStrip() {
  return (
    <section className="px-5 md:px-6">
      <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {MOCKUP_HIGHLIGHTS.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white px-4 py-5 transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(6,28,47,0.08)] md:px-5 md:py-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB]/15">
                <Icon size={18} />
              </div>

              <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.02em] text-[#061C2F] md:text-[15px]">
                {item.title}
              </h3>

              <p className="mt-1.5 text-[13px] leading-[1.45] text-[#6B7280] md:text-[14px]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
