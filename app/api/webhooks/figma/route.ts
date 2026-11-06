import { NextRequest, NextResponse } from 'next/server';
import { FigmaWebhookEvent, EventType } from '@/lib/types/events';
import { createRawEvent, getIntegrationsByFileKey } from '@/lib/db/queries';
import { triggerEventProcessing } from '@/lib/trigger-processing';

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

    // The same Figma file may feed several projects — deliver to each
    const integrations = await getIntegrationsByFileKey(body.file_key, 'figma');
    if (integrations.length === 0) {
      console.error('No Figma integration found for file key:', body.file_key);
      return NextResponse.json({ error: 'Integration not found' }, { status: 400 });
    }

    const eventIds: string[] = [];
    for (const integration of integrations) {
      // Transform Figma event to RawEvent
      const rawEvent = await createRawEvent({
        project_id: integration.project_id,
        source: 'figma' as const,
        source_event_id: `${body.file_key}_${body.timestamp}`,
        event_type: mapFigmaEventType(body.event_type),
        author_id: extractAuthorId(body),
        timestamp: new Date(body.timestamp).toISOString(),
        content: extractContent(body),
        metadata: { ...body, ...(extractAuthor(body) ? { author: extractAuthor(body) } : {}) },
      });
      eventIds.push(rawEvent.id);
      triggerEventProcessing(integration.project_id, request);
    }

    console.log('Figma event stored for', eventIds.length, 'project(s):', eventIds);

    return NextResponse.json({ received: true, event_ids: eventIds });

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

function extractAuthor(event: FigmaWebhookEvent) {
  const user = event.comment?.user || event.version?.user;
  if (!user?.id) return undefined;
  return { id: user.id, name: user.handle || user.id, avatar_url: user.img_url || undefined };
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
  if (event.version) {
    const fileName = event.file_name || 'the file';
    return event.version.label
      ? `New version in ${fileName}: ${event.version.label}`
      : `New version saved in ${fileName}`;
  }
  return undefined;
}
