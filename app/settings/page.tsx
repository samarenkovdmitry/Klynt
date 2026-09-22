'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Avatar from '@/components/Avatar';
import { RiArrowDownSLine } from '@remixicon/react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  unresolved_count?: number;
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  external_source: string;
}

interface TeamMember {
  email: string;
  role: string;
}

interface PendingInvite {
  id: string;
  email: string;
  created_at: string;
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [person, setPerson] = useState({ name: '', email: '', role: 'viewer' });
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editProject, setEditProject] = useState({ name: '', description: '' });

  const router = useRouter();

  useEffect(() => {
    const queryProjectId = new URLSearchParams(window.location.search).get('projectId');
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        const list: Project[] = data.projects || [];
        setProjects(list);
        const initial = queryProjectId && list.find(p => p.id === queryProjectId)
          ? queryProjectId
          : list[0]?.id || null;
        setSelectedProjectId(initial);
      });
  }, []);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.replace(`/settings?projectId=${projectId}`, { scroll: false });
  };

  useEffect(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      setEditProject({ name: project.name, description: project.description || '' });
    }
  }, [selectedProjectId, projects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/projects/${selectedProjectId}/members`).then(res => res.json()),
      fetch(`/api/projects/${selectedProjectId}/invite`).then(res => res.json()),
    ])
      .then(([membersData, invitesData]) => {
        setMembers(membersData.members || []);
        setTeam(membersData.team || []);
        setInvites(invitesData.invites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProjectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteEmail.trim()) return;
    setSaving(true);
    setInviteError(null);
    setInviteSent(false);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.invite) {
        setInvites(prev => [data.invite, ...prev]);
        setInviteEmail('');
        setInviteSent(true);
      } else {
        setInviteError(data.error || 'Failed to send invite');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTeammate = async (email: string) => {
    if (!selectedProjectId) return;
    await fetch(`/api/projects/${selectedProjectId}/invite?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    setTeam(prev => prev.filter(t => t.email !== email));
    setInvites(prev => prev.filter(i => i.email !== email));
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(prev => [data.member, ...prev]);
        setPerson({ name: '', email: '', role: 'viewer' });
      }
    } catch { /* keep silent — directory is secondary */ }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const data = await res.json();
        const project = data.project;
        setProjects(prev => [project, ...prev]);
        setSelectedProjectId(project.id);
        setNewProject({ name: '', description: '' });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !editProject.name.trim()) return;
    setSavingProject(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editProject.name, description: editProject.description }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, name: data.project.name, description: data.project.description } : p));
        setEditing(false);
      }
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    const project = projects.find(p => p.id === selectedProjectId);
    if (!confirm(`Delete project "${project?.name || ''}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => {
          const next = prev.filter(p => p.id !== selectedProjectId);
          setSelectedProjectId(next[0]?.id || null);
          return next;
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-bg lg:flex-row">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        activeItem="settings"
        loading={loading}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage your project and team.</p>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Project</h2>
          </div>
          {projects.length > 0 ? (
            <div className="rounded-2xl border border-line bg-white p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="relative flex-1">
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-line bg-field pl-4 pr-9 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted">
                    <RiArrowDownSLine size={16} />
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl bg-fill px-5 py-2.5 text-sm font-medium text-ink-secondary transition duration-200 active:scale-[0.98] hover:bg-fill disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSaveProject} className="space-y-3">
                  <input
                    type="text"
                    value={editProject.name}
                    onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                    className="w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    className="w-full rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingProject}
                      className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProject ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const project = projects.find(p => p.id === selectedProjectId);
                        if (project) setEditProject({ name: project.name, description: project.description || '' });
                        setEditing(false);
                      }}
                      className="rounded-xl bg-fill px-5 py-2.5 text-sm font-medium text-ink-secondary transition duration-200 active:scale-[0.98] hover:bg-fill disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-ink-muted">{editProject.description || 'No description'}</p>
              )}

              <div className="border-t border-line-soft pt-4">
                <p className="mb-3 text-sm font-medium text-ink">Create new project</p>
                <form onSubmit={handleCreateProject} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No projects.</p>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Team</h2>
          </div>
          {loading ? (
            <p className="text-sm text-ink-muted">Loading...</p>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-4 space-y-4">
              <div className="space-y-2">
                {team.map((t) => (
                  <div key={t.email} className="flex items-center gap-3 py-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full">
                      <Avatar name={null} email={t.email} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink">{t.email}</p>
                      <p className="text-xs text-ink-muted capitalize">{t.role}</p>
                    </div>
                    {t.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveTeammate(t.email)}
                        className="text-xs font-medium text-ink-muted transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {invites.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 py-2 opacity-70">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full">
                      <Avatar name={null} email={i.email} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink">{i.email}</p>
                      <p className="text-xs text-ink-muted">Invite sent</p>
                    </div>
                    <button
                      onClick={() => handleRemoveTeammate(i.email)}
                      className="text-xs font-medium text-ink-muted transition hover:text-red-600"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleInvite} className="border-t border-line-soft pt-4">
                <p className="mb-3 text-sm font-medium text-ink">Invite by email</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? 'Sending...' : 'Invite'}
                  </button>
                </div>
                {inviteError && <p className="mt-2 text-xs text-red-600">{inviteError}</p>}
                {inviteSent && <p className="mt-2 text-xs text-emerald-700">Invite sent — they'll get a link by email.</p>}
              </form>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">People directory</h2>
            <p className="mt-1 text-sm text-ink-muted">Names from Slack, Figma and Linear — used to attribute events. They don't get access to the project.</p>
          </div>
          {loading ? null : (
            <div className="rounded-2xl border border-line bg-white p-4 space-y-4">
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-sm text-ink-muted">No people yet — they'll appear from connected sources.</p>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full">
                        <Avatar name={m.name} email={m.email} />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{m.name || 'Unknown'}</p>
                        <p className="text-xs text-ink-muted">{m.email || m.external_source} · {m.role}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddPerson} className="border-t border-line-soft pt-4">
                <p className="mb-3 text-sm font-medium text-ink">Add person</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={person.name}
                    onChange={(e) => setPerson({ ...person, name: e.target.value })}
                    className="rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={person.email}
                    onChange={(e) => setPerson({ ...person, email: e.target.value })}
                    className="rounded-xl border border-line bg-field px-4 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    required
                  />
                  <div className="relative">
                    <select
                      value={person.role}
                      onChange={(e) => setPerson({ ...person, role: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-line bg-field pl-4 pr-9 py-2.5 text-sm text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted">
                      <RiArrowDownSLine size={16} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-fill px-5 py-2.5 text-sm font-medium text-ink-secondary transition duration-200 active:scale-[0.98] hover:bg-fill disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        <section className="mt-10">
          <button
            onClick={handleDeleteProject}
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete project'}
          </button>
          <p className="mt-1 text-sm text-ink-muted">This cannot be undone.</p>
        </section>
      </main>
    </div>
  );
}
