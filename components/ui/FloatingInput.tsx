'use client'

import { useState } from 'react'

type FloatingInputProps = {
  id: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  required?: boolean
  autoComplete?: string
  size?: 'base' | 'lg'
}

export function FloatingInput({
  id,
  type = 'text',
  value,
  onChange,
  label,
  required,
  autoComplete,
  size = 'base',
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const isFloating = focused || value.length > 0

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-5 transition-all duration-200 pointer-events-none ${
          isFloating
            ? 'top-2.5 -translate-y-0 text-xs'
            : 'top-1/2 -translate-y-1/2 text-base'
        } ${
          focused
            ? 'text-[var(--accent-link)]'
            : isFloating
              ? 'text-ink-muted'
              : 'text-ink-faint'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className={`w-full rounded-2xl border border-line bg-field px-5 pt-7 pb-2 text-ink transition placeholder:text-transparent outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white ${
          size === 'lg' ? 'text-lg' : 'text-base'
        }`}
      />
    </div>
  )
}
