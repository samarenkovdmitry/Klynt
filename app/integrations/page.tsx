'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavigation from '@/components/TopNavigation';
import ProjectSettingsNav from '@/components/ProjectSettingsNav';
import { siNotion, siLinear, siGoogledocs, siTelegram } from 'simple-icons';
import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons';
import { RiArrowRightUpLine, RiCheckboxCircleLine, RiCloseLine, RiDeleteBinLine, RiErrorWarningLine, RiEyeLine, RiForbidLine } from '@remixicon/react';
import { track } from '@vercel/analytics';
import { getEnabledConnectors, getLocale } from '@/lib/market';
import { t } from '@/lib/i18n';

interface Integration {
  id: string;
  project_id: string;
  source: string;
  status: string;
  last_sync_at: string | null;
  config: any;
  event_count?: number;
  created_at: string;
  updated_at: string;
}

// What Klynt reads / never does / how to leave — shown on unconnected cards
// so the OAuth screen isn't the first place a user learns the scope.
function TrustList({ source }: { source: string }) {
  const rows = [
    { icon: <RiEyeLine size={13} />, label: t('trust.reads'), text: t(`trust.${source}.reads`) },
    { icon: <RiForbidLine size={13} />, label: t('trust.never'), text: t(`trust.${source}.never`) },
    { icon: <RiDeleteBinLine size={13} />, label: t('trust.exit'), text: t('trust.exitText') },
  ];
  return (
    <div className="mt-3 space-y-1.5 rounded-xl bg-fill-soft px-4 py-3">
      {rows.map((r, i) => (
        <div key={i} className="flex items-baseline gap-2 text-[11px] leading-snug">
          <span className="mt-px shrink-0 translate-y-0.5 text-ink-faint">{r.icon}</span>
          <span className="text-ink-muted">
            <span className="font-semibold text-ink-secondary">{r.label}</span> — {r.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// Keyword denylist — matching messages are dropped at ingestion, never stored.
function PrivacyPanel({ projectId, integration, onChanged, defaultOpen = false }: {
  projectId: string;
  integration: Integration;
  onChanged: () => Promise<void>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const keywords: string[] = integration.config?.excluded_keywords || [];
  const [value, setValue] = useState(keywords.join(', '));

  useEffect(() => {
    setValue(keywords.join(', '));
  }, [integration.config?.excluded_keywords]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true);
    await fetch('/api/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        source: integration.source,
        excludedKeywords: value.split(',').map((k) => k.trim()).filter(Boolean),
      }),
    });
    track('integration_privacy_saved', { source: integration.source });
    await onChanged();
    setOpen(false);
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded-xl bg-fill-soft px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          {t('integrations.privacy.title')}
          {keywords.length > 0 && (
            <span className="ml-2 text-ink-faint">
              {t('integrations.privacy.active', { count: keywords.length })} — {keywords.slice(0, 3).join(', ')}{keywords.length > 3 ? '…' : ''}
            </span>
          )}
        </p>
        <button onClick={() => setOpen(!open)} className="text-xs font-medium text-ink-secondary hover:text-ink">
          {open ? t('integrations.slack.close') : t('settings.edit')}
        </button>
      </div>
      {open && (
        <>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('integrations.privacy.placeholder')}
            className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">{t('integrations.privacy.hint')}</p>
            <button
              onClick={save}
              disabled={busy}
              className="ml-3 shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t('integrations.slack.save')}
            </button>
          </div>
        </>
      )}
    </div>
  );
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
  telegram: { path: siTelegram.path, hex: siTelegram.hex, title: siTelegram.title },
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

const ALL_SERVICES = [
  { source: 'figma', name: 'Figma', implemented: true },
  { source: 'slack', name: 'Slack', implemented: true },
  { source: 'linear', name: 'Linear', implemented: true },
  { source: 'telegram', name: 'Telegram', implemented: true },
  { source: 'gdocs', name: 'Google Docs', implemented: false },
  { source: 'notion', name: 'Notion', implemented: false },
];

const AVAILABLE = ALL_SERVICES.filter(s => getEnabledConnectors().includes(s.source));

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
      setMsg(data.error || t('integrations.watchFailed'));
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
    setMsg(res.ok
      ? t(added === 1 ? 'integrations.figma.syncedOne' : 'integrations.figma.synced', { count: added })
      : (data.error || t('integrations.figma.syncFailed')));
    await onChanged();
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded-xl bg-fill-soft px-4 py-3">
      {fileName ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-ink-muted">
            {t('integrations.figma.watching')} <span className="font-medium text-ink">{fileName}</span>
            <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${mode === 'webhooks' ? 'border-green-300 bg-white text-green-700' : 'border-amber-300 bg-white text-amber-700'}`}>
              {mode === 'webhooks' ? t('integrations.figma.live') : t('integrations.figma.polling')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'polling' && (
              <button onClick={syncNow} disabled={busy} className="text-xs font-medium text-ink-secondary hover:text-ink disabled:opacity-50">
                {t('integrations.figma.syncNow')}
              </button>
            )}
            <button onClick={unwatch} disabled={busy} className="text-xs font-medium text-ink-faint hover:text-ink-secondary disabled:opacity-50">
              {t('integrations.figma.stop')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder={t('integrations.figma.filePlaceholder')}
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={watch}
              disabled={busy || !fileUrl.trim()}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t('integrations.figma.watch')}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            {t('integrations.figma.hint')}
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
  const [channels, setChannels] = useState<{ id: string; name: string; is_private: boolean }[]>([]);
  const [selected, setSelected] = useState<string[]>(integration.config?.channel_ids || []);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/integrations/slack/channels?project_id=${projectId}`);
    const data = await res.json();
    if (res.ok) {
      setChannels(data.channels);
      setSelected(data.selected);
    } else {
      setLoadErr(data.error || t('integrations.loadChannelsFailed'));
    }
    setLoading(false);
  };

  const retry = () => {
    setLoading(true);
    setLoadErr(null);
    load();
  };

  useEffect(() => {
    Promise.resolve().then(load);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true);
    await fetch('/api/integrations/slack/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, channelIds: selected }),
    });
    track('slack_channels_saved', { count: selected.length });
    await onChanged();
    setBusy(false);
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((c) => c !== id) : [...s, id]));

  return (
    <div className="rounded-xl bg-fill-soft px-4 py-3">
      <p className="text-xs font-medium text-ink-secondary">{t('integrations.slack.channelsTitle')}</p>
      {loading && <p className="mt-2 text-xs text-ink-faint">{t('integrations.loading')}</p>}
      {loadErr && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-red-500">{loadErr}</p>
          <button onClick={retry} className="shrink-0 text-xs font-medium text-ink-secondary hover:text-ink">
            {t('integrations.retry')}
          </button>
        </div>
      )}
      {!loading && !loadErr && (
        <>
          <p className="mt-2 text-[11px] text-ink-faint">
            {t('integrations.slack.firstHint')}
          </p>
          <div className="mt-1.5 max-h-48 space-y-1 overflow-y-auto">
            {channels.map((ch) => (
              <label key={ch.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink hover:bg-white/60">
                <input
                  type="checkbox"
                  checked={selected.includes(ch.id)}
                  onChange={() => toggle(ch.id)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span className="truncate">#{ch.name}</span>
                {ch.is_private && <span className="text-[10px] text-ink-faint">{t('integrations.slack.private')}</span>}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">
              {t('integrations.slack.privateHint')}
            </p>
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t('integrations.slack.save')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LinearTeamsPanel({ projectId, integration, onChanged }: {
  projectId: string;
  integration: Integration;
  onChanged: () => Promise<void>;
}) {
  const [teams, setTeams] = useState<{ id: string; name: string; key: string }[]>([]);
  const [selected, setSelected] = useState<string[]>(integration.config?.team_ids || []);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/integrations/linear/teams?project_id=${projectId}`);
    const data = await res.json();
    if (res.ok) {
      setTeams(data.teams);
      setSelected(data.selected);
    } else {
      setLoadErr(data.error || t('integrations.loadTeamsFailed'));
    }
    setLoading(false);
  };

  const retry = () => {
    setLoading(true);
    setLoadErr(null);
    load();
  };

  useEffect(() => {
    Promise.resolve().then(load);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setBusy(true);
    const teamNames = Object.fromEntries(
      teams.filter((t) => selected.includes(t.id)).map((t) => [t.id, t.name]),
    );
    await fetch('/api/integrations/linear/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, teamIds: selected, teamNames }),
    });
    await onChanged();
    setBusy(false);
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((t) => t !== id) : [...s, id]));

  return (
    <div className="rounded-xl bg-fill-soft px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-secondary">{t('integrations.linear.teamsTitle')}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${integration.config?.webhook_id ? 'border-green-300 bg-white text-green-700' : 'border-amber-300 bg-white text-amber-700'}`}>
          {integration.config?.webhook_id ? t('integrations.linear.live') : t('integrations.linear.noWebhook')}
        </span>
      </div>
      {loading && <p className="mt-2 text-xs text-ink-faint">{t('integrations.loading')}</p>}
      {loadErr && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-red-500">{loadErr}</p>
          <button onClick={retry} className="shrink-0 text-xs font-medium text-ink-secondary hover:text-ink">
            {t('integrations.retry')}
          </button>
        </div>
      )}
      {!loading && !loadErr && (
        <>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {teams.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink hover:bg-white/60">
                <input
                  type="checkbox"
                  checked={selected.includes(t.id)}
                  onChange={() => toggle(t.id)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                <span className="truncate">{t.name}</span>
                <span className="text-[10px] text-ink-faint">{t.key}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">
              {t('integrations.linear.uncheckAll')}
            </p>
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t('integrations.linear.save')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TelegramConnectPanel({ projectId, integration, onChanged, onNotice }: {
  projectId: string;
  integration: Integration | undefined;
  onChanged: () => Promise<void>;
  onNotice: (n: { kind: 'success' | 'error'; text: string } | null) => void;
}) {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  // Manual-token mode is only revealed when the deployment has no shared bot
  const [manualToken, setManualToken] = useState(false);

  const botUsername = integration?.config?.bot_username;
  const chatTitle = integration?.config?.chat_title;
  const chatBound = Boolean(integration?.config?.chat_id);
  const linkCode = integration?.config?.link_code;
  const deepLink = botUsername && linkCode
    ? `https://t.me/${botUsername}?startgroup=${linkCode}`
    : null;

  // While waiting for the chat to bind, keep refreshing the card
  useEffect(() => {
    if (!integration || chatBound) return;
    const id = setInterval(() => onChanged(), 4000);
    return () => clearInterval(id);
  }, [integration, chatBound, onChanged]);

  const connect = async () => {
    setBusy(true);
    const res = await fetch('/api/integrations/telegram/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...(manualToken ? { botToken: token.trim() } : {}) }),
    });
    const data = await res.json();
    if (res.ok) {
      track('integration_connected', { source: 'telegram' });
      onNotice({ kind: 'success', text: t('integrations.telegram.connectedNotice', { bot: data.bot_username }) });
      setToken('');
      await onChanged();
    } else if (data.code === 'token_required') {
      setManualToken(true);
    } else {
      onNotice({ kind: 'error', text: data.error || t('integrations.connectFailed') });
    }
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded-xl bg-fill-soft px-4 py-3">
      {integration ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-ink-muted">
            {t('integrations.telegram.bot')} <span className="font-medium text-ink">@{botUsername}</span>
            <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${chatBound ? 'border-green-300 bg-white text-green-700' : 'border-amber-300 bg-white text-amber-700'}`}>
              {chatBound ? t('integrations.telegram.tracking', { chat: chatTitle || 'chat' }) : t('integrations.telegram.waiting')}
            </span>
          </div>
          {!chatBound && (
            <>
              {deepLink ? (
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
                >
                  {t('integrations.telegram.addToChat', { bot: botUsername })}
                </a>
              ) : null}
              <p className="w-full text-[11px] text-ink-faint">
                {deepLink
                  ? t('integrations.telegram.addHint')
                  : t('integrations.telegram.addBot', { bot: botUsername })}
              </p>
            </>
          )}
        </div>
      ) : manualToken ? (
        <>
          <div className="flex gap-2">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('integrations.telegram.tokenPlaceholder')}
              type="password"
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:outline-none"
            />
            <button
              onClick={connect}
              disabled={busy || !token.trim()}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {t('integrations.connect')}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            {t('integrations.telegram.howto')}
          </p>
        </>
      ) : (
        <>
          <button
            onClick={connect}
            disabled={busy}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {t('integrations.connect')}
          </button>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            {t('integrations.telegram.howtoShared')}
          </p>
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
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [settingsSource, setSettingsSource] = useState<string | null>(null);

  const refreshIntegrations = async () => {
    const res = await fetch('/api/integrations');
    const data = await res.json();
    setIntegrations(data.integrations || []);
  };

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryProjectId = params.get('projectId');
    const successParam = params.get('success');
    const errorParam = params.get('error');
    if (successParam) {
      const name = successParam.replace(/_connected$/, '');
      track('integration_connected', { source: name });
      setNotice({ kind: 'success', text: t('integrations.connectedNotice', { name: name.charAt(0).toUpperCase() + name.slice(1) }) });
      if (queryProjectId) {
        fetch('/api/jobs/process-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: queryProjectId }),
        }).catch(() => {});
      }
      router.replace(`/integrations${queryProjectId ? `?projectId=${queryProjectId}` : ''}`, { scroll: false });
    } else if (errorParam) {
      setNotice({ kind: 'error', text: t('integrations.connectionFailed', { error: errorParam.replace(/_/g, ' ') }) });
      router.replace(`/integrations${queryProjectId ? `?projectId=${queryProjectId}` : ''}`, { scroll: false });
    }
    Promise.all([fetch('/api/projects'), fetch('/api/integrations')])
      .then(([p, i]) => Promise.all([p.json(), i.json()]))
      .then(([pData, iData]) => {
        const list: { id: string; name: string }[] = pData.projects || [];
        setProjects(list);
        const initial = queryProjectId && list.find(p => p.id === queryProjectId)
          ? queryProjectId
          : list[0]?.id || null;
        setSelectedProjectId(initial);
        setIntegrations(iData.integrations || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!settingsSource) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsSource(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [settingsSource]);

  useEffect(() => {
    if (!settingsSource) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [settingsSource]);

  const disconnect = async (source: string) => {
    if (!selectedProjectId) return;
    if (!window.confirm(t('integrations.disconnectConfirm', { source }))) return;
    const res = await fetch(`/api/integrations?project_id=${selectedProjectId}&source=${source}`, { method: 'DELETE' });
    if (res.ok) {
      setSettingsSource(null);
      await refreshIntegrations();
      setNotice({ kind: 'success', text: t('integrations.disconnectedNotice', { name: source.charAt(0).toUpperCase() + source.slice(1) }) });
    } else {
      setNotice({ kind: 'error', text: t('integrations.disconnectFailed') });
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.replace(`/integrations?projectId=${projectId}`, { scroll: false });
  };

  const formatDate = (date: string | null) => {
    if (!date) return t('integrations.never');
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return t('integrations.justNow');
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString(getLocale() === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' });
  };

  // One-line summary of what the source currently tracks — shown on the card,
  // full controls live in the settings drawer.
  const scopeText = (source: string, integration: Integration): string => {
    const cfg = integration.config || {};
    if (source === 'figma') return cfg.file_name || t('integrations.figma.noFile');
    if (source === 'slack') {
      const n = (cfg.channel_ids || []).length;
      return n
        ? t(n === 1 ? 'integrations.slack.channelTracked' : 'integrations.slack.channelsTracked', { count: n })
        : t('integrations.slack.allChannels');
    }
    if (source === 'linear') {
      const n = (cfg.team_ids || []).length;
      return n
        ? t(n === 1 ? 'integrations.linear.teamTracked' : 'integrations.linear.teamsTracked', { count: n })
        : t('integrations.linear.allTeams');
    }
    if (source === 'telegram') {
      return cfg.chat_id
        ? t('integrations.telegram.tracking', { chat: cfg.chat_title || 'chat' })
        : t('integrations.telegram.waiting');
    }
    return '';
  };

  const statusParts = (source: string, integration: Integration): string[] => [
    integration.status === 'active' ? t('integrations.connected') : integration.status,
    scopeText(source, integration),
    `${t('integrations.lastSync')} ${formatDate(integration.last_sync_at)}`,
    integration.event_count ? t('integrations.imported', { count: integration.event_count }) : '',
  ].filter(Boolean);

  const renderMeta = (parts: string[]) => parts.map((part, i) => (
    <span key={i}>
      {i > 0 && <span className="mx-1.5" aria-hidden="true">·</span>}
      {part}
    </span>
  ));

  const drawerService = AVAILABLE.find((s) => s.source === settingsSource);
  const drawerIntegration = settingsSource
    ? integrations.find((i) => i.source === settingsSource && i.project_id === selectedProjectId)
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-app-bg">
      <TopNavigation
        projects={projects}
        selectedProjectId={selectedProjectId}
        activeItem="integrations"
        onProjectChange={handleProjectChange}
        integrations={loading ? undefined : integrations}
        loading={loading}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-semibold text-ink">{t('nav.projectSettings')}</h1>
        <ProjectSettingsNav projectId={selectedProjectId} active="sources" />
        <p className="mt-1 text-sm text-ink-muted">{t('integrations.subtitle')}</p>
        <a href="/security" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-link)] hover:underline">
          {t('integrations.securityLink')}
          <RiArrowRightUpLine size={13} />
        </a>

        {notice && (
          <div className={`mt-4 flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm ${
            notice.kind === 'success' ? 'border-green-300 text-green-800' : 'border-red-300 text-red-700'
          }`}>
            {notice.kind === 'success'
              ? <RiCheckboxCircleLine size={18} className="shrink-0 text-green-600" />
              : <RiErrorWarningLine size={18} className="shrink-0 text-red-500" />}
            <span className="flex-1">{notice.text}</span>
            <button onClick={() => setNotice(null)} className="ml-3 text-current opacity-60 hover:opacity-100" aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {loading && <p className="mt-6 text-sm text-ink-muted">{t('integrations.loading')}</p>}
        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="mt-8 space-y-3">
              {AVAILABLE.filter((s) => s.implemented).map((service) => {
                const integration = integrations.find(
                  i => i.source === service.source && i.project_id === selectedProjectId,
                );
                const chatBound = service.source !== 'telegram' || Boolean(integration?.config?.chat_id);
                // First Slack connect: no channels picked yet — surface the
                // picker as the primary action instead of a neutral "Configure".
                const needsSetup = service.source === 'slack' && integration?.config?.channel_ids === undefined;
                return (
                  <div
                    key={service.source}
                    className="rounded-2xl border border-line bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fill-soft">
                        <BrandIcon source={service.source} size={22} className="h-[22px] w-[22px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{service.name}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {integration
                            ? renderMeta(statusParts(service.source, integration))
                            : t(`integrations.${service.source}.desc`)}
                        </p>
                      </div>
                    </div>
                    {integration && chatBound ? (
                      <div className="flex shrink-0 items-center gap-3">
                        {integration.status !== 'active' && service.source !== 'telegram' && (
                          <a
                            href={`/api/integrations/${service.source}/connect?project_id=${selectedProjectId}`}
                            onClick={() => track('integration_connect_clicked', { source: service.source })}
                            className="rounded-lg bg-fill px-5 py-2.5 text-sm font-medium text-ink-secondary transition duration-200 active:scale-[0.98] hover:bg-fill"
                          >
                            {t('integrations.reconnect')}
                          </a>
                        )}
                        <span className={`h-2 w-2 rounded-full ${integration.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <button
                          onClick={() => setSettingsSource(service.source)}
                          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition duration-200 active:scale-[0.98] ${
                            needsSetup
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]'
                              : 'bg-fill text-ink-secondary hover:bg-fill'
                          }`}
                        >
                          {needsSetup ? t('integrations.slack.pickChannels') : t('integrations.configure')}
                        </button>
                      </div>
                    ) : !integration && service.source !== 'telegram' ? (
                      <a
                        href={`/api/integrations/${service.source}/connect?project_id=${selectedProjectId}`}
                        onClick={() => track('integration_connect_clicked', { source: service.source })}
                        className="shrink-0 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)]"
                      >
                        {t('integrations.connect')}
                      </a>
                    ) : integration ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    ) : null}
                    </div>
                    {!integration && <TrustList source={service.source} />}
                    {/* Telegram binding is an active flow — stays on the card
                        until the chat is linked; afterwards it moves to the drawer */}
                    {service.source === 'telegram' && selectedProjectId && !chatBound && (
                      <TelegramConnectPanel
                        projectId={selectedProjectId}
                        integration={integration}
                        onChanged={refreshIntegrations}
                        onNotice={setNotice}
                      />
                    )}
                  </div>
                );
              })}

              {AVAILABLE.some((s) => !s.implemented) && (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    {t('integrations.comingSoon')}
                  </p>
                  <div className="divide-y divide-line-soft">
                    {AVAILABLE.filter((s) => !s.implemented).map((service) => (
                      <div key={service.source} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fill-soft">
                          <BrandIcon source={service.source} size={22} className="h-[22px] w-[22px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{service.name}</p>
                          <p className="truncate text-xs text-ink-muted">{t(`integrations.${service.source}.desc`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {settingsSource && drawerIntegration && selectedProjectId && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSettingsSource(null)} />
      )}
      {/* Clip container keeps the off-canvas sheet from extending page scroll */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div
          className={`pointer-events-auto absolute inset-x-2 bottom-2 max-h-[85vh] overflow-y-auto overscroll-y-none rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-300 ease-out lg:left-auto lg:top-2 lg:right-2 lg:bottom-2 lg:max-h-none lg:w-full lg:max-w-md ${
            settingsSource && drawerIntegration
              ? 'translate-y-0 lg:translate-x-0'
              : 'translate-y-full lg:translate-x-full lg:translate-y-0'
          }`}
          aria-hidden={!(settingsSource && drawerIntegration)}
        >
          <div className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-line-strong lg:hidden" />
          {settingsSource && drawerService && drawerIntegration && selectedProjectId && (
            <>
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fill-soft">
                    <BrandIcon source={settingsSource} size={22} className="h-[22px] w-[22px]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink">{drawerService.name}</h2>
                    <p className="truncate text-xs text-ink-muted">{renderMeta(statusParts(settingsSource, drawerIntegration))}</p>
                  </div>
                </div>
                <button onClick={() => setSettingsSource(null)} aria-label={t('auth.close')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition hover:bg-fill hover:text-ink-secondary">
                  <RiCloseLine size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-3 border-t border-line-soft pt-4">
                {settingsSource === 'figma' && (
                  <FigmaWatchPanel
                    projectId={selectedProjectId}
                    integration={drawerIntegration}
                    onChanged={refreshIntegrations}
                  />
                )}
                {settingsSource === 'slack' && (
                  <SlackChannelsPanel
                    projectId={selectedProjectId}
                    integration={drawerIntegration}
                    onChanged={refreshIntegrations}
                  />
                )}
                {settingsSource === 'linear' && (
                  <LinearTeamsPanel
                    projectId={selectedProjectId}
                    integration={drawerIntegration}
                    onChanged={refreshIntegrations}
                  />
                )}
                {settingsSource === 'telegram' && (
                  <TelegramConnectPanel
                    projectId={selectedProjectId}
                    integration={drawerIntegration}
                    onChanged={refreshIntegrations}
                    onNotice={setNotice}
                  />
                )}
                {['slack', 'telegram'].includes(settingsSource) && (
                  <PrivacyPanel
                    projectId={selectedProjectId}
                    integration={drawerIntegration}
                    onChanged={refreshIntegrations}
                    defaultOpen
                  />
                )}
                {settingsSource === 'figma' && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-ink-secondary">{t('integrations.accessData')}</p>
                    <TrustList source="figma" />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line-soft pt-4">
                {settingsSource !== 'telegram' ? (
                  <a
                    href={`/api/integrations/${settingsSource}/connect?project_id=${selectedProjectId}`}
                    onClick={() => track('integration_connect_clicked', { source: settingsSource })}
                    className="text-xs font-medium text-ink-secondary hover:text-ink"
                  >
                    {t('integrations.reconnect')}
                  </a>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => disconnect(settingsSource)}
                  className="text-xs font-medium text-ink-faint transition hover:text-red-600"
                >
                  {t('integrations.disconnect')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
