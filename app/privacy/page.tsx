import Link from "next/link";
import {
  LegalDocumentPage,
  LegalSection,
  type LegalSectionNav,
} from "@/components/LegalDocumentPage";

const SECTIONS: LegalSectionNav[] = [
  { id: "introduction", title: "Introduction" },
  { id: "information-we-collect", title: "Information we collect" },
  { id: "how-we-use", title: "How we use information" },
  { id: "legal-bases", title: "Legal bases" },
  { id: "storage-retention", title: "Storage & retention" },
  { id: "sharing", title: "Sharing" },
  { id: "cookies-analytics", title: "Cookies & analytics" },
  { id: "your-rights", title: "Your rights" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      lastUpdated="June 1, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="introduction" title="Introduction">
        <p>
          Klynt (&ldquo;Klynt&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates
          klynt.one, an AI-powered UX clarity analyzer for landing pages and
          marketing sites. This Privacy Policy explains what information we
          collect, how we use it, and the choices you have when you use our
          Service.
        </p>
        <p>
          By using Klynt, you agree to the collection and use of information in
          accordance with this policy. If you do not agree, please do not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Information we collect">
        <p>Depending on how you use Klynt, we may process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              URLs and page content
            </strong>{" "}
            — the website address you submit and visible content captured from
            that page (including screenshots) to generate a UX report
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Report data
            </strong>{" "}
            — scores, findings, copy suggestions, timestamps, and related
            metadata created during an analysis
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Contact information
            </strong>{" "}
            — name, email address, and message content when you use our contact
            form
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Waitlist information
            </strong>{" "}
            — email address if you join our product waitlist
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Usage and device data
            </strong>{" "}
            — anonymized analytics such as pages visited, referrer, browser type,
            and general location (country/region) collected through analytics
            tools
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Technical logs
            </strong>{" "}
            — IP address, request timestamps, and error logs retained briefly for
            security, abuse prevention, and service reliability
          </li>
        </ul>
        <p>
          We do not require account registration to run a basic analysis. You
          should only submit URLs or screenshots you have permission to analyze.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="How we use information">
        <p>We use collected information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Generate and display UX clarity reports</li>
          <li>Operate, maintain, and improve the Service</li>
          <li>Respond to contact and support requests</li>
          <li>Send waitlist or product updates you opt into</li>
          <li>Monitor performance, debug issues, and prevent abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use submitted URLs,
          screenshots, or report content to build advertising profiles.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="Legal bases">
        <p>
          Where applicable data protection laws require a legal basis, we rely
          on:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Contract / service delivery
            </strong>{" "}
            — to provide the analysis you request
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Legitimate interests
            </strong>{" "}
            — to secure, improve, and measure the Service in a way that respects
            your privacy
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Consent
            </strong>{" "}
            — where required for optional communications such as waitlist emails
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="storage-retention" title="Storage & retention">
        <p>
          Reports may be stored in your browser (session and local storage) so
          you can revisit them in the same browser. Depending on configuration,
          reports may also be stored on our servers so shareable links and Open
          Graph previews work across devices.
        </p>
        <p>
          Contact form submissions and waitlist emails are retained only as long
          as needed to respond, operate the Service, or meet legal requirements.
          Server logs are kept for a limited period for security and diagnostics.
        </p>
        <p>
          You can remove locally stored reports by clearing your browser data.
          Shared report links may remain accessible until the report is deleted
          from our systems or the link expires, if applicable.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Sharing">
        <p>
          We share information only with service providers that help us operate
          Klynt, such as hosting, analytics, email delivery, database, and AI
          processing providers. These providers process data on our behalf under
          contractual safeguards and only for the purposes described in this
          policy.
        </p>
        <p>
          We may also disclose information if required by law, to protect our
          rights or users, or in connection with a merger, acquisition, or sale
          of assets, with appropriate notice where required.
        </p>
        <p>
          Public pages you analyze remain subject to their own privacy policies.
          When you share a report link, recipients you choose can view the report
          content available at that URL.
        </p>
      </LegalSection>

      <LegalSection id="cookies-analytics" title="Cookies & analytics">
        <p>
          We use essential cookies and similar technologies required for the
          Service to function. We may use privacy-focused analytics (such as
          Vercel Analytics and Speed Insights) to understand usage in aggregated
          form. These tools help us measure traffic and performance without
          using submitted audit content for advertising.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling
          certain cookies may affect how parts of the Service work.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, or restrict processing of your personal information, or to
          object to certain processing. You may also have the right to lodge a
          complaint with a supervisory authority.
        </p>
        <p>
          To exercise these rights, contact us using the{" "}
          <Link href="/contact" className="font-medium text-[var(--brand-primary)] hover:underline">
            contact page
          </Link>
          . We may need to verify your request before responding.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          Klynt is not directed to children under 13 (or the minimum age required
          in your jurisdiction). We do not knowingly collect personal information
          from children. If you believe a child has provided us personal
          information, please contact us and we will take appropriate steps to
          delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page indicates when the policy
          was last revised. Material changes will be posted on this page.
          Continued use of the Service after changes become effective constitutes
          acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about this Privacy Policy? Reach us via the{" "}
          <Link href="/contact" className="font-medium text-[var(--brand-primary)] hover:underline">
            contact page
          </Link>{" "}
          or email{" "}
          <a
            href="mailto:hello@klynt.one"
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            hello@klynt.one
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
