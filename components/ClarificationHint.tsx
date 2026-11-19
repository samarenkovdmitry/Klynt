'use client';

import { useState } from 'react';
import { RiInformationLine } from '@remixicon/react';
import { t } from '@/lib/i18n';

export default function ClarificationHint({ id, align = 'right' }: { id: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={event => {
        if (!event.currentTarget.contains(document.activeElement)) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          setOpen(false);
          event.stopPropagation();
        }
      }}
    >
      <button type="button" aria-label={t('decisionAction.clarificationInfo')} aria-describedby={id}
        onClick={() => setOpen(true)}
        className="ml-0.5 flex h-7 w-5 items-center justify-center rounded-md text-ink-faint opacity-60 transition hover:text-ink-secondary hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
        <RiInformationLine size={14} aria-hidden="true" />
      </button>
      <span id={id} role="tooltip"
        className={open ? `absolute bottom-full z-20 w-56 max-w-[70vw] rounded-lg bg-white p-3 text-xs leading-relaxed text-ink-secondary shadow-lg ${align === 'left' ? 'left-0' : 'right-0'}` : 'sr-only'}>
        {t('decisionAction.clarificationHelp')}
      </span>
    </span>
  );
}
