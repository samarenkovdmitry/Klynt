import { NextRequest, NextResponse } from 'next/server';
import { getIntegration, getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { decryptToken } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { projectId, fileKey, webhookUrl: requestedWebhookUrl } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get Figma integration
    const integration = await getIntegration(projectId, 'figma');
    if (!integration) {
      return NextResponse.json({ error: 'Figma integration not found' }, { status: 404 });
    }

    // Get access token (for now, assuming it's stored in plain text - should be encrypted in production)
    const accessToken = decryptToken(integration.access_token_encrypted);

    // Determine webhook endpoint URL (body override, env, then default)
    const defaultWebhookUrl = process.env.NODE_ENV === 'production'
      ? 'https://klynt.one/api/webhooks/figma'
      : 'http://localhost:3002/api/webhooks/figma';
    const webhookUrl = requestedWebhookUrl || process.env.FIGMA_WEBHOOK_URL || defaultWebhookUrl;

    const passcode = process.env.FIGMA_WEBHOOK_PASSCODE;

    if (!passcode) {
      return NextResponse.json({ error: 'FIGMA_WEBHOOK_PASSCODE not configured' }, { status: 500 });
    }

    // Create webhook for FILE_COMMENT events
    const webhookResponse = await fetch('https://api.figma.com/v2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'FILE_COMMENT',
        endpoint: webhookUrl,
        passcode,
        description: 'Klynt Figma integration',
        context: 'file',
        context_id: fileKey || null, // If no fileKey provided, Figma may reject
      }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Figma webhook creation failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to create webhook', details: errorText },
        { status: webhookResponse.status }
      );
    }

    const webhookData = await webhookResponse.json();

    // Also create webhook for FILE_VERSION_UPDATE
    const versionWebhookResponse = await fetch('https://api.figma.com/v2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'FILE_VERSION_UPDATE',
        endpoint: webhookUrl,
        passcode,
        description: 'Klynt Figma version tracking',
        context: 'file',
        context_id: fileKey || null,
      }),
    });

    const versionWebhookData = versionWebhookResponse.ok ? await versionWebhookResponse.json() : null;

    // Store file_key in integration config so webhook handler can map file_key → project
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        config: {
          ...integration.config,
          file_key: fileKey,
          comment_webhook_id: webhookData.id,
          version_webhook_id: versionWebhookData?.id,
        },
      })
      .eq('id', integration.id);

    if (updateError) {
      console.error('Failed to update integration config:', updateError);
    }

    console.log('Figma webhooks created successfully');

    return NextResponse.json({
      success: true,
      commentWebhook: webhookData,
      versionWebhook: versionWebhookData,
    });

  } catch (error) {
    console.error('Error creating Figma webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
