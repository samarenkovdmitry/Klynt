import { NextRequest, NextResponse } from 'next/server';
import { SlackWebhookEvent, RawEvent } from '@/lib/types/events';

// Slack signing secret should be stored in environment variables
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SlackWebhookEvent;

    // Verify Slack signature (TODO: implement proper signature verification)
    // For now, we'll skip this in the prototype

    // Handle URL verification (Slack sends this when webhook is created)
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
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

    // Transform Slack event to RawEvent
    const rawEvent: Omit<RawEvent, 'id' | 'project_id' | 'created_at'> = {
      source: 'slack',
      source_event_id: slackEvent.ts,
      event_type: 'message',
      author_id: slackEvent.user,
      timestamp: new Date(parseFloat(slackEvent.ts) * 1000),
      content: slackEvent.text,
      metadata: {
        channel: slackEvent.channel,
        thread_ts: slackEvent.thread_ts,
        parent_user_id: slackEvent.parent_user_id,
        subtype: slackEvent.subtype,
        team_id: body.team_id,
        event_id: body.event_id,
      },
    };

    // TODO: Store raw event in database
    // For now, just log it
    console.log('Slack message received:', {
      user: slackEvent.user,
      text: slackEvent.text,
      channel: slackEvent.channel,
      timestamp: slackEvent.ts,
    });

    // Queue event for AI processing
    // TODO: Implement background job queue

    return NextResponse.json({ received: true, event_id: rawEvent.source_event_id });

  } catch (error) {
    console.error('Error processing Slack webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
