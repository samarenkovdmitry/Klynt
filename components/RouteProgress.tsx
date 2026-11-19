'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const ROUTE_PROGRESS_EVENT = 'klynt:route-start';

// App Router has no router events — programmatic navigations (router.push after
// login, project creation, invite accept) signal the start through this event.
export function signalRouteStart() {
  window.dispatchEvent(new Event(ROUTE_PROGRESS_EVENT));
}

// A navigation starts when the user clicks an internal link or signals one
// programmatically, and ends when the pathname/search actually changes.
function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onStart = () => setLoading(true);
    window.addEventListener(ROUTE_PROGRESS_EVENT, onStart);
    return () => window.removeEventListener(ROUTE_PROGRESS_EVENT, onStart);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setLoading(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(id);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(id);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60]">
      <div className="h-0.5 w-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent)_0%,#2FA37A_55%,#4FB3A0_100%)]"
          style={{ width: '40%', animation: 'klynt-progress 1.2s ease-in-out infinite' }}
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
  );
}

export default function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressBar />
    </Suspense>
  );
}
