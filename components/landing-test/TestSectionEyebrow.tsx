type TestSectionEyebrowProps = {
  index: string;
  label: string;
};

export function TestSectionEyebrow({ index, label }: TestSectionEyebrowProps) {
  return (
    <p className="text-[12px] font-semibold tracking-[0.14em] text-[#2563EB] uppercase">
      [{index}] {label}
    </p>
  );
}
