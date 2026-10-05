import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser } from '@/lib/api-auth';
import { telegramApi, type TgUpdate } from '@/lib/telegram/client';
import { processTelegramUpdate } from '@/lib/telegram/process-update';
import { processSharedBotUpdate } from '@/lib/telegram/shared';
import { decryptToken } from '@/lib/crypto';
import { promises as fs } from 'fs';
import path from 'path';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  return !!(await getSessionUser());
}

// getUpdates offset for the shared bot. Polling is a local-dev fallback —
// the offset lives in .cache so a dev-server restart doesn't replay updates.
const OFFSET_FILE = path.join(process.cwd(), '.cache', 'telegram-update-offset');

async function readSharedOffset(): Promise<number> {
  try {
    return parseInt(await fs.readFile(OFFSET_FILE, 'utf8'), 10) || 0;
  } catch {
    return 0;
  }
}

async function writeSharedOffset(offset: number): Promise<void> {
  try {
    await fs.mkdir(path.dirname(OFFSET_FILE), { recursive: true });
    await fs.writeFile(OFFSET_FILE, String(offset));
  } catch {
    // read-only fs (serverless) — fine, prod uses the webhook
  }
}

// Fallback for environments where Telegram can't reach our webhook
// (localhost, firewalled self-host): fetch pending updates via getUpdates
// and run them through the same handler as the webhook route.
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Shared app bot: one update stream, dispatched by chat_id / link_code
    const sharedToken = process.env.TELEGRAM_BOT_TOKEN;
    if (sharedToken) {
      const offset = await readSharedOffset();
      const updates = await telegramApi<TgUpdate[]>(sharedToken, 'getUpdates', {
        offset: offset + 1,
        limit: 100,
        timeout: 0,
        allowed_updates: ['message', 'my_chat_member'],
      });

      let maxId = offset;
      for (const update of updates) {
        try {
          await processSharedBotUpdate(update);
        } catch (e) {
          console.error('Shared Telegram update failed:', e);
        }
        maxId = Math.max(maxId, update.update_id);
      }
      if (maxId !== offset) await writeSharedOffset(maxId);

      return NextResponse.json({ results: [{ shared_bot: true, fetched: updates.length }] });
    }

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
