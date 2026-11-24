// Pure routing for a Slack `message` event: which payloads carry meaning for
// the project record. Subtypes other than message_changed are system noise
// (joins, deletions, bot posts) or content-free wrappers — they must not
// become candidates. An edit carries a revised statement, so it is stored as
// its own event keyed to the edited message: "Friday" corrected to
// "next Friday" is exactly the kind of change the truth layer exists to catch.
export type SlackMessageResolution =
  | { kind: 'message'; text: string; ts: string; user?: string; threadTs?: string; channel?: string }
  | { kind: 'edit'; text: string; ts: string; editedTs: string; user?: string; threadTs?: string; channel?: string }
  | { kind: 'skip' };

export function resolveSlackMessageEvent(slackEvent: any, eventTs?: string): SlackMessageResolution {
  if (slackEvent.type !== 'message') return { kind: 'skip' };
  const edited = slackEvent.subtype === 'message_changed' ? slackEvent.message : null;
  if (slackEvent.subtype && !edited) return { kind: 'skip' };
  const text: string | undefined = edited?.text ?? slackEvent.text;
  if (!text) return { kind: 'skip' };
  if (edited) {
    return {
      kind: 'edit',
      text,
      ts: eventTs || slackEvent.ts,
      editedTs: edited.ts,
      user: edited.user ?? slackEvent.user,
      threadTs: edited.thread_ts ?? slackEvent.thread_ts,
      channel: slackEvent.channel,
    };
  }
  return {
    kind: 'message',
    text,
    ts: slackEvent.ts,
    user: slackEvent.user,
    threadTs: slackEvent.thread_ts,
    channel: slackEvent.channel,
  };
}
