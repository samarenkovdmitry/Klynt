import { TEST_EYEBROW, TEST_HEADLINE, TEST_SUBCOPY, TEST_SUBCOPY_WRAP } from "./landingUpdateStyles";

type TestSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function TestSectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: TestSectionHeaderProps) {
  return (
    <div className={`mx-auto max-w-[760px] text-center ${className}`.trim()}>
      <p className={TEST_EYEBROW}>{eyebrow}</p>
      <h2 className={`mt-4 ${TEST_HEADLINE}`}>{title}</h2>
      {description ? (
        <p className={`${TEST_SUBCOPY_WRAP} ${TEST_SUBCOPY}`}>{description}</p>
      ) : null}
    </div>
  );
}
