import { JsonLd } from "@/components/JsonLd";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

export function LandingJsonLd() {
  const siteUrl = getSiteUrl();

  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: siteUrl,
          logo: `${siteUrl}/klynt-logo-dark.svg`,
          email: "hello@klynt.one",
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: siteUrl,
          description: DEFAULT_DESCRIPTION,
        },
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: siteUrl,
          description: DEFAULT_DESCRIPTION,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
      ]}
    />
  );
}
