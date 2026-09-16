'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RiMenuLine,
  RiCloseLine,
  RiPlugLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiAddLine,
  RiFolderLine,
} from '@remixicon/react';

import { createClient } from '@/lib/supabase/client';
import NewProjectModal from '@/components/NewProjectModal';
import Avatar from '@/components/Avatar';

interface Project {
  id: string;
  name: string;
  unresolved_count?: number;
}

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  activeItem: 'project' | 'integrations' | 'settings';
  onProjectChange?: (projectId: string) => void;
  loading?: boolean;
}

function KlyntLogo() {
  return (
    <img
      src="/klynt-logo-dark.svg"
      alt="Klynt"
      className="h-8 w-auto"
    />
  );
}

export default function Sidebar({ projects, selectedProjectId, activeItem, onProjectChange, loading }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleProjectClick = (projectId: string) => {
    if (onProjectChange) {
      onProjectChange(projectId);
    } else {
      router.push(`/project?projectId=${projectId}`);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const navItem = (href: string, label: string, isActive: boolean, icon?: React.ReactNode) => (
    <Link
      href={href}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        isActive ? 'bg-fill font-medium text-ink' : 'text-ink-secondary hover:bg-fill-soft'
      }`}
    >
      {icon && <span className="text-ink-faint">{icon}</span>}
      {label}
    </Link>
  );

  return (
    <>
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[240px] flex-shrink-0 self-start overflow-y-auto bg-white px-4 py-8 shadow-[1px_0_0_0_rgba(0,0,0,0.03),2px_0_8px_-4px_rgba(0,0,0,0.03)] lg:flex lg:flex-col">
        <div className="mb-8 px-2">
          <Link href="/project">
            <KlyntLogo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Projects</p>
          {projects.map((p) => {
            const isSelected = selectedProjectId === p.id && activeItem === 'project';
            const count = p.unresolved_count || 0;
            return (
              <button
                key={p.id}
                onClick={() => handleProjectClick(p.id)}
                className={`relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-tint)] font-medium text-[var(--accent-link)]'
                    : 'text-ink-secondary hover:bg-fill-soft'
                }`}
              >
                {isSelected && (
                  <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                )}
                <RiFolderLine size={15} className={`flex-shrink-0 ${isSelected ? 'text-[var(--accent-link)]' : 'text-ink-faint'}`} />
                <span className="truncate">{p.name}</span>
                {!isSelected && count > 0 && (
                  <span
                    className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"
                    title={`${count} ${count === 1 ? 'item needs' : 'items need'} attention`}
                  />
                )}
              </button>
            );
          })}

          <button
            onClick={() => setCreateOpen(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink-secondary"
          >
            <RiAddLine size={14} />
            New project
          </button>

          <div className="my-4 h-px bg-fill" />

          {navItem('/integrations', 'Integrations', activeItem === 'integrations', <RiPlugLine size={16} />)}
          {navItem('/settings', 'Settings', activeItem === 'settings', <RiSettings3Line size={16} />)}
        </nav>

        {userEmail && (
          <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-fill-soft px-3 py-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
              <Avatar name={userEmail} email={userEmail} className="text-[10px]" />
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-ink-secondary" title={userEmail}>
              {userEmail}
            </p>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 text-ink-faint transition-colors hover:text-ink-secondary"
              title="Log out"
            >
              <RiLogoutBoxRLine size={16} />
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-[#061C2F]" />
            Loading...
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 w-full lg:hidden">
        <header
          className="flex w-full items-center bg-white px-4 py-3 shadow-[0_1px_0_0_rgba(0,0,0,0.03),0_2px_8px_-4px_rgba(0,0,0,0.03)]"
        >
          <Link href="/project" onClick={() => setMobileMenuOpen(false)}>
            <KlyntLogo />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-[#061C2F]" />
            )}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="p-2 text-ink"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown menu */}
        <div
          className={`absolute left-0 right-0 top-full z-10 bg-white px-4 py-4 shadow-lg transition-all duration-200 ease-out ${
            mobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-2 opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Projects</p>
          <div className="mt-2 space-y-1">
            {projects.map((p) => {
              const isSelected = selectedProjectId === p.id;
              const count = p.unresolved_count || 0;
              return (
                <button
                  key={p.id}
                  onClick={() => { handleProjectClick(p.id); setMobileMenuOpen(false); }}
                  className={`relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                    isSelected ? 'bg-[var(--accent-tint)] font-medium text-[var(--accent-link)]' : 'text-ink-secondary'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                  )}
                  <RiFolderLine size={15} className={`flex-shrink-0 ${isSelected ? 'text-[var(--accent-link)]' : 'text-ink-faint'}`} />
                  <span className="truncate">{p.name}</span>
                  {!isSelected && count > 0 && (
                    <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => { setCreateOpen(true); setMobileMenuOpen(false); }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-muted"
            >
              <RiAddLine size={14} />
              New project
            </button>
          </div>
          <div className="my-3 h-px bg-fill" />
          <div className="space-y-1">
            <Link href="/integrations" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary" onClick={() => setMobileMenuOpen(false)}>
              <RiPlugLine size={16} className="text-ink-faint" />
              Integrations
            </Link>
            <Link href="/settings" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary" onClick={() => setMobileMenuOpen(false)}>
              <RiSettings3Line size={16} className="text-ink-faint" />
              Settings
            </Link>
          </div>
          {userEmail && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-fill-soft px-3 py-2.5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
                <Avatar name={userEmail} email={userEmail} className="text-[10px]" />
              </span>
              <p className="min-w-0 flex-1 truncate text-xs text-ink-secondary" title={userEmail}>{userEmail}</p>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex-shrink-0 text-ink-faint transition-colors hover:text-ink-secondary"
                title="Log out"
              >
                <RiLogoutBoxRLine size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="absolute left-0 right-0 top-full z-0 h-screen bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>

      <NewProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
