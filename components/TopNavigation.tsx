'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiArrowDownSLine, RiPlugLine, RiSettings3Line, RiLogoutBoxRLine, RiAddLine } from '@remixicon/react';
import { createClient } from '@/lib/supabase/client';
import { signalRouteStart } from '@/components/RouteProgress';
import NewProjectModal from '@/components/NewProjectModal';
import Avatar from '@/components/Avatar';
import { FigmaIcon, SlackIcon, LinearIcon, TelegramIcon } from '@/components/icons/BrandIcons';
import { t } from '@/lib/i18n';
import { logoSrc } from '@/lib/market';
import { siGoogledocs, siNotion } from 'simple-icons';

interface Project {
  id: string;
  name: string;
  slug?: string;
  unresolved_count?: number;
  is_demo?: boolean;
}

interface NavigationProps {
  projects: Project[];
  selectedProjectId: string | null;
  activeItem: 'project' | 'integrations' | 'settings';
  onProjectChange?: (projectId: string) => void;
  loading?: boolean;
  integrations?: { project_id: string; source: string; status: string }[];
}

const SOURCE_NAMES: Record<string, string> = { slack: 'Slack', figma: 'Figma', linear: 'Linear', telegram: 'Telegram', gdocs: 'Google Docs', notion: 'Notion' };

export default function TopNavigation({ projects, selectedProjectId, activeItem, onProjectChange, loading, integrations }: NavigationProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const projectMenu = useRef<HTMLDetailsElement>(null);
  const userMenu = useRef<HTMLDetailsElement>(null);
  const router = useRouter();
  const [connections, setConnections] = useState<NonNullable<NavigationProps['integrations']> | null>(null);

  useEffect(() => {
    if (integrations !== undefined) return;
    const controller = new AbortController();
    fetch('/api/integrations', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load sources');
        return response.json();
      })
      .then(data => setConnections(data.integrations))
      .catch(() => { /* Unknown connections must not be presented as disconnected. */ });
    return () => controller.abort();
  }, [integrations]);

  const sourceData = integrations ?? connections;
  const sources = [...new Map((sourceData ?? [])
    .filter(connection => connection.project_id === selectedProjectId)
    .map(connection => [connection.source, connection])).values()];
  const hasSourceIssue = sources.some(source => source.status !== 'active');
  const sourcesLabel = sources.length
    ? `${t('settings.sources')}: ${sources.map(source => `${SOURCE_NAMES[source.source] || source.source}${source.status !== 'active' ? ` (${t('nav.sourceIssue')})` : ''}`).join(', ')}`
    : sourceData === null ? t('settings.sources') : t('nav.connectSources');

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
    const closeMenus = (event: PointerEvent | KeyboardEvent) => {
      for (const ref of [projectMenu, userMenu]) {
        const menu = ref.current;
        if (!menu?.open) continue;
        if (event instanceof KeyboardEvent) {
          if (event.key === 'Escape') {
            menu.open = false;
            menu.querySelector('summary')?.focus();
          }
        } else if (!menu.contains(event.target as Node)) {
          menu.open = false;
        }
      }
    };
    document.addEventListener('pointerdown', closeMenus);
    document.addEventListener('keydown', closeMenus);
    return () => {
      document.removeEventListener('pointerdown', closeMenus);
      document.removeEventListener('keydown', closeMenus);
    };
  }, []);

  const selectedProject = projects.find(project => project.id === selectedProjectId);
  const pageHref = (path: string) => {
    if (path === '/project' && selectedProject?.slug) return `/project/${selectedProject.slug}`;
    return selectedProjectId ? `${path}?projectId=${selectedProjectId}` : path;
  };
  const visibleProjects = [...projects]
    .sort((a, b) => Number(Boolean(a.is_demo) || a.name.startsWith('Sample ·')) - Number(Boolean(b.is_demo) || b.name.startsWith('Sample ·')))
    .filter(project => project.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const selectProject = (project: Project) => {
    if (projectMenu.current) projectMenu.current.open = false;
    if (onProjectChange) onProjectChange(project.id);
    else { signalRouteStart(); router.push(project.slug ? `/project/${project.slug}` : `/project?projectId=${project.id}`); }
  };
  const navClass = (active: boolean) =>
    `inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm transition-colors hover:bg-fill sm:px-2.5 ${active ? 'bg-fill font-medium text-ink' : 'text-ink-secondary'}`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full shrink-0 border-b border-line bg-white/95 backdrop-blur">
        <nav aria-label={t('nav.workspace')} className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-4 px-3 sm:gap-6 sm:px-8">
          <Link href={pageHref('/project')} className="shrink-0" aria-label="Klynt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc()} alt="Klynt" className="h-6 w-auto" />
          </Link>
          <details ref={projectMenu} className="group relative min-w-0" onToggle={event => {
            if (event.currentTarget.open) {
              setQuery('');
              if (userMenu.current) userMenu.current.open = false;
            }
          }}>
            <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-line px-2.5 text-sm text-ink-secondary transition-colors hover:border-transparent hover:bg-fill focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 [&::-webkit-details-marker]:hidden">
              <span className="max-w-[32vw] truncate sm:max-w-[260px]">{selectedProject?.name || t('sidebar.projects')}</span>
              <RiArrowDownSLine size={16} className="shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-110px))] rounded-xl border border-line bg-white p-2 shadow-lg">
              {(projects.length >= 8 || query.length > 0) && <input aria-label={t('nav.searchProjects')} placeholder={t('nav.searchProjects')} value={query}
                onChange={event => setQuery(event.target.value)}
                className="mb-2 w-full rounded-lg border border-line bg-fill-soft px-3 py-2 text-sm outline-none focus:border-ink-muted" />}
              <div className="max-h-[50vh] overflow-y-auto">
                {loading && projects.length === 0 && <div className="skeleton-shimmer m-2 h-8 rounded" />}
                {visibleProjects.map(project => (
                  <button key={project.id} onClick={() => selectProject(project)} aria-current={project.id === selectedProjectId ? 'page' : undefined}
                    className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-fill focus-visible:bg-fill focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600 ${project.id === selectedProjectId ? 'bg-fill-soft font-semibold text-ink' : 'text-ink-secondary'}`}>
                    <span className="min-w-0 flex-1 truncate">{project.name}</span>
                    {!!project.unresolved_count && (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-medium tabular-nums text-amber-800"
                        title={t('dashboard.needsAttentionCount', { count: project.unresolved_count })}>
                        <span aria-hidden="true">{project.unresolved_count}</span>
                        <span className="sr-only">{t('dashboard.needsAttentionCount', { count: project.unresolved_count })}</span>
                      </span>
                    )}
                  </button>
                ))}
                {!loading && visibleProjects.length === 0 && <p className="px-3 py-4 text-xs text-ink-muted">{t('nav.noProjects')}</p>}
              </div>
              <div className="mt-2 border-t border-line pt-2">
                <button onClick={() => { if (projectMenu.current) projectMenu.current.open = false; setCreateOpen(true); }}
                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ink-secondary transition-colors hover:bg-fill hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600">
                  <RiAddLine size={16} className="shrink-0" />{t('sidebar.newProject')}
                </button>
              </div>
            </div>
          </details>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            {selectedProjectId && (
              <Link href={pageHref('/integrations')} className={`relative ${navClass(activeItem === 'integrations')}`} aria-label={sourcesLabel} title={sourcesLabel}>
                {sources.length ? (
                  <>
                    <span className="flex items-center gap-2" aria-hidden="true">
                      {sources.slice(0, 3).map(({ source, status }) => (
                        <span key={source} className="relative flex h-5 w-5 items-center justify-center" title={`${SOURCE_NAMES[source] || source}${status !== 'active' ? ` — ${t('nav.sourceIssue')}` : ''}`}>
                          {source === 'figma' ? <FigmaIcon size={16} /> : source === 'slack' ? <SlackIcon size={16} /> : source === 'linear' ? <LinearIcon size={16} /> : source === 'telegram' ? <TelegramIcon size={16} /> : source === 'gdocs' || source === 'notion' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={`#${source === 'gdocs' ? siGoogledocs.hex : siNotion.hex}`}>
                              <path d={source === 'gdocs' ? siGoogledocs.path : siNotion.path} />
                            </svg>
                          ) : <RiPlugLine size={16} />}
                          {status !== 'active' && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />}
                        </span>
                      ))}
                    </span>
                    {sources.length > 3 && <span className={sources.slice(3).some(source => source.status !== 'active') ? 'text-amber-700' : ''}>+{sources.length - 3}</span>}
                    {hasSourceIssue && <span className="sr-only">{t('nav.sourceIssue')}</span>}
                  </>
                ) : (
                  <><RiPlugLine size={17} /><span className="hidden md:inline">{sourceData === null ? t('settings.sources') : t('nav.connectSources')}</span></>
                )}
              </Link>
            )}
            <Link href={pageHref('/settings')} className={navClass(activeItem === 'settings')} aria-label={t('nav.projectSettings')} title={t('nav.projectSettings')} aria-current={activeItem === 'settings' ? 'page' : undefined}>
              <RiSettings3Line size={17} /><span className="hidden md:inline">{t('nav.projectSettings')}</span>
            </Link>
            {userEmail && (
              <details ref={userMenu} className="relative" onToggle={event => {
                if (event.currentTarget.open && projectMenu.current) projectMenu.current.open = false;
              }}>
                <summary aria-label={t('nav.account')} className="flex h-8 w-8 cursor-pointer list-none rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 [&::-webkit-details-marker]:hidden">
                  <Avatar name={userEmail} email={userEmail} className="text-[10px]" />
                </summary>
                <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-line bg-white p-2 shadow-lg">
                  <p className="truncate border-b border-line px-3 py-2 text-xs text-ink-muted">{userEmail}</p>
                  <button onClick={async () => { await createClient().auth.signOut(); signalRouteStart(); router.push('/login'); }}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary hover:bg-fill-soft">
                    <RiLogoutBoxRLine size={16} />{t('sidebar.logout')}
                  </button>
                </div>
              </details>
            )}
          </div>
        </nav>
      </header>
      <NewProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
