import { supabase } from '@/lib/db/supabase';
import { createRawEvent, updateIntegrationLastSync } from '@/lib/db/queries';
import { telegramApi, type TgMessage, type TgUpdate } from '@/lib/telegram/client';
import { decryptToken } from '@/lib/crypto';
import { isContentExcluded } from '@/lib/filters';

// Shared update handler used by both the webhook route and the getUpdates
// polling job (local dev / deployments without a public URL).
//
// Binding model (legacy per-project bots): an integration connects a bot
// token first; the first chat where the bot becomes a member is bound via
// config.chat_id. After that, only text messages from that chat produce
// raw_events.
export async function processTelegramUpdate(integration: any, update: TgUpdate): Promise<void> {
  const token = decryptToken(integration.access_token_encrypted);
  const chatId: number | undefined = integration.config?.chat_id;

  // Bot was added to (or removed from) a chat
  const memberUpdate = update.my_chat_member;
  if (memberUpdate) {
    const becameMember = ['member', 'administrator'].includes(memberUpdate.new_chat_member.status);
    const chat = memberUpdate.chat;

    if (becameMember && chat.type !== 'private' && !chatId) {
      await supabase
        .from('integrations')
        .update({
          status: 'active',
          config: { ...integration.config, chat_id: chat.id, chat_title: chat.title },
        })
        .eq('id', integration.id);
      await telegramApi(token, 'sendMessage', {
        chat_id: chat.id,
        text: 'Chat connected. New messages here will be tracked for the project.',
      }).catch(() => {});
    }
    return;
  }

  const message = update.message;
  if (!message) return;
  await recordTelegramMessage(integration, message);
}

// Stores a chat message as a raw_event. Shared by both the legacy per-bot
// path and the shared-app-bot path — the caller resolves which integration
// the message belongs to.
export async function recordTelegramMessage(integration: any, message: TgMessage): Promise<void> {
  const chatId: number | undefined = integration.config?.chat_id;
  if (!chatId || message.chat.id !== chatId) return;

  // Only new text messages from people — skip bots, service messages, media-only
  if (!message.text || message.from?.is_bot) return;
  if (message.text.startsWith('/')) return;

  // Privacy filter: keyword-denylisted messages are dropped before storage
  if (isContentExcluded(message.text, integration.config)) return;

  const authorName = message.from
    ? [message.from.first_name, message.from.last_name].filter(Boolean).join(' ')
    : undefined;

  await createRawEvent({
    project_id: integration.project_id,
    source: 'telegram',
    source_event_id: String(message.message_id),
    event_type: 'message',
    author_id: message.from ? String(message.from.id) : undefined,
    timestamp: new Date(message.date * 1000).toISOString(),
    content: message.text,
    metadata: {
      channel: integration.config?.chat_title || String(chatId),
      chat_id: chatId,
      message_thread_id: message.message_thread_id,
      telegram_username: message.from?.username,
      ...(authorName ? { author: { id: String(message.from!.id), name: authorName } } : {}),
    },
  });

  await updateIntegrationLastSync(integration.id);
}
