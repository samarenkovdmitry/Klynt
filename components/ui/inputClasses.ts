type InputFieldOptions = {
  disabled?: boolean;
  error?: boolean;
  withClearButton?: boolean;
  withMargin?: boolean;
};

/** Shared height/background for app form fields (contact, analyze, etc.). */
export const inputFieldSizeClass = "h-[52px] bg-[#FAFBFC] md:h-[54px]";

const inputFieldFocusClass =
  "focus:border-2 focus:border-brand-primary focus-visible:border-2 focus-visible:border-brand-primary";

export function inputFieldClass({
  disabled = false,
  error = false,
  withClearButton = false,
  withMargin = true,
}: InputFieldOptions = {}) {
  return [
    withMargin && "mt-3",
    "w-full rounded-2xl border bg-[#FAFBFC] text-[16px] text-[#061C2F] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-[border-width,border-color] duration-200 placeholder:text-[#9AA3AC] focus:outline-none",
    withClearButton ? "pl-5 pr-12" : "px-5",
    error ? "border-[#F0A8A5]" : "border-[#D8E0E7]",
    disabled
      ? "cursor-not-allowed opacity-60"
      : error
        ? "focus:border-2 focus:border-[#F0A8A5] focus-visible:border-2 focus-visible:border-[#F0A8A5]"
        : inputFieldFocusClass,
  ]
    .filter(Boolean)
    .join(" ");
}
