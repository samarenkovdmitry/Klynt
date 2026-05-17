export function Button({
  children,
  disabled,
  className = "",
  ...props
}: any) {
  return (
    <button
    {...props}
      disabled={disabled}
      className={`
        h-[56px]
  rounded-2xl
  text-[15px]
  font-semibold
        text-white transition

        ${disabled
          ? "bg-[#DCE2E7] opacity-60 cursor-not-allowed"
          : "bg-[#14A8E8] hover:bg-[#1296D1] active:bg-[#0F7FB3]"
        }

        ${className}
      `}
    >
      {children}
    </button>
  );
}
