'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);

    // Stale-chunk crash after a fresh deploy — reload once to fetch new assets
    try {
      if (error?.name === 'ChunkLoadError' && !sessionStorage.getItem('klynt:chunkReload')) {
        sessionStorage.setItem('klynt:chunkReload', '1');
        window.location.reload();
      }
    } catch {}
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>{error?.message}</p>
        </div>
      </body>
    </html>
  );
}
