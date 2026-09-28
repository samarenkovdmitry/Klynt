import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser } from '@/lib/api-auth';
import { telegramApi, type TgUpdate } from '@/lib/telegram/client';
import { processTelegramUpdate } from '@/lib/telegram/process-update';
import { decryptToken } from '@/lib/crypto';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  return !!(await getSessionUser());
}

// Fallback for environments where Telegram can't reach our webhook
// (localhost, firewalled self-host): fetch pending updates via getUpdates
// and run them through the same handler as the webhook route.
// Offset is persisted in integration config so updates aren't re-read.
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('source', 'telegram');

    if (error) throw error;

    const results: any[] = [];
    for (const integration of integrations || []) {
      try {
        const token = decryptToken(integration.access_token_encrypted);
        const offset = (integration.config?.update_offset ?? 0) as number;

        const updates = await telegramApi<TgUpdate[]>(token, 'getUpdates', {
          offset: offset + 1,
          limit: 100,
          timeout: 0,
          allowed_updates: ['message', 'my_chat_member'],
        });

        let maxId = offset;
        let processed = 0;
        for (const update of updates) {
          await processTelegramUpdate(integration, update);
          maxId = Math.max(maxId, update.update_id);
          processed++;
        }

        if (maxId !== offset) {
          await supabase
            .from('integrations')
            .update({ config: { ...integration.config, update_offset: maxId } })
            .eq('id', integration.id);
        }

        results.push({ integration_id: integration.id, fetched: updates.length, processed });
      } catch (e) {
        console.error(`Telegram poll failed for integration ${integration.id}:`, e);
        results.push({ integration_id: integration.id, error: String(e) });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in poll-telegram:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
