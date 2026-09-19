'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ProjectRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const queryProjectId = new URLSearchParams(window.location.search).get('projectId');
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        const list = data.projects || [];
        const target = queryProjectId
          ? list.find((p: { id: string }) => p.id === queryProjectId)
          : list[0];
        router.replace(
          target?.slug
            ? `/project/${target.slug}`
            : target
              ? `/project?projectId=${target.id}`
              : '/project',
          { scroll: false }
        );
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-app-bg lg:flex-row">
      <Sidebar projects={[]} selectedProjectId={null} activeItem="project" loading />
      <main className="w-full flex-1 px-3 py-4 sm:px-8 sm:py-6" />
    </div>
  );
}
