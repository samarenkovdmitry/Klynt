import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { processTelegramUpdate } from '@/lib/telegram/process-update';
import type { TgUpdate } from '@/lib/telegram/client';

// Telegram webhook. Security: the secret is registered via setWebhook's
// secret_token and arrives as X-Telegram-Bot-Api-Secret-Token — we match it
// against config.webhook_secret to find the integration and reject forgery.
export async function POST(request: NextRequest) {
  try {
    const secret =
      request.headers.get('x-telegram-bot-api-secret-token') ||
      new URL(request.url).searchParams.get('s');
    if (!secret) {
      return NextResponse.json({ error: 'Missing secret' }, { status: 401 });
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

    const update = (await request.json()) as TgUpdate;
    await processTelegramUpdate(integration, update);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
