import Link from "next/link";
import {
  LegalDocumentPage,
  LegalSection,
  type LegalSectionNav,
} from "@/components/LegalDocumentPage";

const SECTIONS: LegalSectionNav[] = [
  { id: "agreement", title: "Agreement" },
  { id: "service", title: "The Service" },
  { id: "eligibility", title: "Eligibility" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "ai-disclaimer", title: "AI disclaimer" },
  { id: "intellectual-property", title: "Intellectual property" },
  { id: "disclaimer", title: "Disclaimer" },
  { id: "limitation", title: "Limitation of liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "termination", title: "Termination" },
  { id: "changes", title: "Changes" },
  { id: "governing-law", title: "Governing law" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      lastUpdated="June 1, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="agreement" title="Agreement">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of Klynt at klynt.one (the &ldquo;Service&rdquo;). By accessing or
          using the Service, you agree to these Terms. If you do not agree, do
          not use the Service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="The Service">
        <p>
          Klynt analyzes publicly accessible web pages or screenshots you submit
          and generates automated UX clarity reports, including scores, issues,
          improvement suggestions, and copy refinements. Features may change,
          be added, or be removed at any time.
        </p>
        <p>
          The Service is currently offered without requiring account
          registration for basic use. Some features may be limited during
          pre-launch or promotional periods.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="Eligibility">
        <p>
          You must be at least 13 years old (or the minimum age required in your
          jurisdiction) to use the Service. By using Klynt, you represent that you
          meet this requirement and have the authority to agree to these Terms.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Service for unlawful purposes or to violate others&apos; rights</li>
          <li>
            Submit URLs, screenshots, or other content you do not have permission
            to analyze
          </li>
          <li>
            Attempt to disrupt, overload, scrape, reverse engineer, or circumvent
            the Service or its security controls
          </li>
          <li>
            Use automated means to abuse rate limits or generate excessive load
          </li>
          <li>
            Misrepresent AI-generated output as a guaranteed audit, human expert
            review, or legal/business advice without appropriate disclosure
          </li>
        </ul>
        <p>
          We may suspend or restrict access if we reasonably believe you have
          violated these Terms or used the Service in a harmful way.
        </p>
      </LegalSection>

      <LegalSection id="ai-disclaimer" title="AI disclaimer">
        <p>
          Reports are generated using artificial intelligence and automated
          analysis of visible page content. Output is provided for informational
          and educational purposes only. It is not professional design, legal,
          financial, or business advice.
        </p>
        <p>
          UX scores, impact estimates, and recommendations are approximations
          based on the content available at the time of analysis. You are
          responsible for evaluating results before making product, marketing, or
          business decisions.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual property">
        <p>
          The Klynt name, brand, website, software, and related materials are
          owned by us or our licensors and are protected by applicable
          intellectual property laws.
        </p>
        <p>
          You retain ownership of content you submit. You grant us a limited,
          non-exclusive license to process submitted URLs, screenshots, and
          related content solely to operate, provide, and improve the Service.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="Disclaimer">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
          IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that the Service will be uninterrupted, error-free,
          secure, or that reports will be accurate, complete, or suitable for any
          particular purpose.
        </p>
      </LegalSection>

      <LegalSection id="limitation" title="Limitation of liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, KLYNT AND ITS OPERATORS, AFFILIATES,
          AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE,
          DATA, GOODWILL, OR BUSINESS OPPORTUNITIES ARISING FROM YOUR USE OF THE
          SERVICE.
        </p>
        <p>
          Our total liability for any claim relating to the Service will not exceed
          the greater of (a) the amount you paid us for the Service in the twelve
          months before the claim, or (b) USD $100.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Klynt and its operators from
          any claims, damages, losses, or expenses (including reasonable legal
          fees) arising from your use of the Service, content you submit, or your
          violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate
          access, with or without notice, if you violate these Terms, create risk
          or legal exposure for us, or if we discontinue the Service.
        </p>
        <p>
          Sections that by their nature should survive termination — including
          disclaimers, limitations of liability, and indemnification — will
          survive.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may modify these Terms by posting an updated version on this page.
          The &ldquo;Last updated&rdquo; date will reflect the latest revision.
          Material changes take effect when posted unless stated otherwise.
          Continued use after changes become effective means you accept the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing law">
        <p>
          These Terms are governed by applicable law in the jurisdiction where
          Klynt operates, without regard to conflict-of-law principles. If any
          provision is found unenforceable, the remaining provisions remain in
          full force and effect.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these Terms? Contact us via the{" "}
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
