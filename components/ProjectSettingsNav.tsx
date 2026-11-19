'use client';

import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function ProjectSettingsNav({ projectId, active }: {
  projectId: string | null;
  active: 'general' | 'sources';
}) {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return (
    <nav aria-label={t('nav.projectSettings')} className="my-5 flex gap-5 border-b border-line">
      {([
        ['general', '/settings', t('settings.general')],
        ['sources', '/integrations', t('settings.sources')],
      ] as const).map(([key, href, label]) => (
        <Link key={key} href={`${href}${query}`} aria-current={active === key ? 'page' : undefined}
          className={`border-b-2 pb-3 text-sm ${active === key ? 'border-[var(--accent)] font-medium text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
