import { NextRequest, NextResponse } from 'next/server';
import { FigmaWebhookEvent, EventType } from '@/lib/types/events';
import { createRawEvent, getIntegrationByFileKey } from '@/lib/db/queries';

// Figma webhook passcode should be stored in environment variables
const FIGMA_WEBHOOK_PASSCODE = process.env.FIGMA_WEBHOOK_PASSCODE;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FigmaWebhookEvent;

    // Verify webhook passcode
    if (body.passcode !== FIGMA_WEBHOOK_PASSCODE) {
      console.error('Invalid Figma webhook passcode');
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 });
    }

    // Handle PING event (Figma sends this when webhook is created)
    if ((body as any).event_type === 'PING') {
      console.log('Figma webhook PING received');
      return NextResponse.json({ received: true });
    }

    // Find project by Figma file key via integration config
    const integration = await getIntegrationByFileKey(body.file_key, 'figma');
    if (!integration) {
      console.error('No Figma integration found for file key:', body.file_key);
      return NextResponse.json({ error: 'Integration not found' }, { status: 400 });
    }

    const projectId = integration.project_id;

    // Transform Figma event to RawEvent
    const rawEventData = {
      project_id: projectId,
      source: 'figma' as const,
      source_event_id: `${body.file_key}_${body.timestamp}`,
      event_type: mapFigmaEventType(body.event_type),
      author_id: extractAuthorId(body),
      timestamp: new Date(body.timestamp).toISOString(),
      content: extractContent(body),
      metadata: body,
    };

    // Store raw event in database
    const rawEvent = await createRawEvent(rawEventData);

    console.log('Figma event received and stored:', {
      type: body.event_type,
      file: body.file_name,
      timestamp: body.timestamp,
      event_id: rawEvent.id,
    });

    // Queue event for AI processing
    // TODO: Implement background job queue
    // For now, events will be processed by a separate endpoint/cron job

    return NextResponse.json({ received: true, event_id: rawEvent.id });

  } catch (error) {
    console.error('Error processing Figma webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapFigmaEventType(figmaType: string): EventType {
  const mapping: Record<string, EventType> = {
    'FILE_COMMENT': 'comment',
    'FILE_VERSION_UPDATE': 'file_version',
    'FILE_UPDATE': 'file_update',
    'LIBRARY_PUBLISH': 'file_update',
    'FILE_DELETE': 'file_update',
  };
  return mapping[figmaType] || 'file_update';
}

function extractAuthorId(event: FigmaWebhookEvent): string | undefined {
  if (event.comment?.user?.id) {
    return event.comment.user.id;
  }
  if (event.version?.user?.id) {
    return event.version.user.id;
  }
  return undefined;
}

function extractContent(event: FigmaWebhookEvent): string | undefined {
  if (event.comment?.text) {
    return event.comment.text;
  }
  if (event.version?.label) {
    return `Version: ${event.version.label}`;
  }
  return undefined;
}
