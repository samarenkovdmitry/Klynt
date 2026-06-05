import type { Metadata } from "next";

import { CopyOptimizerPageView } from "@/components/landing-copy/CopyOptimizerPageView";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

const TITLE = "Free Landing Page Copy Optimizer";
const DESCRIPTION =
  "Fix your landing page hero in minutes. Paste a URL for clearer headline, subheadline, and CTA suggestions — free from Klynt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: absoluteUrl("/landing-copy"),
  },
  openGraph: {
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absoluteUrl("/landing-copy"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default function LandingCopyPage() {
  return <CopyOptimizerPageView />;
}
