import Link from "next/link";
import {
  LegalDocumentPage,
  LegalSection,
} from "@/components/LegalDocumentPage";

export default function PrivacyPage() {
  return (
    <LegalDocumentPage title="Privacy Policy" lastUpdated="May 26, 2026">
      <LegalSection title="Overview">
        <p>
          Klynt (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides an AI-powered UX
          clarity analyzer for landing pages and marketing sites. This policy
          explains what information we process when you use klynt.one and how we
          handle it.
        </p>
      </LegalSection>

      <LegalSection title="Information we process">
        <p>When you run an analysis, we may process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The URL you submit for auditing</li>
          <li>Screenshots and visible page content captured from that URL</li>
          <li>Technical metadata needed to generate the report (timestamps, scores, structured findings)</li>
          <li>
            Information you voluntarily send through our contact form (name,
            email, message)
          </li>
        </ul>
        <p>
          We do not require account registration to run a basic audit. Reports
          are stored locally in your browser unless you choose to share them.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use submitted data to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Generate UX clarity reports and copy suggestions</li>
          <li>Improve reliability, accuracy, and performance of the service</li>
          <li>Respond to support or contact requests</li>
          <li>Protect the service against abuse and misuse</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use submitted URLs
          or screenshots for advertising profiles.
        </p>
      </LegalSection>

      <LegalSection title="Storage and retention">
        <p>
          Analysis reports are primarily stored in your browser (session and
          local storage). They may not be available on other devices or after
          you clear browser data. Contact form submissions are processed to
          deliver your message to our team and are retained only as long as
          needed to handle the request.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          We may rely on infrastructure and AI providers to capture pages,
          process content, and deliver the product. These providers process data
          on our behalf under appropriate contractual safeguards. Public pages
          you analyze remain subject to their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can stop using the service at any time. You can clear locally
          stored reports through your browser settings. For questions about data
          we hold from contact submissions, email us using the{" "}
          <Link href="/contact" className="font-medium text-[#2563EB] hover:underline">
            contact page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page will reflect the latest
          version. Continued use of Klynt after changes means you accept the
          updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy? Reach us via the{" "}
          <Link href="/contact" className="font-medium text-[#2563EB] hover:underline">
            contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
