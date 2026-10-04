import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser } from '@/lib/api-auth';
import { decryptToken } from '@/lib/crypto';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  return !!(await getSessionUser());
}

// Pull a Figma author out of whatever shape the metadata has.
function figmaAuthorFromMetadata(metadata: any) {
  const user =
    metadata?.comment?.user ||
    metadata?.version?.user ||
    metadata?.user ||
    null;
  if (!user?.id) return null;
  return { id: user.id, name: user.handle || user.id, avatar_url: user.img_url || undefined };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: events, error } = await supabase
      .from('raw_events')
      .select('id, project_id, source, author_id, metadata')
      .not('author_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    // Slack user cache: project -> userId -> profile
    const slackTokenByProject = new Map<string, string>();
    const slackUserCache = new Map<string, any>();
    let updated = 0;

    for (const event of events || []) {
      const metadata = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : (event.metadata || {});
      if (metadata.author?.name) continue;

      let author: { id: string; name: string; avatar_url?: string } | null = null;

      if (event.source === 'figma') {
        author = figmaAuthorFromMetadata(metadata);
      } else if (event.source === 'slack' && event.author_id) {
        if (!slackTokenByProject.has(event.project_id)) {
          const { data: integ } = await supabase
            .from('integrations')
            .select('access_token_encrypted')
            .eq('project_id', event.project_id)
            .eq('source', 'slack')
            .maybeSingle();
          slackTokenByProject.set(
            event.project_id,
            integ?.access_token_encrypted ? decryptToken(integ.access_token_encrypted) : ''
          );
        }
        const token = slackTokenByProject.get(event.project_id);
        if (token) {
          if (!slackUserCache.has(event.author_id)) {
            const info = await fetch(
              `https://slack.com/api/users.info?user=${event.author_id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            ).then(r => r.json()).catch(() => null);
            slackUserCache.set(event.author_id, info?.ok ? info.user : null);
          }
          const u = slackUserCache.get(event.author_id);
          if (u) {
            const p = u.profile || {};
            author = {
              id: event.author_id,
              name: p.display_name || p.real_name || u.real_name || event.author_id,
              avatar_url: p.image_48 || p.image_32,
            };
          }
        }
      }

      if (author) {
        const { error: upErr } = await supabase
          .from('raw_events')
          .update({ metadata: { ...metadata, author } })
          .eq('id', event.id);
        if (!upErr) updated++;
      }
    }

    return NextResponse.json({ scanned: events?.length || 0, updated });
  } catch (err) {
    console.error('Error backfilling authors:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
