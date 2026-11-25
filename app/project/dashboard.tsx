'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import TopNavigation from '@/components/TopNavigation';
import NewProjectModal from '@/components/NewProjectModal';
import LandingPreview from '@/components/LandingPreview';
import DecisionsToRevisit from '@/components/DecisionsToRevisit';
import { signalRouteStart } from '@/components/RouteProgress';
import ClarificationHint from '@/components/ClarificationHint';
import { FigmaIcon, SlackIcon, LinearIcon, TelegramIcon } from '@/components/icons/BrandIcons';
import { emojify } from 'node-emoji';
import { t, tp } from '@/lib/i18n';
import { conflictActions } from '@/lib/conflict-actions';
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiAddLine,
  RiEditLine,
  RiCheckLine,
  RiFileTextLine,
  RiLinksLine,
  RiHistoryLine,
  RiCloseLine,
  RiTimeLine,
} from '@remixicon/react';

interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  unresolved_count?: number;
  is_demo?: boolean;
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
    deadLettered?: number;
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

// t() echoes the key back on a miss, so check before using as a label

// On a conflicted card the arrow line reads "Approved → Removal requested":
// the confirmed state vs what the new event proposes.
const PROPOSED_LABELS: Record<string, string> = {
  remove: 'Removal requested',
  add: 'Addition proposed',
  modify: 'Change proposed',
  approve: 'Approval proposed',
  reject: 'Rejection proposed',
  in_progress: 'Work proposed',
  undecided: 'Undecided proposal',
};

// Unified status system:
//   STATUS  — the state of the decision (approved / in progress / needs
//             decision / disputed / out of scope)
//   EVENT   — what happened (added / removed / scope changed / changed),
//             shown next to the status, never instead of it.
const SETTLED_STATES = new Set(['approved', 'approve', 'confirmed', 'in_progress', 'out_of_scope', 'reject', 'rejected', 'undecided']);

function settledStatus(s?: string): 'approved' | 'inProgress' | 'outOfScope' | 'needsDecision' {
  if (s === 'approved' || s === 'approve' || s === 'confirmed') return 'approved';
  if (s === 'in_progress') return 'inProgress';
  if (s === 'out_of_scope' || s === 'reject' || s === 'rejected') return 'outOfScope';
  return 'needsDecision'; // undecided and anything else unsettled
}

// An unresolved conflict overrides the status — the decision is disputed.
function displayStatus(fact: { current_state?: string }, hasConflict: boolean, prevSettled?: string | null) {
  if (hasConflict) return 'disputed' as const;
  const s = fact.current_state?.toLowerCase();
  if (SETTLED_STATES.has(s || '')) return settledStatus(s);
  if (prevSettled === 'approved' || prevSettled === 'inProgress' || prevSettled === 'outOfScope') return prevSettled;
  return 'needsDecision' as const;
}

function displayEvent(fact: { current_state?: string }): 'added' | 'removed' | 'scopeChanged' | 'changed' | null {
  const s = fact.current_state?.toLowerCase();
  if (s === 'added' || s === 'add') return 'added';
  if (s === 'removed' || s === 'remove') return 'removed';
  if (s === 'scope_change') return 'scopeChanged';
  if (s === 'modify' || s === 'modified' || s === 'change') return 'changed';
  return null;
}

type StatusKey = 'approved' | 'inProgress' | 'needsDecision' | 'disputed' | 'outOfScope';

const STATUS_COLORS: Record<StatusKey, { bar: string; pill: string }> = {
  approved:      { bar: 'bg-emerald-400', pill: 'bg-emerald-100 text-emerald-800' },
  inProgress:    { bar: 'bg-blue-400',    pill: 'bg-blue-100 text-blue-800' },
  needsDecision: { bar: 'bg-amber-400',   pill: 'bg-amber-100 text-amber-800' },
  disputed:      { bar: 'bg-rose-400',    pill: 'bg-rose-100 text-rose-800' },
  outOfScope:    { bar: 'bg-line-strong', pill: 'bg-fill text-ink-secondary' },
};

const statusWithScope = (statusKey: string, scope?: string | null, dot = 'mx-1.5'): ReactNode => (
  <>
    {t(`status.${statusKey}`)}
    {scope && (
      <>
        <span className={dot} aria-hidden="true">·</span>
        {scope}
      </>
    )}
  </>
);

const ACTION_ICONS: Record<string, ReactNode> = {
  added: <RiAddLine size={14} />,
  approved: <RiCheckLine size={14} />,
  removed: <RiCloseLine size={14} />,
};
const DEFAULT_ACTION_ICON = <RiEditLine size={14} />;

// Raw external IDs aren't meaningful to show: Figma user "1624093726897831277",
// Slack user/channel "U0C337Z8NGH" (letter + uppercase alnum).
const isRawExternalId = (s: string) => /^[0-9_-]{10,}$/.test(s) || /^[A-Z][A-Z0-9_-]{9,}$/.test(s);

// True when the original message adds nothing over the interpreted title —
// identical text, or the title is fully contained in it (or vice versa).
const isDuplicateText = (a?: string, b?: string) => {
  if (!a || !b) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яё]+/giu, ' ').replace(/\s+/g, ' ').trim();
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
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

function SkeletonBar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}

function SkeletonCard({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-xl border border-line ${className}`} />;
}

export function ProjectSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="order-1 lg:col-span-8 lg:col-start-1">
          <SkeletonBar className="h-8 w-56 max-w-[70%]" />
          <SkeletonBar className="mt-3 h-4 w-80 max-w-[90%]" />
        </div>
        {/* Latest */}
        <section className="order-4 lg:col-span-8 lg:col-start-1">
          <SkeletonBar className="mb-4 h-4 w-24" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBar className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <SkeletonBar className="h-4 w-3/4" />
                  <SkeletonBar className="mt-1.5 h-3 w-1/3" />
                </div>
                <SkeletonBar className="h-3 w-16 flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Current state */}
        <section className="order-2 lg:order-3 lg:col-span-8 lg:col-start-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SkeletonCard className="h-[104px]" />
            <SkeletonCard className="hidden h-[104px] sm:block" />
            <SkeletonCard className="hidden h-[104px] sm:block" />
          </div>
        </section>

        {/* Activity */}
        <section className="order-5 lg:col-span-8 lg:col-start-1">
          <div className="mb-4 flex items-center justify-between">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-7 w-44 rounded-lg" />
          </div>
          <SkeletonBar className="mb-3 h-3 w-24" />
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBar className="h-3 w-10 flex-shrink-0" />
                <SkeletonBar className="h-4 w-2/3 min-w-0 flex-1" />
                <SkeletonBar className="h-3 w-16 flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Right column */}
        <div className="order-3 lg:order-2 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-4">
          <SkeletonBar className="mb-4 h-4 w-36" />
          <SkeletonCard className="h-24 rounded-2xl" />
        </div>
      </div>
    </>
  );
}

export function ProjectDashboard({ slug }: { slug?: string }) {
  const router = useRouter();

  const [state, setState] = useState<ProjectState | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7d');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [visitBaseline, setVisitBaseline] = useState<Record<string, string>>({});
  const fetchData = useCallback(async (selectedPeriod: Period, projectId: string, optimistic = false) => {
    setLoading(true);
    try {
      const stateRes = await fetch(`/api/project/state?period=${selectedPeriod}&projectId=${projectId}`);
      const stateData = await stateRes.json();

      if (stateData.error) {
        if (!optimistic) setError(stateData.error);
        return false;
      }
      setState(stateData);
      return true;
    } catch (err: any) {
      if (!optimistic) setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryProjectId = new URLSearchParams(window.location.search).get('projectId');
    const slugParam = slug;
    let lastId = '';
    try { lastId = localStorage.getItem('klynt:lastProject') || ''; } catch {}
    const optimistic = !slugParam && !queryProjectId && lastId;
    const optimisticFetch = optimistic ? fetchData('7d', lastId, true) : null;
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          const bySlug = slugParam ? data.projects.find((p: Project) => p.slug === slugParam || p.id === slugParam) : null;
          const byQuery = queryProjectId ? data.projects.find((p: Project) => p.id === queryProjectId) : null;
          const initial = bySlug || byQuery || data.projects[0];
          setSelectedProjectId(initial.id);
          try { localStorage.setItem('klynt:lastProject', initial.id); } catch {}
          if (!slugParam) {
            const url = initial.slug ? `/project/${initial.slug}` : `/project?projectId=${initial.id}`;
            window.history.replaceState(null, '', url);
          }
          if (initial.id !== lastId || !optimisticFetch) {
            fetchData('7d', initial.id);
          } else {
            optimisticFetch.then(ok => { if (!ok) fetchData('7d', initial.id); });
          }
        } else {
          setProjects([]);
          setLoading(false);
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fetchData, slug]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setVisitBaseline(prev => {
      if (prev[selectedProjectId] !== undefined) return prev;
      let last = '';
      try {
        const key = `klynt:lastVisit:${selectedProjectId}`;
        last = localStorage.getItem(key) || '';
        localStorage.setItem(key, new Date().toISOString());
      } catch {}
      return { ...prev, [selectedProjectId]: last };
    });
  }, [selectedProjectId]);

  // Lock page scroll while the fact drawer is open — otherwise wheel events
  // over the sheet scroll the page behind it and the fixed drawer "detaches".
  useEffect(() => {
    if (!selectedFactId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [selectedFactId]);

  const handleCreateDemo = async () => {
    setCreatingDemo(true);
    try {
      const res = await fetch('/api/projects/demo', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.project) {
        signalRouteStart();
        router.push(`/project/${data.project.slug || data.project.id}`);
        return;
      }
      setError(data.error || t('dashboard.sampleFailed'));
      setCreatingDemo(false);
    } catch {
      setError(t('dashboard.sampleFailed'));
      setCreatingDemo(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    try { localStorage.setItem('klynt:lastProject', projectId); } catch {}
    setStateFilter(null);
    const target = projects.find(p => p.id === projectId);
    window.history.replaceState(null, '', target?.slug ? `/project/${target.slug}` : `/project?projectId=${projectId}`);
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

  const resolveConflict = async (conflictId: string, decision: 'keep_current' | 'accept_new' | 'clarify' | 'reopen', newState?: string) => {
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
        setError(data.error || t('dashboard.resolveFailed'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResolving(null);
    }
  };

  const confirmCandidate = async (eventId: string) => {
    setResolving(eventId);
    try {
      const res = await fetch(`/api/candidates/${eventId}/confirm`, { method: 'POST' });
      if (res.ok) {
        if (selectedProjectId) fetchData(period, selectedProjectId);
      } else {
        const data = await res.json();
        setError(data.error || t('dashboard.resolveFailed'));
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
        setError(data.error || t('dashboard.undoFailed'));
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

  if (loading && !state) {
    return (
      <div className="flex min-h-screen flex-col bg-app-bg">
        <TopNavigation projects={projects} selectedProjectId={selectedProjectId} activeItem="project" loading />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-4 sm:px-8 sm:py-6">
          <ProjectSkeleton />
        </main>
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (projects.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-app-bg">
        <TopNavigation projects={[]} selectedProjectId={null} activeItem="project" />
        <main className="flex flex-1 flex-col items-center overflow-hidden px-4 pb-0 pt-16 sm:pt-20">
          <div className="w-full max-w-lg text-center">
            <h1 className="text-2xl font-semibold text-ink">{t('dashboard.createFirst')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t('dashboard.emptyProjectText')}
            </p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)]"
              >
                {t('sidebar.newProject')}
              </button>
              <button
                onClick={handleCreateDemo}
                disabled={creatingDemo}
                className="rounded-lg border border-line bg-white px-6 py-3 text-sm font-medium text-ink-secondary transition-colors enabled:hover:border-transparent enabled:hover:bg-fill disabled:opacity-50"
              >
                {creatingDemo ? t('dashboard.preparingSample') : t('dashboard.seeExample')}
              </button>
            </div>
          </div>

          {/* What they're about to get — the same mock as the landing hero */}
          <div aria-hidden className="relative mt-12 w-full max-w-5xl flex-1 overflow-hidden">
            <div className="pointer-events-none mx-auto w-[1100px] max-w-none origin-top scale-[0.55] sm:scale-[0.75]">
              <LandingPreview />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-app-bg" />
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
    if (m < 1) return t('dashboard.justNow');
    if (m < 60) return `${m} ${tp(m, 'plural.minAgo')}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ${tp(h, 'plural.hAgo')}`;
    const d = Math.floor(h / 24);
    return `${d} ${tp(d, 'plural.dAgo')}`;
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

  // Match conflicts to facts by the explicit fact link first; subjects are
  // LLM-generated and drift in casing/spelling between events.
  const normSubject = (s: string) => (s || '').toLowerCase().trim();
  const openConflicts = state.conflicts.filter((c: any) => c.status !== 'resolved');
  const conflictForFact = (f: any) => openConflicts.find((c: any) =>
    c.previous_fact_id === f.id || normSubject(c.subject) === normSubject(f.subject));
  const factStatus = new Map<string, StatusKey>();
  const prevSettledFor = (fact: any) => {
    const h = state.history
      .filter((x: any) => x.fact_id === fact.id && x.previous_state && SETTLED_STATES.has(x.previous_state?.toLowerCase()))
      .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime())[0];
    return h ? settledStatus(h.previous_state?.toLowerCase()) : null;
  };
  for (const f of state.currentState) {
    factStatus.set(f.id, displayStatus(f, !!conflictForFact(f), prevSettledFor(f)));
  }
  const stateCounts: Record<StatusKey, number> = { approved: 0, inProgress: 0, needsDecision: 0, disputed: 0, outOfScope: 0 };
  for (const f of state.currentState) stateCounts[factStatus.get(f.id)!]++;

  const baseline = selectedProjectId ? visitBaseline[selectedProjectId] : undefined;
  const newSinceVisit = baseline
    ? state.whatChanged.filter((e: any) => new Date(e.source_timestamp || e.created_at).getTime() > new Date(baseline).getTime())
    : state.whatChanged;
  const changesSinceVisit = baseline ? newSinceVisit.length : 0;
  const latestEvents = newSinceVisit.slice(0, 5);

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

  const selectedFact = selectedFactId ? state.currentState.find((f: any) => f.id === selectedFactId) : null;
  const selectedHistory = selectedFact
    ? state.history
        .filter((h: any) => h.fact_id === selectedFact.id && h.new_state && h.previous_state?.toLowerCase() !== h.new_state?.toLowerCase() && h.reason !== 'test')
        .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime())
    : [];
  const selectedMeta = selectedFact ? (FACT_META[selectedFact.current_state?.toLowerCase()] || DEFAULT_FACT_META) : null;
  const selectedStatus = selectedFact ? (factStatus.get(selectedFact.id) || 'needsDecision') : 'needsDecision';
  const selectedStateLabel = selectedFact
    ? statusWithScope(selectedStatus, selectedFact.current_value?.scope)
    : null;

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
    <div className="flex min-h-screen flex-col bg-app-bg">
      <TopNavigation
        projects={projects}
        selectedProjectId={selectedProjectId}
        activeItem="project"
        onProjectChange={handleProjectChange}
        loading={loading}
      />

      {loading && (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60]">
          <div className="h-0.5 w-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent)_0%,#2FA37A_55%,#4FB3A0_100%)]"
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

      <main className="relative mx-auto w-full max-w-[1400px] flex-1 px-3 py-4 sm:px-8 sm:py-6">
        <div className={`grid grid-cols-1 gap-x-10 gap-y-8 transition-opacity lg:grid-cols-12 ${loading ? 'opacity-50' : ''}`}>
          <header className="order-1 lg:col-span-8 lg:col-start-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-tight text-ink">
                {selectedProject?.name || 'Project'}
                {(selectedProject?.is_demo || selectedProject?.name?.startsWith('Sample ·')) && (
                  <sup className="relative -top-2.5 ml-2.5 text-[11px] font-medium tracking-normal text-ink-faint">Sample</sup>
                )}
              </h1>
            </div>
          </div>
          {(selectedProject?.description || lastUpdated) && (
            <div className="mt-1 flex items-baseline justify-between gap-4">
              {selectedProject?.description && (
                <p className="min-w-0 text-[15px] text-ink-secondary">{selectedProject.description}</p>
              )}
              {lastUpdated && (
                <span
                  className="ml-auto flex-shrink-0 text-xs text-ink-faint"
                  title={new Date(lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                >
                  {t('dashboard.updated')} {formatRelative(lastUpdated)}
                  {changesSinceVisit > 0 && (
                    <span className="ml-1.5 text-[var(--accent-link)]">· {changesSinceVisit} {t('dashboard.sinceLastVisit')}</span>
                  )}
                </span>
              )}
            </div>
          )}
          {state.currentState.length > 0 && (() => {
            const stats = [
              ['approved', t('status.approved')],
              ['inProgress', t('status.inProgress')],
              ['needsDecision', t('status.needsDecision')],
              ['disputed', t('status.disputed')],
              ['outOfScope', t('status.outOfScope')],
            ] as const;
            const filterPill = (active: boolean) =>
              `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${active ? 'bg-fill font-medium text-ink' : 'text-ink-secondary hover:bg-fill-soft'}`;
            return (
            <div className="mt-4 flex flex-wrap items-center gap-0.5" role="group" aria-label={t('dashboard.filterByState')}>
                <button
                  type="button"
                  aria-pressed={!stateFilter}
                  onClick={() => setStateFilter(null)}
                  className={filterPill(!stateFilter)}
                >
                  {t('dashboard.allAreas')} {state.currentState.length}
                </button>
                {stats.map(([k, label]) =>
                  stateCounts[k] > 0 && (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={stateFilter === k}
                      onClick={() => setStateFilter(f => (f === k ? null : k))}
                      className={filterPill(stateFilter === k)}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[k].bar}`} />
                      {label} {stateCounts[k]}
                    </button>
                  ),
                )}
              </div>
          );
          })()}
          </header>

          {/* Latest */}
          <section className="order-4 lg:col-span-8 lg:col-start-1">
              <SectionHeader title={baseline ? t('dashboard.newSinceVisit') : t('dashboard.latest')} />
              {state.whatChanged.length > 0 ? (
                newSinceVisit.length === 0 ? (
                <p className="text-sm text-ink-faint">{t('dashboard.nothingNew')}</p>
                ) : (
                <div className="divide-y divide-line-soft">
                  {latestEvents.map((event: any) => {
                    const eventTime = event.source_timestamp || event.created_at;
                    const source = event.source || 'figma';
                    return (
                      <div key={event.id} className="flex items-center gap-3 py-3">
                        <span className="flex-shrink-0 text-ink-faint">
                          {ACTION_ICONS[event.action] || DEFAULT_ACTION_ICON}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{capitalize(emojify(event.reason || ''))}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {capitalize(event.subject)} · {event.action}
                            {event.status === 'pending' && (
                              <span className="text-ink-faint"> · {t('event.unconfirmed')}</span>
                            )}
                          </p>
                        </div>
                        <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                          {event.status === 'pending' && (
                            <button
                              type="button"
                              disabled={resolving === event.id}
                              onClick={() => confirmCandidate(event.id)}
                              className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
                            >
                              {t('event.confirm')}
                            </button>
                          )}
                          {event.author && !isRawExternalId(event.author) && (
                            <span className="max-w-[84px] truncate">{event.author}</span>
                          )}
                          {source === 'figma' ? <FigmaIcon size={14} /> : source === 'slack' ? <SlackIcon size={14} /> : source === 'linear' ? <LinearIcon size={14} /> : source === 'telegram' ? <TelegramIcon size={14} /> : <RiFileTextLine size={12} className="text-green-600" />}
                          {formatRelative(eventTime)}
                        </span>
                      </div>
                    );
                  })}
                  {newSinceVisit.length > 5 && (
                    <p className="py-2 text-xs text-ink-faint">{t('dashboard.moreInActivity', { count: newSinceVisit.length - 5 })}</p>
                  )}
                </div>
                )
              ) : state.currentState.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line-strong p-6 text-center">
                  <p className="text-sm font-medium text-ink">{t('dashboard.noChangesYet')}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    <a href="/integrations" className="font-medium text-[var(--accent-link)] hover:underline">{t('dashboard.connectIntegration')}</a>
                    {t('dashboard.connectToTrack')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">{t('dashboard.noChangesPeriod', { period })}</p>
              )}
            </section>

            {/* Current state — aggregate meta lives in the project header */}
            <section className="order-2 lg:order-3 lg:col-span-8 lg:col-start-1">
              {state.currentState.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center">
                  <RiLinksLine size={40} className="text-line" />
                  <p className="mt-4 text-base text-ink">{t('dashboard.connectToSeeState')}</p>
                  <a
                    href="/integrations"
                    className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] py-2 pl-4 pr-3 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
                  >
                    {t('integrations.title')} <RiArrowRightSLine size={16} />
                  </a>
                </div>
              ) : (
                <div className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:scroll-px-0 sm:px-0 sm:pb-0">
                  {(stateFilter ? state.currentState.filter(f => factStatus.get(f.id) === stateFilter) : state.currentState).slice().sort((a: any, b: any) => {
                    // Sort by the displayed status — attention first; raw states
                    // (added/modify) would push approved cards to the top.
                    const priority: Record<string, number> = { disputed: 0, needsDecision: 1, inProgress: 2, approved: 3, outOfScope: 4 };
                    const pa = priority[factStatus.get(a.id) || 'needsDecision'] ?? 5;
                    const pb = priority[factStatus.get(b.id) || 'needsDecision'] ?? 5;
                    if (pa !== pb) return pa - pb;
                    return (a.subject || '').toLowerCase().localeCompare((b.subject || '').toLowerCase());
                  }).map((fact: any) => {
                    const status = factStatus.get(fact.id) || 'needsDecision';
                    const event = displayEvent(fact);
                    // Under a "Disputed" pill the line still shows the settled state
                    // the conflict is disputing (e.g. "Approved → Removal requested").
                    const baseStatus = status === 'disputed'
                      ? displayStatus(fact, false, prevSettledFor(fact))
                      : status;
                    const baseStatusLabel = `${t(`status.${baseStatus}`)}${fact.current_value?.scope ? ` · ${fact.current_value.scope}` : ''}`;
                    const statusLabel = statusWithScope(status, fact.current_value?.scope);
                    const isApproved = status === 'approved';
                    const factHistory = state.history
                      .filter((h: any) => h.fact_id === fact.id && h.new_state && h.previous_state?.toLowerCase() !== h.new_state?.toLowerCase() && h.reason !== 'test')
                      .sort((a: any, b: any) => new Date(b.decided_at || b.created_at).getTime() - new Date(a.decided_at || a.created_at).getTime());
                    const hasHistory = factHistory.length > 0;
                    const relatedConflict = conflictForFact(fact);
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
                        className={`group relative flex w-[74%] max-w-[300px] flex-shrink-0 snap-start flex-col rounded-xl border border-line bg-white px-4 py-3 transition sm:w-auto sm:max-w-none ${hasHistory ? 'cursor-pointer hover:border-line-strong' : ''}`}
                      >
                        <p className="text-[15px] font-semibold leading-snug text-ink">{capitalize(fact.subject)}</p>
                        {relatedConflict ? (
                          <>
                            <span className="relative mt-1.5 inline-flex w-fit items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800">
                              {t('status.disputed')}
                            </span>
                            {/* One line, end-truncated — the full phrase lives in the drawer
                                and on the attention card; the grid card stays a summary. */}
                            <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[13px] leading-[1.55] text-ink-muted">
                              {['approved', 'inProgress', 'outOfScope'].includes(baseStatus) && (
                                <span className="inline-flex shrink-0 items-center gap-1">
                                  {baseStatusLabel}
                                  <RiArrowRightLine size={12} aria-hidden="true" className="shrink-0" />
                                  <span className="sr-only"> → </span>
                                </span>
                              )}
                              <span className="min-w-0 truncate text-ink">
                                {relatedConflict.proposedEvent?.action
                                  ? (PROPOSED_LABELS[relatedConflict.proposedEvent.action] || capitalize(relatedConflict.proposedEvent.action))
                                  : t('event.changed')}
                              </span>
                            </p>
                          </>
                        ) : (
                          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                            <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[status].pill}`}>
                              {isApproved && <RiCheckLine size={11} className="mr-0.5 -mt-px text-emerald-600" />}
                              {statusLabel}
                            </span>
                            {event && (
                              <span className="text-[11px] text-ink-faint">{t(`event.${event}`)}</span>
                            )}
                          </p>
                        )}
                        {(lastActor || lastSource || fact.last_updated_at) && (
                          <div className="mt-auto flex items-center gap-1.5 pt-2.5 text-[11px] text-ink-faint">
                            <span className="flex min-w-0 items-center gap-1">
                              {lastSource === 'figma' ? <FigmaIcon size={12} /> : lastSource === 'slack' ? <SlackIcon size={12} /> : lastSource === 'linear' ? <LinearIcon size={12} /> : lastSource === 'telegram' ? <TelegramIcon size={12} /> : lastSource ? <RiFileTextLine size={11} className="text-green-600" /> : null}
                              <span className="truncate">
                                {lastSource && capitalize(lastSource)}
                                {/* "Approved by X" is provenance; other authors are
                                    just "last writer" — the drawer carries them. */}
                                {lastSource && isApproved && lastActor && !isRawExternalId(lastActor) && <span className="mx-1.5" aria-hidden="true">·</span>}
                                {isApproved && lastActor && !isRawExternalId(lastActor) && lastActor}
                              </span>
                            </span>
                            {showUpdated && <span className="ml-auto flex-shrink-0">{formatRelative(fact.last_updated_at!)}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Activity */}
            <section className="order-5 lg:col-span-8 lg:col-start-1">
              <SectionHeader
                title={t('dashboard.activity')}
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
                        {p.value === 'all' ? t('dashboard.periodAll') : p.label}
                      </button>
                    ))}
                  </div>
                }
              />

              {state.whatChanged.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-8 text-center">
                  <RiHistoryLine size={40} className="text-line" />
                  {state.currentState.length === 0 ? (
                    <p className="mt-4 text-base text-ink">{t('dashboard.connectToSeeChanges')}</p>
                  ) : (
                    <>
                      <p className="mt-4 text-base text-ink">
                        {period === 'all'
                          ? t('dashboard.noChangesAll')
                          : t('dashboard.noChangesPeriod', { period: t(`dashboard.${period}`) })}
                      </p>
                      <div className="mt-3 flex justify-center gap-3">
                        {period !== '7d' && (
                          <button onClick={() => handlePeriodChange('7d')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">{t('dashboard.7d')}</button>
                        )}
                        {period !== '30d' && (
                          <button onClick={() => handlePeriodChange('30d')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">{t('dashboard.30d')}</button>
                        )}
                        {period !== 'all' && (
                          <button onClick={() => handlePeriodChange('all')} className="text-sm font-medium text-[var(--accent-link)] hover:underline">{t('dashboard.all')}</button>
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
                          const showOriginal = event.content && !isDuplicateText(event.content, event.reason);
                          const expandable = Boolean(showOriginal || event.source_url);
                          return (
                            <div key={event.id}>
                            <button
                              onClick={expandable ? () => toggleEventDetails(event.id) : undefined}
                              className={`-mx-2 w-[calc(100%+1rem)] rounded-lg px-2 py-1.5 text-left transition-colors ${expandable ? 'hover:bg-fill' : 'cursor-default'}`}
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
                                  {event.author && !isRawExternalId(event.author) && (
                                    <span className="max-w-[84px] truncate">{event.author}</span>
                                  )}
                                  {source === 'figma' ? <FigmaIcon size={14} /> : source === 'slack' ? <SlackIcon size={14} /> : source === 'linear' ? <LinearIcon size={14} /> : source === 'telegram' ? <TelegramIcon size={14} /> : <RiFileTextLine size={12} className="text-green-600" />}
                                </span>
                              </div>
                              {expandedEvents.has(event.id) && expandable && (
                                <div className="mt-2 rounded-lg bg-fill px-3 py-2 text-sm text-ink-secondary">
                                  {showOriginal && (
                                    <>
                                      <p className="text-xs font-medium text-ink-faint">{t('dashboard.originalMessage')}</p>
                                      <p className="mt-1">{emojify(event.content)}</p>
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
                                      {t('dashboard.viewSource')}
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
                      {t('dashboard.showMore', { count: hiddenCount })}
                      <RiArrowDownSLine size={16} />
                    </button>
                  )}

                  {expanded && sortedDates.length > 2 && (
                    <button
                      onClick={() => setExpanded(false)}
                      className="flex items-center gap-1 text-sm font-medium text-[var(--accent-link)] hover:underline"
                    >
                      {t('dashboard.showLess')}
                      <RiArrowUpSLine size={16} />
                    </button>
                  )}
                </div>
              )}
            </section>
          {/* Right column — desktop: top row next to the project header;
              mobile: right after the overview, before the entity grid */}
          <div className="order-3 lg:order-2 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:row-span-4">
            <section>
              <SectionHeader
                title={unresolvedCount > 0
                  ? t('dashboard.needsAttentionCount', { count: unresolvedCount })
                  : t('dashboard.needsAttention')}
                caps={false}
              />
              {(state.stats.deadLettered || 0) > 0 && (
                <p className="mb-3 text-xs text-ink-faint">
                  {t('dashboard.failedEvents', { count: state.stats.deadLettered || 0 })}
                </p>
              )}
              {state.conflicts.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-sm text-ink-muted">{t('dashboard.noIssues')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.conflicts.filter((c: any) => c.status !== 'resolved').map((conflict: any) => {
                    const relatedFact = state.currentState.find((f: any) =>
                      f.id === conflict.previous_fact_id || normSubject(f.subject) === normSubject(conflict.subject));
                    const actions = conflictActions(conflict.currentState, conflict.proposedEvent?.action, conflict.conflict_type);
                    return (
                      <div
                        key={conflict.id}
                        onClick={relatedFact ? () => setSelectedFactId(relatedFact.id) : undefined}
                        className={`group relative rounded-xl border border-line bg-white p-3.5 transition-colors ${relatedFact ? 'cursor-pointer hover:border-line-strong' : ''}`}
                      >
                        {actions.keepKey && (
                          <span className="absolute -top-2.5 right-3 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                            {t(actions.currentKey)}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <p className="text-[15px] font-semibold leading-snug text-ink">{capitalize(conflict.subject)}</p>
                          {relatedFact && <RiArrowRightSLine size={14} className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />}
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                          {conflict.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {actions.acceptKey && relatedFact ? (
                            <button
                              onClick={() => resolveConflict(conflict.id, 'accept_new', conflict.proposedEvent.action)}
                              disabled={resolving === conflict.id}
                              className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-transparent bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
                            >
                              {t(actions.acceptKey, { subject: conflict.subject })}
                            </button>
                          ) : relatedFact && (
                            <button onClick={() => setSelectedFactId(relatedFact.id)}
                              className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]">
                              {t('decisionAction.review')}
                            </button>
                          )}
                          {actions.keepKey && relatedFact && <button
                            onClick={() => resolveConflict(conflict.id, 'keep_current')}
                            disabled={resolving === conflict.id}
                            className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-secondary transition-colors enabled:hover:border-transparent enabled:hover:bg-fill disabled:opacity-50"
                          >
                            {t(actions.keepKey, { subject: conflict.subject })}
                          </button>}
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1" onClick={(e) => e.stopPropagation()}>
                          {relatedFact && actions.acceptKey && (
                            <button onClick={() => setSelectedFactId(relatedFact.id)}
                              className="text-[13px] font-medium text-ink-faint underline-offset-2 transition-colors hover:text-ink-secondary hover:underline">
                              {t('decisionAction.viewEvidence')}
                            </button>
                          )}
                          {conflict.resolution === 'needs_clarification' ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-[13px] font-medium text-amber-700">
                                <RiTimeLine size={13} aria-hidden="true" />{t('decisionAction.awaitingClarification')}
                              </span>
                              <button onClick={() => resolveConflict(conflict.id, 'reopen')}
                                disabled={resolving === conflict.id}
                                className="text-[13px] font-medium text-ink-faint underline-offset-2 transition-colors hover:text-ink-secondary hover:underline disabled:opacity-50">
                                {t('dashboard.undo')}
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center">
                              <button
                                onClick={() => resolveConflict(conflict.id, 'clarify')}
                                disabled={resolving === conflict.id}
                                className="text-[13px] font-medium text-ink-faint underline-offset-2 transition-colors hover:text-ink-secondary hover:underline disabled:opacity-50"
                              >
                                {t('dashboard.notSure')}
                              </button>
                              <ClarificationHint id={`clarification-${conflict.id}`} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {state.conflicts.some((c: any) => c.status === 'resolved') && (
                    <div className="space-y-0.5 pt-1">
                      {state.conflicts.filter((c: any) => c.status === 'resolved').map((conflict: any) => (
                        <div key={conflict.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                          <RiCheckLine size={14} className="flex-shrink-0 text-emerald-600" />
                          <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{capitalize(conflict.subject)}</span>
                          <button
                            onClick={() => unresolveConflict(conflict.id)}
                            disabled={resolving === conflict.id}
                            className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-faint transition-colors hover:bg-fill hover:text-ink-secondary disabled:opacity-50"
                          >
                            {resolving === conflict.id ? t('dashboard.updating') : t('dashboard.undo')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>

        {selectedFact && <div className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-300" onClick={() => setSelectedFactId(null)} />}
        {/* Clip container keeps the off-canvas sheet from extending page scroll */}
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div
          className={`pointer-events-auto absolute inset-x-2 bottom-2 max-h-[85vh] overflow-y-auto overscroll-y-none rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-300 ease-out lg:left-auto lg:top-2 lg:right-2 lg:bottom-2 lg:max-h-none lg:w-full lg:max-w-md ${
            selectedFact ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full lg:translate-y-0'
          }`}
          aria-hidden={!selectedFact}
        >
          <div className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-line-strong lg:hidden" />
          {selectedFact && selectedMeta && (
            <>
              <div className="mb-6 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-ink">{capitalize(selectedFact.subject)}</h2>
                  <div className="mt-2">
                    <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[selectedStatus].pill}`}>
                      {selectedStatus === 'approved' && <RiCheckLine size={11} className="mr-0.5 -mt-px text-emerald-600" />}
                      {selectedStateLabel}
                    </span>
                  </div>
                  {(selectedHistory[0]?.previous_state || selectedHistory.length > 0) && (
                    <p className="mt-2 flex flex-wrap items-center text-xs text-ink-faint">
                      {selectedHistory[0]?.previous_state && (
                        <span>
                          {t('dashboard.previousState')}: {t(`status.${settledStatus(selectedHistory[0].previous_state?.toLowerCase())}`)}
                        </span>
                      )}
                      {selectedHistory[0]?.previous_state && selectedHistory.length > 0 && (
                        <span className="mx-1.5" aria-hidden="true">·</span>
                      )}
                      {selectedHistory.length > 0 && (
                        <span>
                          {selectedHistory.length} {tp(selectedHistory.length, 'plural.change')}
                          {(() => {
                            const people = new Set(selectedHistory.map((h: any) => h.author).filter(Boolean)).size;
                            return people > 1 ? (
                              <>
                                <span className="mx-1.5" aria-hidden="true">·</span>
                                {people} {tp(people, 'plural.person')}
                              </>
                            ) : null;
                          })()}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <button onClick={() => setSelectedFactId(null)} aria-label={t('auth.close')}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition hover:bg-fill hover:text-ink-secondary">
                  <RiCloseLine size={20} />
                </button>
              </div>
              <div className="space-y-5 border-t border-line-soft pt-4">
                {selectedFact.current_state?.toLowerCase() === 'removed' && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {t('conflict.state_change')}.
                  </div>
                )}

                <div>
                  <div className="relative ml-1 space-y-4 border-l border-line pl-4">
                    {groupedWhy.map((group: any) => (
                      <div key={group.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-line-strong" />
                        <p className="text-xs text-ink-faint">
                          {formatDateTime(group.occurrences[0].decided_at || group.occurrences[0].created_at)}
                          {group.occurrences.length > 1 && ` · +${group.occurrences.length - 1}`}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-secondary">
                          {group.reason ? capitalize(emojify(group.reason)) : t('dashboard.noReason')}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
                          {group.source && (() => {
                            const url = group.occurrences[0].source_url;
                            const label = (
                              <>
                                {group.source === 'figma' ? <FigmaIcon size={14} /> : group.source === 'slack' ? <SlackIcon size={14} /> : group.source === 'linear' ? <LinearIcon size={14} /> : group.source === 'telegram' ? <TelegramIcon size={14} /> : <RiFileTextLine size={12} className="text-green-500" />}
                                {group.source === 'gdocs' ? 'Google Docs' : capitalize(group.source)}
                              </>
                            );
                            return url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[var(--accent-link)] hover:underline"
                              >
                                {label}
                              </a>
                            ) : (
                              <span className="flex items-center gap-1">{label}</span>
                            );
                          })()}
                          {group.author && !isRawExternalId(group.author) && (
                            <span>{group.author}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {state.conflicts.filter((c: any) => c.status === 'unresolved' &&
                  (c.previous_fact_id === selectedFact.id || normSubject(c.subject) === normSubject(selectedFact.subject))).map((c: any) => {
                  const actions = conflictActions(c.currentState, c.proposedEvent?.action, c.conflict_type);
                  const source = c.proposedEvent?.raw?.source;
                  const author = c.proposedEvent?.raw?.metadata?.author?.name || c.proposedEvent?.raw?.author_id;
                  const drawerBase = displayStatus(selectedFact, false, prevSettledFor(selectedFact));
                  const proposalText = c.proposedEvent?.action
                    ? (PROPOSED_LABELS[c.proposedEvent.action] || capitalize(c.proposedEvent.action))
                    : t('event.changed');
                  return (
                    <div key={c.id} className="rounded-xl border border-line bg-fill-soft p-4">
                      <p className="text-xs font-medium text-ink-muted">{t('dashboard.openQuestion')}</p>
                      {/* Same "settled → proposed" line as on the grid card — the quote below
                          grounds it, the buttons resolve it. */}
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] leading-[1.55] text-ink-muted">
                        {['approved', 'inProgress', 'outOfScope'].includes(drawerBase) && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            {t(`status.${drawerBase}`)}{selectedFact.current_value?.scope ? ` · ${selectedFact.current_value.scope}` : ''}
                            <RiArrowRightLine size={12} aria-hidden="true" className="shrink-0" />
                            <span className="sr-only"> → </span>
                          </span>
                        )}
                        <span className="text-ink">{proposalText}</span>
                      </p>
                      <blockquote className="mt-2 text-sm leading-relaxed text-ink-secondary">{c.proposedEvent?.raw?.content || c.description}</blockquote>
                      {(source || author) && (
                        <p className="mt-2 flex flex-wrap items-center text-xs text-ink-muted">
                          {source && capitalize(source)}
                          {source && author && !isRawExternalId(author) && <span className="mx-1.5" aria-hidden="true">·</span>}
                          {author && !isRawExternalId(author) && author}
                        </p>
                      )}
                      {(actions.acceptKey || actions.keepKey) && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {actions.acceptKey && (
                            <button
                              onClick={() => resolveConflict(c.id, 'accept_new', c.proposedEvent?.action)}
                              disabled={resolving === c.id}
                              className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-transparent bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
                            >
                              {t(actions.acceptKey, { subject: c.subject })}
                            </button>
                          )}
                          {actions.keepKey && (
                            <button
                              onClick={() => resolveConflict(c.id, 'keep_current')}
                              disabled={resolving === c.id}
                              className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-secondary transition-colors enabled:hover:border-transparent enabled:hover:bg-fill disabled:opacity-50"
                            >
                              {t(actions.keepKey, { subject: c.subject })}
                            </button>
                          )}
                        </div>
                      )}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {c.resolution === 'needs_clarification' ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-amber-700">
                              <RiTimeLine size={13} aria-hidden="true" />{t('decisionAction.awaitingClarification')}
                            </span>
                            <button
                              onClick={() => resolveConflict(c.id, 'reopen')}
                              disabled={resolving === c.id}
                              className="text-[13px] font-medium text-ink-faint underline-offset-2 transition-colors hover:text-ink-secondary hover:underline disabled:opacity-50"
                            >
                              {t('dashboard.undo')}
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center">
                            <button
                              onClick={() => resolveConflict(c.id, 'clarify')}
                              disabled={resolving === c.id}
                              className="text-[13px] font-medium text-ink-faint underline-offset-2 transition-colors hover:text-ink-secondary hover:underline disabled:opacity-50"
                            >
                              {t('dashboard.notSure')}
                            </button>
                            <ClarificationHint id={`clarification-drawer-${c.id}`} align="left" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {process.env.NEXT_PUBLIC_IMPACT_ANALYSIS_ENABLED === 'true' && (
                  <DecisionsToRevisit
                    key={`${state.projectId}:${selectedFact.id}`}
                    projectId={state.projectId}
                    factId={selectedFact.id}
                    onOpenFact={setSelectedFactId}
                  />
                )}
              </div>
            </>
          )}
        </div>
        </div>

      </main>
    </div>
  );
}
