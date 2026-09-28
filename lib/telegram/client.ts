// Minimal Telegram Bot API client — token passed explicitly because each
// integration has its own bot token (per-project bots, not one app bot).

const API_BASE = 'https://api.telegram.org';

export async function telegramApi<T = any>(
  token: string,
  method: string,
  params?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(`Telegram ${method} failed: ${data?.description || res.status}`);
  }
  return data.result as T;
}

export interface TgUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TgChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
}

export interface TgMessage {
  message_id: number;
  date: number; // unix seconds
  chat: TgChat;
  from?: TgUser;
  text?: string;
  message_thread_id?: number;
  sender_chat?: TgChat;
}

export interface TgChatMemberUpdated {
  chat: TgChat;
  from: TgUser;
  date: number;
  old_chat_member: { status: string };
  new_chat_member: { status: string; user: TgUser };
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  my_chat_member?: TgChatMemberUpdated;
}
