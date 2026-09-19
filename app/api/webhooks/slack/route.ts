import { NextRequest, NextResponse } from 'next/server';
import { SlackWebhookEvent } from '@/lib/types/events';
import { createRawEvent, getIntegrationByTeamId } from '@/lib/db/queries';

// Slack signing secret should be stored in environment variables
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

// TODO: Implement Slack request signature verification using SLACK_SIGNING_SECRET,
// X-Slack-Signature and X-Slack-Request-Timestamp. Skipped for the prototype.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SlackWebhookEvent;

    // Handle URL verification (Slack sends this when webhook is created)
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: (body as any).challenge });
    }

    // Extract the actual event
    const slackEvent = body.event;
    if (!slackEvent) {
      return NextResponse.json({ error: 'No event in payload' }, { status: 400 });
    }

    // Only process message events
    if (slackEvent.type !== 'message') {
      return NextResponse.json({ received: true });
    }

    // Skip bot messages and messages with subtypes we don't care about
    if (slackEvent.subtype === 'bot_message' || slackEvent.subtype === 'message_changed') {
      return NextResponse.json({ received: true });
    }

    // Find the integration by team ID
    const integration = await getIntegrationByTeamId(body.team_id);
    if (!integration) {
      console.error('No Slack integration found for team:', body.team_id);
      return NextResponse.json({ error: 'Integration not found' }, { status: 400 });
    }

    // If the user picked specific channels, ignore messages from the rest.
    // No selection (undefined) = legacy accept-all behavior.
    const channelIds: string[] | undefined = integration.config?.channel_ids;
    if (channelIds && !channelIds.includes(slackEvent.channel)) {
      return NextResponse.json({ received: true });
    }

    const projectId = integration.project_id;

    // Resolve the author's profile so the UI can show a name, not a U-id
    let author: { id: string; name: string; avatar_url?: string } | undefined;
    if (slackEvent.user) {
      const info = await fetch(
        `https://slack.com/api/users.info?user=${slackEvent.user}`,
        { headers: { Authorization: `Bearer ${integration.access_token_encrypted}` } },
      ).then(r => r.json()).catch(() => null);
      if (info?.ok && info.user) {
        const profile = info.user.profile || {};
        author = {
          id: slackEvent.user,
          name: profile.display_name || profile.real_name || info.user.real_name || slackEvent.user,
          avatar_url: profile.image_48 || profile.image_32,
        };
      }
    }

    // Transform Slack event to RawEvent
    const rawEventData = {
      project_id: projectId,
      source: 'slack' as const,
      source_event_id: slackEvent.ts,
      event_type: 'message' as const,
      author_id: slackEvent.user,
      timestamp: new Date(parseFloat(slackEvent.ts) * 1000).toISOString(),
      content: slackEvent.text,
      metadata: {
        channel: slackEvent.channel,
        thread_ts: slackEvent.thread_ts,
        parent_user_id: slackEvent.parent_user_id,
        subtype: slackEvent.subtype,
        team_id: body.team_id,
        event_id: body.event_id,
        ...(author ? { author } : {}),
      },
    };

    // Store raw event in database
    const rawEvent = await createRawEvent(rawEventData);

    console.log('Slack message received and stored:', {
      user: slackEvent.user,
      text: slackEvent.text,
      channel: slackEvent.channel,
      timestamp: slackEvent.ts,
      event_id: rawEvent.id,
    });

    // Queue event for AI processing
    // TODO: Implement background job queue
    // For now, events will be processed by a separate endpoint/cron job

    return NextResponse.json({ received: true, event_id: rawEvent.id });

  } catch (error) {
    console.error('Error processing Slack webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
