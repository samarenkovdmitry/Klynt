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
        inline-flex
        items-center
        justify-center

        h-[56px]
        w-full

        rounded-2xl

        px-6

        text-[15px]
        font-semibold
        leading-none
        text-white

        transition-all
        duration-200

        shadow-[0_10px_30px_rgba(0,0,0,0.10)]

        ${disabled
          ? "bg-[#DCE2E7] opacity-60 cursor-not-allowed"
          : `
            bg-[#111827]
            hover:bg-black
            hover:-translate-y-[1px]
            active:translate-y-0
          `
        }

        ${className}
      `}
    >
      {children}
    </button>
  );
}