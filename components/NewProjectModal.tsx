'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiCloseLine } from '@remixicon/react';
import { t } from '@/lib/i18n';

export default function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('newProject.failed'));
      onClose();
      router.push(data.project.slug ? `/project/${data.project.slug}` : `/project?projectId=${data.project.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t('newProject.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint transition hover:bg-fill hover:text-ink-secondary"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {t('newProject.sub')}
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="new-project-name" className="mb-1.5 block text-sm font-medium text-ink-secondary">
              {t('newProject.name')}
            </label>
            <input
              id="new-project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder={t('newProject.namePlaceholder')}
              className="w-full rounded-2xl border border-line bg-field px-5 py-3.5 text-base text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="new-project-description" className="mb-1.5 block text-sm font-medium text-ink-secondary">
              {t('newProject.description')} <span className="font-normal text-ink-faint">{t('newProject.optional')}</span>
            </label>
            <input
              id="new-project-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('newProject.descPlaceholder')}
              className="w-full rounded-2xl border border-line bg-field px-5 py-3.5 text-base text-ink transition placeholder:text-ink-faint outline-none focus:border-[var(--accent-link)] focus:shadow-[inset_0_0_0_1px_var(--accent-link)] focus:bg-white"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-full bg-[var(--accent)] px-6 py-3.5 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? t('newProject.creating') : t('newProject.create')}
          </button>
        </form>
      </div>
    </div>
  );
}
