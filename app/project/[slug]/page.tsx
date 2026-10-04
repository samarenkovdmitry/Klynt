'use client';

import { ProjectDashboard } from '@/app/project/dashboard';

export default function ProjectSlugPage({ params }: { params: { slug: string } }) {
  return <ProjectDashboard slug={decodeURIComponent(params.slug)} />;
}
