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
            bg-[#14A8E8]
                  px-7
                  py-4
                  text-[15px]
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#1198D2]
                  hover:shadow-[0_14px_34px_rgba(20,168,232,0.24)]
          `
        }

        ${className}
      `}
    >
      {children}
    </button>
  );
}
