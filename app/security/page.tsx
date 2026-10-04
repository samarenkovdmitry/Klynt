import {
  LegalDocumentPage,
  LegalSection,
  type LegalSectionNav,
} from "@/components/LegalDocumentPage";
import { t } from "@/lib/i18n";

const SECTION_IDS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

// Items are stored as newline-joined dictionary strings so each section can
// carry a list without nested structures in the flat i18n dict.
function Items({ k }: { k: string }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {t(k)
        .split("\n")
        .map((item, i) => (
          <li key={i}>{item}</li>
        ))}
    </ul>
  );
}

export default function SecurityPage() {
  const sections: LegalSectionNav[] = SECTION_IDS.map((id) => ({
    id,
    title: t(`security.${id}.title`),
  }));

  return (
    <LegalDocumentPage
      title={t("security.h1")}
      lastUpdated="October 4, 2026"
      sections={sections}
    >
      <LegalSection id="s1" title={t("security.s1.title")}>
        <Items k="security.s1.items" />
      </LegalSection>

      <LegalSection id="s2" title={t("security.s2.title")}>
        <Items k="security.s2.items" />
      </LegalSection>

      {SECTION_IDS.slice(2).map((id) => (
        <LegalSection key={id} id={id} title={t(`security.${id}.title`)}>
          <p>{t(`security.${id}.body`)}</p>
        </LegalSection>
      ))}
    </LegalDocumentPage>
  );
}
