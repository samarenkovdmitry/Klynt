import { isProductHuntFeaturedBadgeEnabled, preLaunch } from "@/lib/pre-launch";

export function ProductHuntFeaturedBadge() {
  if (!isProductHuntFeaturedBadgeEnabled()) {
    return null;
  }

  const { productUrl, badgeImageUrl } = preLaunch.productHunt;

  return (
    <div className="mb-4 flex justify-center lg:justify-start">
      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block opacity-90 transition hover:opacity-100"
      >
        <img
          src={badgeImageUrl}
          alt="Klynt - Turn any landing page into an actionable UX report | Product Hunt"
          width={250}
          height={54}
          className="h-auto w-[200px] md:w-[250px]"
          loading="eager"
          decoding="async"
        />
      </a>
    </div>
  );
}
