type InputFieldOptions = {
  disabled?: boolean;
  error?: boolean;
  withClearButton?: boolean;
  withMargin?: boolean;
};

export function inputFieldClass({
  disabled = false,
  error = false,
  withClearButton = false,
  withMargin = true,
}: InputFieldOptions = {}) {
  return [
    withMargin && "mt-3",
    "w-full rounded-2xl border-2 bg-[#FCFDFD] text-[15px] text-[#061C2F] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200 placeholder:text-[#9AA3AC] focus:outline-none md:text-[16px]",
    withClearButton ? "pl-5 pr-12" : "px-5",
    error ? "border-[#F0A8A5]" : "border-[#D8E0E7]",
    disabled
      ? "cursor-not-allowed opacity-60"
      : !error && "focus:border-[#2563EB]",
  ]
    .filter(Boolean)
    .join(" ");
}
