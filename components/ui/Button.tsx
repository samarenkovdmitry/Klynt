export function Button({
  children,
  disabled,
  className = "",
  ...props
}: any) {
  return (
    <button
      disabled={disabled}
      className={`
        w-full h-13 rounded-[8px] px-4
        text-base font-semibold leading-6
        text-white transition

        ${disabled
          ? "bg-[#DCE2E7] opacity-60 cursor-not-allowed"
          : "bg-[#14A8E8] hover:bg-[#1296D1] active:bg-[#0F7FB3]"
        }

        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
