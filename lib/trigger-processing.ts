import { waitUntil } from '@vercel/functions';
import { getSiteUrl } from '@/lib/site';

// Kick off event interpretation right after a webhook stores a raw event —
// processing no longer waits for the daily cron or an open dashboard.
// waitUntil keeps the serverless invocation alive after the response.
export function triggerEventProcessing(projectId: string | undefined, request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  const origin = new URL(request.url).origin || getSiteUrl();
  waitUntil(
    fetch(`${origin}/api/jobs/process-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      // Without a projectId the cron path processes every project with pending events
      body: JSON.stringify(projectId ? { projectId } : {}),
    }).catch((e) => console.error('process-events trigger failed:', e))
  );
}
