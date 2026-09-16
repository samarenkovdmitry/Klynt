'use client';

import { Suspense, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Avatar from '@/components/Avatar';
import NewProjectModal from '@/components/NewProjectModal';
import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons';
import {
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiAddLine,
  RiEditLine,
  RiCheckLine,
  RiFileTextLine,
  RiEyeLine,
  RiHistoryLine,
  RiCloseLine,
} from '@remixicon/react';

interface Project {
  id: string;
  name: string;
  description?: string;
  unresolved_count?: number;
}

interface ProjectSummary {
  headline: string;
  bullets: string[];
  needsAttention: string[];
}

interface ProjectState {
  projectId: string;
  period: string;
  project: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
  stats: {
    facts: number;
    events: number;
    openConflicts: number;
    activeIntegrations: number;
  };
  currentState: any[];
  history: any[];
  conflicts: any[];
  recentEvents: any[];
  whatChanged: any[];
}

type Period = '24h' | '7d' | '30d' | 'all';

const PERIODS: { value: Period; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'all', label: 'All' },
];

const SOURCE_COLORS: Record<string, string> = {
  figma: 'bg-blue-50 text-blue-600',
  slack: 'bg-purple-50 text-purple-600',
  gdocs: 'bg-green-50 text-green-600',
};

const FACT_META: Record<string, { bg: string; text: string; subject: string; body: string; muted: string; border: string }> = {
  approved: { bg: 'bg-fill', text: 'text-ink-secondary', subject: 'text-ink/70', body: 'text-ink/60', muted: 'text-ink/45', border: 'border-ink/10' },
  added: { bg: 'bg-blue-100', text: 'text-blue-800', subject: 'text-blue-900/70', body: 'text-blue-900/60', muted: 'text-blue-900/45', border: 'border-blue-900/10' },
  modify: { bg: 'bg-amber-100', text: 'text-amber-800', subject: 'text-amber-900/70', body: 'text-amber-900/60', muted: 'text-amber-900/45', border: 'border-amber-900/10' },
  modified: { bg: 'bg-amber-100', text: 'text-amber-800', subject: 'text-amber-900/70', body: 'text-amber-900/60', muted: 'text-amber-900/45', border: 'border-amber-900/10' },
  removed: { bg: 'bg-red-100', text: 'text-red-800', subject: 'text-red-900/70', body: 'text-red-900/60', muted: 'text-red-900/45', border: 'border-red-900/10' },
};

const DEFAULT_FACT_META = { bg: 'bg-fill', text: 'text-ink-secondary', subject: 'text-ink/70', body: 'text-ink/60', muted: 'text-ink/45', border: 'border-ink/10' };

const STATE_LABELS: Record<string, string> = {
  approved: 'Approved',
  added: 'New',
  modify: 'Needs review',
  modified: 'Needs review',
  removed: 'Decision pending',
};

// Approved намеренно нейтральный: одобренное уже не требует внимания,
// а зелёный занят брендом. Цвет остаётся только у того, что нужно решить.
const STATE_PILL_STYLES: Record<string, string> = {
  approved: 'bg-fill text-ink-secondary',
  added: 'bg-blue-50 text-blue-700',
  modify: 'bg-amber-50 text-amber-700',
  modified: 'bg-amber-50 text-amber-700',
  removed: 'bg-violet-50 text-violet-700',
};

const DEFAULT_PILL_STYLE = 'bg-fill text-ink-secondary';

const ACTION_ICONS: Record<string, ReactNode> = {
  added: <RiAddLine size={14} />,
  approved: <RiCheckLine size={14} />,
  removed: <RiCloseLine size={14} />,
};
const DEFAULT_ACTION_ICON = <RiEditLine size={14} />;

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  state_change: 'No final decision',
  contradiction: 'Decision conflict',
  scope_change: 'Scope change',
  scope_question: 'Scope question',
  missing_confirmation: 'Not confirmed',
};

function SectionHeader({ title, meta, right, caps = true }: { title: string; meta?: ReactNode; right?: ReactNode; caps?: boolean }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className={caps
          ? 'text-xs font-semibold uppercase tracking-wider text-ink-faint'
          : 'text-[13px] font-semibold text-ink-secondary'
        }>{title}</h2>
        {right}
      </div>
      {meta && <div className="mt-2">{meta}</div>}
    </div>
  );
}

export default function ProjectStatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <ProjectStatePageInner />
    </Suspense>
  );
}

function ProjectStatePageInner() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get('projectId');

  const [state, setState] = useState<ProjectState | null>(null);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7d');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [visitBaseline, setVisitBaseline] = useState<Record<string, string>>({});
  const [integrations, setIntegrations] = useState<any[]>([]);

  const fetchData = useCallback(async (selectedPeriod: Period, projectId: string) => {
    setLoading(true);
    try {
      const [stateRes, summaryRes] = await Promise.all([
        fetch(`/api/project/state?period=${selectedPeriod}&projectId=${projectId}`),
        fetch(`/api/project/summary?projectId=${projectId}`),
      ]);
      const [stateData, summaryData] = await Promise.all([stateRes.json(), summaryRes.json()]);

      if (stateData.error) {
        setError(stateData.error);
      } else {
        setState(stateData);
        setSummary(summaryData.error ? null : summaryData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/integrations')
      .then(res => res.json())
      .then(data => setIntegrations(data.integrations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          const initial = queryProjectId && data.projects.find((p: Project) => p.id === queryProjectId)
            ? queryProjectId
            : data.projects[0].id;
          setSelectedProjectId(initial);
          fetchData('7d', initial);
        } else {
          setProjects([]);
          setLoading(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fetchData, queryProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setVisitBaseline(prev => {
      if (prev[selectedProjectId] !== undefined) return prev;
      const key = `klynt:lastVisit:${selectedProjectId}`;
      const last = localStorage.getItem(key) || '';
      localStorage.setItem(key, new Date().toISOString());
      return { ...prev, [selectedProjectId]: last };
    });
  }, [selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchData(period, projectId);
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const resolveConflict = async (conflictId: string, decision: 'keep_current' | 'accept_new' | 'unclear', newState?: string) => {
    setResolving(conflictId);
    try {
      const res = await fetch(`/api/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, newState }),
      });
      if (res.ok) {
        const { conflict } = await res.json();
        setState(prev => prev ? { ...prev, conflicts: prev.conflicts.map(c => c.id === conflictId ? conflict : c) } : null);
        if (selectedProjectId) fetchData(period, selectedProjectId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resolve');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResolving(null);
    }
  };

  const unresolveConflict = async (conflictId: string) => {
    setResolving(conflictId);
    try {
      const res = await fetch(`/api/conflicts/${conflictId}/unresolve`, { method: 'POST' });
      if (res.ok) {
        const { conflict } = await res.json();
        setState(prev => prev ? { ...prev, conflicts: prev.conflicts.map(c => c.id === conflictId ? conflict : c) } : null);
        if (selectedProjectId) fetchData(period, selectedProjectId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to undo');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResolving(null);
    }
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setExpanded(false);
    if (selectedProjectId) {
      fetchData(p, selectedProjectId);
    }
  };

  if (loading && !state) return <div className="p-8 text-center text-ink-muted">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (projects.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-app-bg lg:flex-row">
        <Sidebar projects={[]} selectedProjectId={null} activeItem="project" />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-ink">Create your first project</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Klynt will collect decisions and changes from Figma, Slack and docs, and keep the project state up to date.
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)]"
            >
              New project
            </button>
          </div>
        </main>
        <NewProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    );
  }
  if (!state) return null;

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateFull = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelative = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unresolvedCount = state.conflicts.filter((c: any) => c.status !== 'resolved').length;

  const lastUpdated = state.currentState
    .filter((f: any) => f.last_updated_at)
    .sort((a: any, b: any) => new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime())[0]?.last_updated_at;

  const stateCounts = { approved: 0, review: 0, pending: 0, added: 0 };
  for (const f of state.currentState) {
    const s = f.current_state?.toLowerCase();
    if (s === 'approved') stateCounts.approved++;
    else if (s === 'added') stateCounts.added++;
    else if (s === 'removed') stateCounts.pending++;
    else stateCounts.review++;
  }

  const baseline = selectedProjectId ? visitBaseline[selectedProjectId] : undefined;
  const changesSinceVisit = baseline
    ? state.whatChanged.filter((e: any) => new Date(e.source_timestamp || e.created_at).getTime() > new Date(baseline).getTime()).length
    : 0;

  const getPreviousState = (factId: string) => {
    const factHistory = state.history
      .filter((h: any) => h.fact_id === factId && h.previous_state)
      .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime());
    return factHistory[0]?.previous_state || null;
  };

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  // Group whatChanged by source date
  const groupedEvents = state.whatChanged.reduce((acc: Record<string, any[]>, event: any) => {
    const date = formatDateFull(event.source_timestamp || event.created_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const displayDates = expanded ? sortedDates : sortedDates.slice(0, 2);
  const hiddenCount = state.whatChanged.length - displayDates.reduce((sum, d) => sum + groupedEvents[d].length, 0);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  // Sources = connected integrations + sources that actually produced events.
  // Seed/demo data has events but no integration rows — pills must reflect both.
  const activeSources = [...new Set([
    ...integrations
      .filter((i: any) => i.project_id === selectedProjectId && i.status === 'active')
      .map((i: any) => i.source),
    ...(state.recentEvents || []).map((e: any) => e.source).filter(Boolean),
    ...(state.whatChanged || []).map((e: any) => e.source).filter(Boolean),
    ...(state.history || []).map((h: any) => h.source).filter(Boolean),
  ])] as string[];

  const selectedFact = selectedFactId ? state.currentState.find((f: any) => f.id === selectedFactId) : null;
  const selectedHistory = selectedFact
    ? state.history
        .filter((h: any) => h.fact_id === selectedFact.id && h.new_state && h.previous_state?.toLowerCase() !== h.new_state?.toLowerCase() && h.reason !== 'test')
        .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime())
    : [];
  const selectedMeta = selectedFact ? (FACT_META[selectedFact.current_state?.toLowerCase()] || DEFAULT_FACT_META) : null;
  const selectedStateLabel = selectedFact
    ? (selectedFact.current_value?.display_state || STATE_LABELS[selectedFact.current_state?.toLowerCase()] || capitalize(selectedFact.current_state))
    : null;
  let decisionCounter = 0;

  const groupedWhy = selectedFact
    ? [...selectedHistory].reverse().reduce((acc: any[], h: any) => {
        const last = acc[acc.length - 1];
        if (last && last.reason === h.reason && last.source === h.source && last.author === h.author) {
          last.occurrences.push(h);
          return acc;
        }
        acc.push({ ...h, occurrences: [h] });
        return acc;
      }, [])
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-app-bg lg:flex-row">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        activeItem="project"
        onProjectChange={handleProjectChange}
        loading={loading}
      />

      <main className="relative w-full flex-1 px-3 py-4 sm:px-8 sm:py-6">
        {loading && (
          <div className="absolute left-0 right-0 top-0 z-50">
            <div className="h-1 w-full overflow-hidden bg-fill">
              <div
                className="h-full bg-[#061C2F]"
                style={{
                  width: '40%',
                  animation: 'klynt-progress 1.2s ease-in-out infinite',
                }}
              />
            </div>
            <style jsx>{`
              @keyframes klynt-progress {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(250%); }
                100% { transform: translateX(250%); }
              }
            `}</style>
          </div>
        )}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-[26px] font-bold tracking-tight text-ink">{selectedProject?.name || 'Project'}</h1>
            {activeSources.length > 0 && (
              <div className="flex items-center gap-1.5">
                {activeSources.map((s: string) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary"
                  >
                    {s === 'figma' ? <FigmaIcon size={11} /> : s === 'slack' ? <SlackIcon size={11} /> : <RiFileTextLine size={11} className="text-green-600" />}
                    {s === 'gdocs' ? 'Google Docs' : capitalize(s)}
                  </span>
                ))}
              </div>
            )}
          </div>
          {selectedProject?.description && (
            <p className="mt-1 text-[15px] text-ink-secondary">{selectedProject.description}</p>
          )}
          {state.currentState.length > 0 && (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-[13px] text-ink-muted">
                {state.currentState.length} areas
                {stateCounts.approved > 0 && ` · ${stateCounts.approved} approved`}
                {stateCounts.review > 0 && ` · ${stateCounts.review} need review`}
                {stateCounts.added > 0 && ` · ${stateCounts.added} new`}
                {stateCounts.pending > 0 && ` · ${stateCounts.pending} pending`}
                {changesSinceVisit > 0 && (
                  <span className="font-medium text-[var(--accent-link)]">
                    {' '}· {changesSinceVisit} since your last visit
                  </span>
                )}
              </p>
              {lastUpdated && (
                <p
                  className="text-xs text-ink-faint"
                  title={new Date(lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                >
                  Updated {formatRelative(lastUpdated)}
                </p>
              )}
            </div>
          )}
        </div>



        <div className="grid gap-10 lg:grid-cols-12">
          {/* Latest */}
          <section className="order-3 lg:col-span-8">
              <SectionHeader
                title="Latest"
                meta={summary?.headline && (
                  <p className="text-xs text-ink-muted">{summary.headline}</p>
                )}
              />
              {state.whatChanged.length > 0 ? (
                <div className="divide-y divide-line-soft">
                  {state.whatChanged.slice(0, 5).map((event: any) => {
                    const eventTime = event.source_timestamp || event.created_at;
                    const source = event.source || 'figma';
                    return (
                      <div key={event.id} className="flex items-center gap-3 py-3">
                        <span className="flex-shrink-0 text-ink-faint">
                          {ACTION_ICONS[event.action] || DEFAULT_ACTION_ICON}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{capitalize(event.reason)}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {capitalize(event.subject)} · {event.action}
                          </p>
                        </div>
                        <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                          {event.author && (
                            <span className="flex items-center gap-1">
                              <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                <Avatar name={event.author} email={event.author} className="text-[8px]" />
                              </span>
                              {event.author}
                            </span>
                          )}
                          {source === 'figma' ? <FigmaIcon size={14} /> : source === 'slack' ? <SlackIcon size={14} /> : <RiFileTextLine size={12} className="text-green-600" />}
                          {formatRelative(eventTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : state.currentState.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong p-6 text-center">
                  <p className="text-sm font-medium text-ink">No changes yet</p>
                  <p className="mt-1 text-sm text-ink-muted">Connect an integration to start tracking your project.</p>
                  <a
                    href="/integrations"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
                  >
                    Go to Integrations <RiArrowRightSLine size={16} />
                  </a>
                </div>
              ) : (
                <div className="border-t border-line py-4">
                  <p className="text-sm text-ink-muted">No changes in the last {period}.</p>
                </div>
              )}
            </section>

            {/* Current state — aggregate meta lives in the project header */}
            <section className="order-1 lg:col-span-8">
              {state.currentState.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center">
                  <RiEyeLine size={40} className="text-line" />
                  <p className="mt-4 text-base text-ink">Connect an integration to see what is currently true.</p>
                  <a
                    href="/integrations"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
                  >
                    Go to Integrations <RiArrowRightSLine size={16} />
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                  {state.currentState.slice().sort((a: any, b: any) => {
                    const priority: Record<string, number> = { removed: 0, modify: 1, modified: 1, added: 2, approved: 3 };
                    const pa = priority[a.current_state?.toLowerCase()] ?? 4;
                    const pb = priority[b.current_state?.toLowerCase()] ?? 4;
                    if (pa !== pb) return pa - pb;
                    return (a.subject || '').toLowerCase().localeCompare((b.subject || '').toLowerCase());
                  }).map((fact: any) => {
                    const pillStyle = STATE_PILL_STYLES[fact.current_state?.toLowerCase()] || DEFAULT_PILL_STYLE;
                    const stateLabel = fact.current_value?.display_state || STATE_LABELS[fact.current_state?.toLowerCase()] || capitalize(fact.current_state);
                    const isApproved = fact.current_state?.toLowerCase() === 'approved';
                    const confidence = Math.round(fact.confidence * 100);
                    const confidenceText = confidence < 80 ? `Confidence ${confidence}%` : null;
                    const factHistory = state.history
                      .filter((h: any) => h.fact_id === fact.id && h.new_state && h.previous_state?.toLowerCase() !== h.new_state?.toLowerCase() && h.reason !== 'test')
                      .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime());
                    const hasHistory = factHistory.length > 0;
                    const relatedConflict = state.conflicts.find((c: any) => c.status !== 'resolved' && c.subject === fact.subject);
                    const latestReason = state.history
                      .filter((h: any) => h.fact_id === fact.id && h.reason && h.reason !== 'test')
                      .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime())[0]?.reason;
                    const contextLine = relatedConflict?.description || latestReason || null;
                    const approvalEntry = isApproved
                      ? state.history
                          .filter((h: any) => h.fact_id === fact.id && h.new_state?.toLowerCase() === 'approved')
                          .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime())[0]
                      : null;
                    const lastEntry = factHistory[0] || null;
                    const lastActor = approvalEntry?.author || lastEntry?.author || null;
                    const lastSource = approvalEntry?.source || lastEntry?.source || null;
                    // approved cards already carry "Approved by X · ago" — don't repeat the time in the footer
                    const showUpdated = Boolean(fact.last_updated_at) && !(isApproved && approvalEntry);
                    return (
                      <div
                        key={fact.id}
                        onClick={hasHistory ? () => setSelectedFactId(fact.id) : undefined}
                        className={`group relative flex flex-col rounded-xl border border-line bg-white px-4 py-3 transition-colors ${hasHistory ? 'cursor-pointer hover:border-line-strong' : ''}`}
                      >
                        <p className="text-[15px] font-semibold leading-snug text-ink">{capitalize(fact.subject)}</p>
                        <span className={`relative mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle}`}>
                          {isApproved && <RiCheckLine size={11} />}
                          {stateLabel}
                          {confidenceText && (
                            <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-max rounded bg-gray-800 px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                              {confidenceText}
                            </span>
                          )}
                        </span>
                        {isApproved && approvalEntry?.author ? (
                          <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted">
                            Approved by {approvalEntry.author}
                            {approvalEntry.decided_at && ` · ${formatRelative(approvalEntry.decided_at)}`}
                          </p>
                        ) : contextLine ? (
                          <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted line-clamp-2">{capitalize(contextLine)}</p>
                        ) : null}
                        {(hasHistory || fact.last_updated_at) && (
                          <div className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-ink-faint">
                            {hasHistory && (
                              <span className="font-medium transition-colors group-hover:text-[var(--accent-link)]">
                                {factHistory.length} {factHistory.length === 1 ? 'change' : 'changes'}
                              </span>
                            )}
                            {hasHistory && showUpdated && <span>·</span>}
                            {showUpdated && <span>{formatRelative(fact.last_updated_at!)}</span>}
                            {(lastActor || lastSource) && (
                              <span className="ml-auto flex items-center gap-1.5">
                                {lastActor && (
                                  <>
                                    <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                      <Avatar name={lastActor} email={lastActor} className="text-[8px]" />
                                    </span>
                                    <span>{lastActor}</span>
                                  </>
                                )}
                                {lastSource === 'figma' ? <FigmaIcon size={12} /> : lastSource === 'slack' ? <SlackIcon size={12} /> : lastSource ? <RiFileTextLine size={11} className="text-green-600" /> : null}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Activity */}
            <section className="order-4 lg:col-span-8">
              <SectionHeader
                title="Activity"
                right={
                  <div className="flex flex-shrink-0 gap-1 rounded-lg bg-fill/60 p-1">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => handlePeriodChange(p.value)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          period === p.value
                            ? 'bg-white text-ink'
                            : 'text-ink-muted hover:text-ink-secondary'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                }
              />

              {state.whatChanged.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center">
                  <RiHistoryLine size={40} className="text-line" />
                  {state.currentState.length === 0 ? (
                    <p className="mt-4 text-base text-ink">Connect an integration to see what changed.</p>
                  ) : (
                    <>
                      <p className="mt-4 text-base text-ink">No changes in the last {period}</p>
                      <div className="mt-3 flex justify-center gap-3">
                        {period !== '7d' && (
                          <button onClick={() => handlePeriodChange('7d')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">7 days</button>
                        )}
                        {period !== '30d' && (
                          <button onClick={() => handlePeriodChange('30d')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">30 days</button>
                        )}
                        {period !== 'all' && (
                          <button onClick={() => handlePeriodChange('all')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">All time</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {displayDates.map((date) => (
                    <div key={date} className="mb-6">
                      <p className="mb-1 text-xs font-medium text-ink-faint">{date}</p>
                      <div className="divide-y divide-line-soft">
                        {groupedEvents[date].map((event: any) => {
                          const eventTime = event.source_timestamp || event.created_at;
                          const source = event.source || 'figma';
                          return (
                            <div key={event.id}>
                            <button
                              onClick={() => toggleEventDetails(event.id)}
                              className="-mx-2 w-[calc(100%+1rem)] rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-fill"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-10 flex-shrink-0 text-xs tabular-nums text-ink-faint">
                                  {formatTime(eventTime)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-medium text-ink">{capitalize(event.reason)}</span>
                                  <span className="ml-2 text-xs text-ink-faint">
                                    {capitalize(event.subject)} · {event.action}
                                  </span>
                                </div>
                                <span className="flex flex-shrink-0 items-center gap-2.5 text-xs text-ink-faint">
                                  {event.author && (
                                    <span className="flex items-center gap-1">
                                      <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                        <Avatar name={event.author} email={event.author} className="text-[8px]" />
                                      </span>
                                      {event.author}
                                    </span>
                                  )}
                                  {source === 'figma' ? <FigmaIcon size={14} /> : source === 'slack' ? <SlackIcon size={14} /> : <RiFileTextLine size={12} className="text-green-600" />}
                                </span>
                              </div>
                              {expandedEvents.has(event.id) && (event.content || event.source_url) && (
                                <div className="mt-2 rounded-lg bg-fill px-3 py-2 text-sm text-ink-secondary">
                                  {event.content && (
                                    <>
                                      <p className="text-xs font-medium text-ink-faint">Original message</p>
                                      <p className="mt-1">{event.content}</p>
                                    </>
                                  )}
                                  {event.source_url && (
                                    <a
                                      href={event.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-[var(--accent-link)] hover:underline"
                                    >
                                      View source
                                      <RiArrowRightUpLine size={13} />
                                    </a>
                                  )}
                                </div>
                              )}
                            </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {hiddenCount > 0 && !expanded && (
                    <button
                      onClick={() => setExpanded(true)}
                      className="flex items-center gap-1 text-sm font-medium text-[var(--accent-link)] hover:underline"
                    >
                      Show {hiddenCount} more
                      <RiArrowDownSLine size={16} />
                    </button>
                  )}

                  {expanded && sortedDates.length > 2 && (
                    <button
                      onClick={() => setExpanded(false)}
                      className="flex items-center gap-1 text-sm font-medium text-[var(--accent-link)] hover:underline"
                    >
                      Show less
                      <RiArrowUpSLine size={16} />
                    </button>
                  )}
                </div>
              )}
            </section>
          {/* Right column — on mobile sits between Current state and Latest */}
          <div className="order-2 lg:col-span-4 lg:row-span-3">
            <section>
              <SectionHeader
                title={unresolvedCount > 0
                  ? `${unresolvedCount} ${unresolvedCount === 1 ? 'decision needs' : 'decisions need'} you`
                  : 'Needs attention'}
                caps={false}
              />
              {state.conflicts.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-sm text-ink-muted">No issues to review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.conflicts.slice().sort((a: any, b: any) => {
                    return Number(a.status === 'resolved') - Number(b.status === 'resolved');
                  }).map((conflict: any) => {
                    const isResolved = conflict.status === 'resolved';
                    const decisionIndex = isResolved ? null : ++decisionCounter;
                    const relatedFact = state.currentState.find((f: any) => f.subject === conflict.subject);
                    return (
                      <div
                        key={conflict.id}
                        onClick={relatedFact ? () => setSelectedFactId(relatedFact.id) : undefined}
                        className={`rounded-xl border border-line bg-white p-3.5 transition-colors ${relatedFact ? 'cursor-pointer hover:border-line-strong' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {decisionIndex !== null && (
                            <span className="text-[11px] font-semibold tabular-nums text-line-strong">
                              {String(decisionIndex).padStart(2, '0')}
                            </span>
                          )}
                          <p className={`text-sm font-semibold ${isResolved ? 'text-ink-muted' : 'text-ink'}`}>
                            {capitalize(conflict.subject)}
                          </p>
                          <span className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${isResolved ? 'bg-fill text-ink-muted' : 'bg-amber-50 text-amber-700'}`}>
                            {isResolved ? 'Resolved' : (CONFLICT_TYPE_LABELS[conflict.conflict_type] || 'Needs decision')}
                          </span>
                        </div>
                        <p className={`mt-1.5 text-[13px] leading-[1.55] ${isResolved ? 'text-ink-faint' : 'text-ink-secondary'}`}>
                          {conflict.description}
                        </p>
                        {conflict.resolution && isResolved && (
                          <p className="mt-1 text-xs text-ink-faint">{conflict.resolution}</p>
                        )}
                        <div className="mt-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {isResolved ? (
                            <button
                              onClick={() => unresolveConflict(conflict.id)}
                              disabled={resolving === conflict.id}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-fill disabled:opacity-50"
                            >
                              {resolving === conflict.id ? 'Updating...' : 'Undo'}
                            </button>
                          ) : (
                            <>
                              {conflict.proposedEvent?.action && conflict.proposedEvent.action !== conflict.currentState && (
                                <button
                                  onClick={() => resolveConflict(conflict.id, 'accept_new', conflict.proposedEvent.action)}
                                  disabled={resolving === conflict.id}
                                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
                                >
                                  Accept
                                </button>
                              )}
                              <button
                                onClick={() => resolveConflict(conflict.id, 'keep_current')}
                                disabled={resolving === conflict.id}
                                className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-line-strong hover:bg-fill-soft disabled:opacity-50"
                              >
                                Keep as is
                              </button>
                              <button
                                onClick={() => resolveConflict(conflict.id, 'unclear')}
                                disabled={resolving === conflict.id}
                                className="px-2 py-1.5 text-xs font-medium text-ink-faint transition-colors hover:text-ink-secondary disabled:opacity-50"
                              >
                                Not sure
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {selectedFact && <div className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-300" onClick={() => setSelectedFactId(null)} />}
        {/* Clip container keeps the off-canvas sheet from extending page scroll */}
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div
          className={`pointer-events-auto absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl transition-transform duration-300 ease-out lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-full lg:max-w-md lg:rounded-none ${
            selectedFact ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'
          }`}
          aria-hidden={!selectedFact}
        >
          <div className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-line-strong lg:hidden" />
          {selectedFact && selectedMeta && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{capitalize(selectedFact.subject)}</h2>
                <button onClick={() => setSelectedFactId(null)} className="text-ink-muted hover:text-ink-secondary">
                  <RiCloseLine size={24} />
                </button>
              </div>
              <div className="space-y-5 border-t border-line-soft pt-4">
                {selectedFact.current_state?.toLowerCase() === 'removed' && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    No final decision found.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-muted">Current</span>
                    <span className={`text-sm font-semibold ${selectedMeta.text}`}>{selectedStateLabel}</span>
                  </div>
                  {selectedHistory[0]?.previous_state && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-muted">Previous state</span>
                      <span className="text-sm text-ink-secondary">{capitalize(selectedHistory[0].previous_state)}</span>
                    </div>
                  )}
                  {selectedHistory.length > 0 && (
                    <p className="text-xs text-ink-faint">
                      {selectedHistory.length} {selectedHistory.length === 1 ? 'change' : 'changes'}
                      {new Set(selectedHistory.map((h: any) => h.author).filter(Boolean)).size > 1 &&
                        ` · ${new Set(selectedHistory.map((h: any) => h.author).filter(Boolean)).size} people involved`}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-ink">Why this is the current state</p>
                  <div className="relative ml-1 space-y-4 border-l border-line pl-4">
                    {groupedWhy.map((group: any) => (
                      <div key={group.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-line-strong" />
                        <p className="text-xs text-ink-faint">
                          {formatDateTime(group.occurrences[0].decided_at || group.occurrences[0].created_at)}
                          {group.occurrences.length > 1 && ` · +${group.occurrences.length - 1} more`}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-secondary">
                          {group.reason ? capitalize(group.reason) : 'No reason given'}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
                          {group.source && (
                            <span className="flex items-center gap-1">
                              {group.source === 'figma' ? <FigmaIcon size={14} /> : group.source === 'slack' ? <SlackIcon size={14} /> : <RiFileTextLine size={12} className="text-green-500" />}
                              {group.source === 'gdocs' ? 'Google Docs' : capitalize(group.source)}
                            </span>
                          )}
                          {group.author && (
                            <span className="flex items-center gap-1.5">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full overflow-hidden">
                                <Avatar name={group.author} email={group.author} className="text-[8px]" />
                              </span>
                              {group.author}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(() => {
                  const urls = [...new Set(selectedHistory.map((h: any) => h.source_url).filter(Boolean))];
                  const sources = [...new Set(selectedHistory.map((h: any) => h.source).filter(Boolean))];
                  if (urls.length > 0) {
                    return (
                      <div className="space-y-2">
                        {urls.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-sm font-medium text-[var(--accent-link)] hover:underline"
                          >
                            View source
                            <RiArrowRightUpLine size={14} />
                          </a>
                        ))}
                      </div>
                    );
                  }
                  if (sources.length > 0) {
                    return <p className="text-sm text-ink-muted">Source: {sources.map(capitalize).join(', ')}</p>;
                  }
                  return null;
                })()}
              </div>
            </>
          )}
        </div>
        </div>

      </main>
    </div>
  );
}
