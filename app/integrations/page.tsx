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

function FigmaWatchPanel({ projectId, integration, onChanged }: {
  projectId: string;
  integration: Integration;
  onChanged: () => Promise<void>;
}) {
  const fileName = integration.config?.file_name;
  const mode = integration.config?.sync_mode;
  const [fileUrl, setFileUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const watch = async () => {
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/integrations/figma/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, fileUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(null);
      setFileUrl('');
      await onChanged();
    } else {
      setMsg(data.error || 'Failed to watch file');
    }
    setBusy(false);
  };

  const unwatch = async () => {
    setBusy(true);
    await fetch(`/api/integrations/figma/watch?project_id=${projectId}`, { method: 'DELETE' });
    await onChanged();
    setBusy(false);
  };

  const syncNow = async () => {
    setBusy(true);
    const res = await fetch('/api/jobs/poll-figma', { method: 'POST' });
    const data = await res.json();
    const added = (data.results || []).reduce(
      (n: number, r: any) => n + (r.versions?.inserted || 0) + (r.comments?.inserted || 0), 0);
    setMsg(res.ok ? `Synced — ${added} new event${added === 1 ? '' : 's'}` : (data.error || 'Sync failed'));
    await onChanged();
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded-xl bg-fill-soft px-4 py-3">
      {fileName ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-ink-muted">
            Watching <span className="font-medium text-ink">{fileName}</span>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${mode === 'webhooks' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {mode === 'webhooks' ? 'Live' : 'Polling'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'polling' && (
              <button onClick={syncNow} disabled={busy} className="text-xs font-medium text-ink-secondary hover:text-ink disabled:opacity-50">
                Sync now
              </button>
            )}
            <button onClick={unwatch} disabled={busy} className="text-xs font-medium text-ink-faint hover:text-ink-secondary disabled:opacity-50">
              Stop
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="Paste a Figma file link…"
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={watch}
              disabled={busy || !fileUrl.trim()}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              Watch
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Pick which file to track. Right-click a file in Figma → Copy link.
          </p>
        </>
      )}
      {msg && <p className="mt-2 text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}

function SlackChannelsPanel({ projectId, integration, onChanged }: {
  projectId: string;
  integration: Integration;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<{ id: string; name: string; is_private: boolean }[]>([]);
  const [selected, setSelected] = useState<string[]>(integration.config?.channel_ids || []);
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const names = integration.config?.channel_names || {};
  const selectedNames = selected.map((id) => names[id] || id).slice(0, 3);

  const load = async () => {
    setBusy(true);
    setLoadErr(null);
    const res = await fetch(`/api/integrations/slack/channels?project_id=${projectId}`);
    const data = await res.json();
    if (res.ok) {
      setChannels(data.channels);
      setSelected(data.selected);
      setOpen(true);
    } else {
      setLoadErr(data.error || 'Failed to load channels');
    }
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    await fetch('/api/integrations/slack/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, channelIds: selected }),
    });
    await onChanged();
    setOpen(false);
    setBusy(false);
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((c) => c !== id) : [...s, id]));

  return (
    <div className="mt-3 rounded-xl bg-fill-soft px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          {selected.length > 0
            ? `${selected.length} channel${selected.length === 1 ? '' : 's'} tracked${selectedNames.length ? ` — ${selectedNames.join(', ')}${selected.length > 3 ? '…' : ''}` : ''}`
            : 'All channels tracked'}
        </p>
        <button onClick={open ? () => setOpen(false) : load} disabled={busy} className="text-xs font-medium text-ink-secondary hover:text-ink disabled:opacity-50">
          {open ? 'Close' : 'Pick channels'}
        </button>
      </div>
      {loadErr && <p className="mt-2 text-xs text-red-500">{loadErr}</p>}
      {open && (
        <>
          <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">
            {channels.map((ch) => (
              <label key={ch.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink hover:bg-white/60">
                <input
                  type="checkbox"
                  checked={selected.includes(ch.id)}
                  onChange={() => toggle(ch.id)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span className="truncate">#{ch.name}</span>
                {ch.is_private && <span className="text-[10px] text-ink-faint">private</span>}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">
              Private channels: invite the bot with /invite first.
            </p>
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [projects, setProjects] = useState<{ id: string; name: string; unresolved_count?: number }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshIntegrations = async () => {
    const res = await fetch('/api/integrations');
    const data = await res.json();
    setIntegrations(data.integrations || []);
  };

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
                    className="rounded-2xl border border-line bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
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
                    {integration && service.source === 'figma' && selectedProjectId && (
                      <FigmaWatchPanel
                        projectId={selectedProjectId}
                        integration={integration}
                        onChanged={refreshIntegrations}
                      />
                    )}
                    {integration && service.source === 'slack' && selectedProjectId && (
                      <SlackChannelsPanel
                        projectId={selectedProjectId}
                        integration={integration}
                        onChanged={refreshIntegrations}
                      />
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
