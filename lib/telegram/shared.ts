import { supabase } from '@/lib/db/supabase';
import { telegramApi, type TgUpdate } from '@/lib/telegram/client';
import { recordTelegramMessage } from '@/lib/telegram/process-update';
import { t } from '@/lib/i18n';
import { getSiteUrl } from '@/lib/site';

// Shared-app-bot mode: one bot (@klynt) serves all projects. Users add it via
// the t.me/<bot>?startgroup=<link_code> deep link — Telegram delivers
// "/start <link_code>" into the chosen chat, which binds the chat to the
// pending integration. After binding, messages route by config.chat_id.
export function sharedBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

async function findByChatId(chatId: number) {
  const { data } = await supabase
    .from('integrations')
    .select('*')
    .eq('source', 'telegram')
    .filter('config->>chat_id', 'eq', chatId)
    .maybeSingle();
  return data;
}

export async function processSharedBotUpdate(update: TgUpdate): Promise<void> {
  const token = sharedBotToken();
  if (!token) return;

  const member = update.my_chat_member;
  if (member && member.chat.type !== 'private') {
    const status = member.new_chat_member.status;
    const chat = member.chat;

    if (['left', 'kicked'].includes(status)) {
      // Bot removed → unbind so the integration card returns to "waiting"
      const integration = await findByChatId(chat.id);
      if (integration) {
        const { chat_id: _c, chat_title: _t, ...rest } = integration.config || {};
        await supabase.from('integrations').update({ config: rest }).eq('id', integration.id);
      }
      return;
    }

    if (['member', 'administrator'].includes(status)) {
      const bound = await findByChatId(chat.id);
      if (bound) return;
      // Added manually (not via the deep link) — no /start payload will follow.
      // If no project is waiting to link, tell the chat how to connect.
      const { data: pending } = await supabase
        .from('integrations')
        .select('id')
        .eq('source', 'telegram')
        .not('config->>link_code', 'is', null)
        .limit(1);
      if (!pending?.length) {
        await telegramApi(token, 'sendMessage', {
          chat_id: chat.id,
          text: t('telegram.botHint', { url: getSiteUrl() }),
        }).catch(() => {});
      }
    }
    return;
  }

  const message = update.message;
  if (!message) return;

  // "/start <link_code>" (also "/start@botname <code>") delivered into the
  // group by the startgroup deep link — binds the chat to the integration.
  if (message.text && /^\/start(@\w+)?(\s|$)/.test(message.text) && message.chat.type !== 'private') {
    const code = message.text.split(/\s+/)[1];
    if (code) {
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('source', 'telegram')
        .filter('config->>link_code', 'eq', code)
        .maybeSingle();
      if (integration) {
        const { link_code: _l, ...rest } = integration.config || {};
        await supabase
          .from('integrations')
          .update({
            status: 'active',
            config: { ...rest, chat_id: message.chat.id, chat_title: message.chat.title },
          })
          .eq('id', integration.id);
        const { data: project } = await supabase
          .from('projects')
          .select('name')
          .eq('id', integration.project_id)
          .maybeSingle();
        await telegramApi(token, 'sendMessage', {
          chat_id: message.chat.id,
          text: t('telegram.botLinked', { project: project?.name || '' }),
        }).catch(() => {});
      }
    }
    return;
  }

  const integration = await findByChatId(message.chat.id);
  if (integration) {
    await recordTelegramMessage(integration, message);
  }
}
