import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject, createIntegration } from '@/lib/db/queries';
import { encryptToken } from '@/lib/crypto';
import { telegramApi, type TgUser } from '@/lib/telegram/client';
import { getSiteUrl } from '@/lib/site';
import { randomBytes } from 'crypto';

// POST /api/integrations/telegram/connect
// Body: { projectId, botToken }
//
// Telegram connect is token-based, not OAuth: the user creates a bot via
// @BotFather, pastes the token, adds the bot to the project chat. We verify
// the token with getMe, store it encrypted, and register a webhook when a
// public URL is available. Local dev falls back to /api/jobs/poll-telegram.
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { projectId, botToken } = await request.json();
    if (!projectId || !botToken) {
      return NextResponse.json({ error: 'projectId and botToken are required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const token = String(botToken).trim();
    if (!/^\d+:[A-Za-z0-9_-]{30,}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid bot token format' }, { status: 400 });
    }

    let bot: TgUser;
    try {
      bot = await telegramApi<TgUser>(token, 'getMe');
    } catch {
      return NextResponse.json({ error: 'Telegram rejected the token — check it with @BotFather' }, { status: 400 });
    }
    if (!bot.is_bot) {
      return NextResponse.json({ error: 'Token does not belong to a bot' }, { status: 400 });
    }

    const webhookSecret = randomBytes(24).toString('hex');
    const webhookUrl = `${getSiteUrl()}/api/webhooks/telegram?s=${webhookSecret}`;

    const integration = await createIntegration({
      project_id: projectId,
      source: 'telegram',
      access_token_encrypted: encryptToken(token),
      config: {
        bot_id: bot.id,
        bot_username: bot.username,
        webhook_secret: webhookSecret,
        // chat_id is bound when the bot is added to the project chat
      },
    });

    // Register webhook — Telegram requires public HTTPS, so on localhost this
    // fails and the deployment falls back to getUpdates polling.
    let webhookActive = false;
    try {
      await telegramApi(token, 'setWebhook', {
        url: webhookUrl,
        secret_token: webhookSecret,
        allowed_updates: ['message', 'my_chat_member'],
        drop_pending_updates: true,
      });
      webhookActive = true;
    } catch (e) {
      console.warn('Telegram setWebhook failed (expected on localhost):', e);
    }

    await telegramApi(token, 'setMyCommands', {
      commands: [{ command: 'start', description: 'Show connection status' }],
    }).catch(() => {});

    return NextResponse.json({
      connected: true,
      bot_username: bot.username,
      webhook: webhookActive ? 'active' : 'polling',
      integration_id: integration.id,
    });
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
