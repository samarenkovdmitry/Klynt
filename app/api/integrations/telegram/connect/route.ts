import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject, getIntegration, createIntegration } from '@/lib/db/queries';
import { encryptToken } from '@/lib/crypto';
import { telegramApi, type TgUser } from '@/lib/telegram/client';
import { getSiteUrl } from '@/lib/site';
import { randomBytes } from 'crypto';

// POST /api/integrations/telegram/connect
// Body: { projectId, botToken? }
//
// Two modes:
// - Shared app bot (TELEGRAM_BOT_TOKEN set): the user never sees a token.
//   We create an integration with a one-time link_code and return a
//   t.me/<bot>?startgroup=<code> deep link — adding the bot to a chat
//   delivers "/start <code>" into it and binds the chat automatically.
// - Per-project bot (env not set): the user creates a bot via @BotFather
//   and pastes the token; we verify it with getMe and register a webhook.
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { projectId, botToken } = await request.json();
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const sharedToken = process.env.TELEGRAM_BOT_TOKEN;
    if (sharedToken) {
      const bot = await telegramApi<TgUser>(sharedToken, 'getMe');
      const existing = await getIntegration(projectId, 'telegram');

      let linkCode = existing?.config?.link_code as string | undefined;
      if (existing?.config?.chat_id) {
        // Already bound — nothing to do
        return NextResponse.json({ connected: true, bot_username: bot.username });
      }
      if (!linkCode) linkCode = randomBytes(16).toString('hex');

      if (existing) {
        await supabase
          .from('integrations')
          .update({
            config: {
              ...existing.config,
              shared_bot: true,
              bot_username: bot.username,
              link_code: linkCode,
            },
          })
          .eq('id', existing.id);
      } else {
        await createIntegration({
          project_id: projectId,
          source: 'telegram',
          access_token_encrypted: encryptToken(sharedToken),
          config: {
            shared_bot: true,
            bot_id: bot.id,
            bot_username: bot.username,
            link_code: linkCode,
          },
        });
      }

      // Register the shared webhook once — idempotent, and on localhost it
      // fails so the deployment falls back to /api/jobs/poll-telegram.
      const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
      if (webhookSecret) {
        try {
          await telegramApi(sharedToken, 'setWebhook', {
            url: `${getSiteUrl()}/api/webhooks/telegram`,
            secret_token: webhookSecret,
            allowed_updates: ['message', 'my_chat_member'],
          });
        } catch (e) {
          console.warn('Telegram setWebhook failed (expected on localhost):', e);
        }
      }

      return NextResponse.json({
        connected: true,
        bot_username: bot.username,
        deep_link: `https://t.me/${bot.username}?startgroup=${linkCode}`,
      });
    }

    if (!botToken) {
      return NextResponse.json({ error: 'botToken required', code: 'token_required' }, { status: 400 });
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
