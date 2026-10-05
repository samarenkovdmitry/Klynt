import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { processTelegramUpdate } from '@/lib/telegram/process-update';
import { processSharedBotUpdate } from '@/lib/telegram/shared';
import type { TgUpdate } from '@/lib/telegram/client';

// Telegram webhook. Two modes:
// - Shared app bot: TELEGRAM_WEBHOOK_SECRET matches → one update stream is
//   routed to integrations by chat_id / link_code.
// - Legacy per-project bots: the per-integration secret (registered via
//   setWebhook's secret_token) arrives as X-Telegram-Bot-Api-Secret-Token or
//   ?s= and identifies the integration directly.
export async function POST(request: NextRequest) {
  try {
    const secret =
      request.headers.get('x-telegram-bot-api-secret-token') ||
      new URL(request.url).searchParams.get('s');
    if (!secret) {
      return NextResponse.json({ error: 'Missing secret' }, { status: 401 });
    }

    const update = (await request.json()) as TgUpdate;

    if (process.env.TELEGRAM_WEBHOOK_SECRET && secret === process.env.TELEGRAM_WEBHOOK_SECRET) {
      await processSharedBotUpdate(update);
      return NextResponse.json({ received: true });
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('source', 'telegram')
      .filter('config->>webhook_secret', 'eq', secret)
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: 'Unknown integration' }, { status: 401 });
    }

    await processTelegramUpdate(integration, update);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
