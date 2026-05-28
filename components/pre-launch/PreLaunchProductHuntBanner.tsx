import { RiProductHuntFill } from "@remixicon/react";

import { isPreLaunchEnabled, preLaunch } from "@/lib/pre-launch";

export function PreLaunchProductHuntBanner() {
  if (!isPreLaunchEnabled()) {
    return null;
  }

  return (
    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] font-medium leading-none text-white/90 md:mb-8 md:px-5 md:text-[15px]">
      <RiProductHuntFill
        size={22}
        className="shrink-0 text-[#DA552F]"
        aria-hidden
      />
      <span>{preLaunch.productHuntBanner.label}</span>
    </div>
  );
}
