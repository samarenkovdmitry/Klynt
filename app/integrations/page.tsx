'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { siNotion, siLinear, siGoogledocs } from 'simple-icons';
import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons';

interface Integration {
  id: string;
  source: string;
  status: string;
  last_sync_at: string | null;
  config: any;
  created_at: string;
  updated_at: string;
}

// Figma and Slack have multi-colour marks, so they come from BrandIcons.
// Notion, Linear and Google Docs are single-colour brands — simple-icons
// gives the official path plus the official hex.
const ICONS: Record<string, { path?: string; hex?: string; title: string; render?: (size: number) => React.ReactNode }> = {
  figma: { title: 'Figma', render: (size) => <FigmaIcon size={size} /> },
  slack: { title: 'Slack', render: (size) => <SlackIcon size={size} /> },
  gdocs: { path: siGoogledocs.path, hex: siGoogledocs.hex, title: siGoogledocs.title },
  notion: { path: siNotion.path, hex: siNotion.hex, title: siNotion.title },
  linear: { path: siLinear.path, hex: siLinear.hex, title: siLinear.title },
};

function BrandIcon({ source, size = 24, className }: { source: string; size?: number; className?: string }) {
  const icon = ICONS[source];
  if (!icon) return null;
  if (icon.render) return <>{icon.render(size)}</>;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill={`#${icon.hex}`}
      aria-label={icon.title}
    >
      <path d={icon.path} />
    </svg>
  );
}

const AVAILABLE = [
  { source: 'figma', name: 'Figma', description: 'Import comments, versions, and design changes.' },
  { source: 'slack', name: 'Slack', description: 'Import messages, decisions, and mentions.' },
  { source: 'gdocs', name: 'Google Docs', description: 'Import briefs, comments, and decisions from docs.' },
  { source: 'notion', name: 'Notion', description: 'Sync pages and decisions.' },
  { source: 'linear', name: 'Linear', description: 'Sync issues and project status.' },
];

export default function IntegrationsPage() {
  const [projects, setProjects] = useState<{ id: string; name: string; unresolved_count?: number }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch('/api/projects'), fetch('/api/integrations')])
      .then(([p, i]) => Promise.all([p.json(), i.json()]))
      .then(([pData, iData]) => {
        const list = pData.projects || [];
        setProjects(list);
        setSelectedProjectId(list[0]?.id || null);
        setIntegrations(iData.integrations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-bg lg:flex-row">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        activeItem="integrations"
        loading={loading}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-semibold text-ink">Integrations</h1>
        <p className="mt-1 text-sm text-ink-muted">Connect tools to keep project state up to date.</p>

        {loading && <p className="mt-6 text-sm text-ink-muted">Loading...</p>}
        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mt-8 space-y-3">
              {AVAILABLE.map((service) => {
                const integration = integrations.find(i => i.source === service.source);
                return (
                  <div
                    key={service.source}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill-soft">
                        <BrandIcon source={service.source} size={22} className="h-[22px] w-[22px]" />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{service.name}</p>
                        <p className="text-xs text-ink-muted">
                          {integration
                            ? `${integration.status === 'active' ? 'Connected' : integration.status} · Last sync ${formatDate(integration.last_sync_at)}`
                            : service.description}
                        </p>
                      </div>
                    </div>
                    {integration ? (
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${integration.status === 'active' ? 'bg-green-500' : 'bg-line-strong'}`} />
                        <a
                          href={service.source === 'figma' || service.source === 'slack' ? `/api/integrations/${service.source}/connect?project_id=${selectedProjectId}` : `/api/integrations/${service.source}/connect`}
                          className="rounded-full bg-fill px-5 py-2.5 text-sm font-medium text-ink-secondary transition duration-200 active:scale-[0.98] hover:bg-fill disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reconnect
                        </a>
                      </div>
                    ) : service.source === 'figma' || service.source === 'slack' ? (
                      <a
                        href={`/api/integrations/${service.source}/connect?project_id=${selectedProjectId}`}
                        className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Connect
                      </a>
                    ) : (
                      <button
                        disabled
                        className="px-2 py-2.5 text-sm font-medium text-ink-faint"
                      >
                        Coming soon
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
