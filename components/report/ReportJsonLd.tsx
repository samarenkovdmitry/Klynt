import { JsonLd } from "@/components/JsonLd";
import type { AuditReport } from "@/lib/audit-report";
import {
  buildReportOgDescription,
  buildReportOgTitle,
  getReportOpenGraphImageUrl,
} from "@/lib/report-seo";
import { formatOverallScore, formatReportDomain } from "@/lib/report-hero-theme";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

type ReportJsonLdProps = {
  routeSlug: string;
  report: AuditReport;
  siteUrl: string;
};

export function ReportJsonLd({ routeSlug, report, siteUrl }: ReportJsonLdProps) {
  const pageUrl = absoluteUrl(`/report/${routeSlug}`, siteUrl);
  const domain = formatReportDomain(report.url);
  const score = formatOverallScore(report.score);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: buildReportOgTitle(report),
        description: buildReportOgDescription(report),
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        image: getReportOpenGraphImageUrl(routeSlug, siteUrl),
        datePublished: report.generatedAt,
        dateModified: report.generatedAt,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: siteUrl,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/klynt-logo-dark.svg", siteUrl),
          },
        },
        about: domain
          ? {
              "@type": "WebSite",
              name: domain,
              url: report.url,
            }
          : undefined,
        keywords: [
          "UX audit",
          "landing page",
          "conversion",
          domain,
        ].filter((value): value is string => Boolean(value)),
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "UX clarity score",
            value: `${score}/10`,
          },
          report.risk
            ? {
                "@type": "PropertyValue",
                name: "Risk level",
                value: String(report.risk),
              }
            : null,
        ].filter(
          (value): value is { "@type": "PropertyValue"; name: string; value: string } =>
            Boolean(value)
        ),
      }}
    />
  );
}
