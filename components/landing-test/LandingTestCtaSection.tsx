import { RiArrowRightLine } from "@remixicon/react";

import { Button } from "@/components/ui/Button";

import {
  EDITORIAL_BODY,
  EDITORIAL_BUTTON_CLASS,
  EDITORIAL_CONTAINER,
  EDITORIAL_HEADING,
  EDITORIAL_SECTION,
} from "./landingEditorialStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`${EDITORIAL_SECTION} pb-24 md:pb-32`}>
      <div className={`${EDITORIAL_CONTAINER} max-w-[640px]`}>
        <h2 className={EDITORIAL_HEADING}>
          See what visitors don&apos;t understand.
        </h2>
        <p className={`mt-4 ${EDITORIAL_BODY}`}>
          Run a free UX analysis in under a minute.
        </p>

        <div className="mt-8 md:mt-10">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} aria-hidden />}
            fullWidth={false}
            className={EDITORIAL_BUTTON_CLASS}
          >
            Start free audit
          </Button>
        </div>
      </div>
    </section>
  );
}
