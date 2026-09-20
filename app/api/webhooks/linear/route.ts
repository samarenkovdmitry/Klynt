import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createRawEvent, getIntegrationByLinearOrg, updateIntegrationLastSync } from '@/lib/db/queries';
import { decryptToken } from '@/lib/crypto';

// Linear-Signature: hex HMAC-SHA256 of the raw body with the webhook secret
// generated when the webhook was created.
function verifyLinearSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function personName(p: any): string | undefined {
  return p?.displayName || p?.name || undefined;
}

// Map which fields changed (payload.updatedFrom keys) to readable phrases.
function describeIssueChanges(data: any, updatedFrom: Record<string, any>): string[] {
  const out: string[] = [];
  for (const key of Object.keys(updatedFrom)) {
    switch (key) {
      case 'stateId':
        if (data.state?.name) out.push(`moved to ${data.state.name}`);
        break;
      case 'assigneeId':
        out.push(data.assignee ? `assigned to ${personName(data.assignee)}` : 'unassigned');
        break;
      case 'title':
        out.push(`renamed to "${data.title}"`);
        break;
      case 'priority':
        out.push(`priority set to ${data.priorityLabel || data.priority}`);
        break;
      case 'description':
        out.push('description updated');
        break;
      case 'labelIds':
        out.push('labels updated');
        break;
      case 'projectId':
        out.push(data.project ? `moved to project ${data.project.name}` : 'removed from project');
        break;
      case 'cycleId':
        out.push(data.cycle ? `added to cycle ${data.cycle.name || data.cycle.number}` : 'removed from cycle');
        break;
      case 'teamId':
        if (data.team?.name) out.push(`moved to team ${data.team.name}`);
        break;
      case 'dueDate':
        out.push(data.dueDate ? `due date set to ${data.dueDate}` : 'due date removed');
        break;
      case 'estimate':
        out.push('estimate updated');
        break;
      case 'parentId':
        out.push('moved under a different parent issue');
        break;
      case 'completedAt':
        out.push('completed');
        break;
      case 'canceledAt':
        out.push('canceled');
        break;
      case 'startedAt':
        out.push('started');
        break;
      case 'archivedAt':
        out.push(data.archivedAt ? 'archived' : 'unarchived');
        break;
      case 'trashed':
        out.push(data.trashed ? 'moved to trash' : 'restored from trash');
        break;
      default:
        break;
    }
  }
  return out;
}

function buildEventContent(type: string, action: string, data: any, updatedFrom: any): string | null {
  if (type === 'Issue') {
    const id = data.identifier || data.id;
    if (action === 'create') {
      return `New issue ${id}: ${data.title}${data.state?.name ? ` [${data.state.name}]` : ''}`;
    }
    if (action === 'remove') {
      return `${id} deleted`;
    }
    const changes = describeIssueChanges(data, updatedFrom || {});
    return changes.length ? `${id}: ${changes.join(', ')}` : null;
  }

  if (type === 'Comment') {
    if (action !== 'create') return null;
    const issueId = data.issue?.identifier || 'issue';
    const body = (data.body || '').trim();
    return body ? `Comment on ${issueId}: ${body}` : `Comment on ${issueId}`;
  }

  if (type === 'Project') {
    const name = data.name || 'Project';
    if (action === 'create') return `New project in Linear: ${name}`;
    if (action === 'remove') return `${name} deleted`;
    const changes = describeIssueChanges(data, updatedFrom || {});
    return changes.length ? `${name}: ${changes.join(', ')}` : null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const { type, action, data, organizationId, webhookId, webhookTimestamp, updatedFrom } = body;
    if (!type || !action || !data) {
      return NextResponse.json({ received: true });
    }

    // Route to the owning project by Linear org id
    const integration = await getIntegrationByLinearOrg(organizationId);
    if (!integration) {
      console.error('No Linear integration found for organization:', organizationId);
      return NextResponse.json({ error: 'Integration not found' }, { status: 400 });
    }

    // Ignore deliveries from other webhooks pointed at this org
    if (integration.config?.webhook_id && webhookId !== integration.config.webhook_id) {
      return NextResponse.json({ received: true });
    }

    const secret = integration.config?.webhook_secret
      ? decryptToken(integration.config.webhook_secret)
      : '';
    const signature = request.headers.get('linear-signature');
    if (!verifyLinearSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (!['Issue', 'Comment', 'Project'].includes(type)) {
      return NextResponse.json({ received: true });
    }

    const content = buildEventContent(type, action, data, updatedFrom);
    if (!content) {
      return NextResponse.json({ received: true });
    }

    const author =
      personName(data.creator) ||
      personName(data.user) ||
      personName(data.assignee);

    const rawEvent = await createRawEvent({
      project_id: integration.project_id,
      source: 'linear' as const,
      source_event_id: `${data.id}:${webhookTimestamp}`,
      event_type: type === 'Comment' ? 'issue_comment' : 'issue',
      author_id: data.creator?.id || data.user?.id || data.assignee?.id,
      timestamp: new Date(webhookTimestamp || data.updatedAt || Date.now()).toISOString(),
      content,
      metadata: {
        type,
        action,
        identifier: data.identifier,
        title: data.title || data.issue?.title,
        state: data.state?.name,
        team: data.team?.name,
        url: data.url,
        updated_from: updatedFrom,
        organization_id: organizationId,
        webhook_id: webhookId,
        ...(author ? { author: { name: author, id: data.creator?.id || data.user?.id || data.assignee?.id } } : {}),
      },
    });

    await updateIntegrationLastSync(integration.id);

    console.log('Linear event stored:', {
      type,
      action,
      identifier: data.identifier,
      content,
      event_id: rawEvent.id,
    });

    return NextResponse.json({ received: true, event_id: rawEvent.id });
  } catch (error) {
    console.error('Error processing Linear webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
