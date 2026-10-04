# Klynt Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users
4. Wait for project to be ready (~2 minutes)

### Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

### Apply Migrations
1. Go to SQL Editor in Supabase dashboard
2. Copy the content of `supabase/migrations/20260908_klynt_core_schema.sql`
3. Paste and run the SQL
4. Verify tables are created in Table Editor

### Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 2. Anthropic (Claude) Setup

### Get API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**Note:** We use Claude Haiku for event interpretation (cost-efficient, perfect for this use case).

## 3. Figma Integration

### Create Figma OAuth App
1. Go to [Figma Developer Portal](https://www.figma.com/developers)
2. Create new OAuth app
3. Configure:
   - Redirect URI: `https://your-domain.com/api/integrations/figma/callback`
   - Scopes: `file_comments:read`, `file_versions:read`
   - Get Client ID and Client Secret

### Environment Variables
```bash
FIGMA_CLIENT_ID=your-figma-client-id
FIGMA_CLIENT_SECRET=your-figma-client-secret
FIGMA_REDIRECT_URI=https://your-domain.com/api/integrations/figma/callback
```

### Webhook Setup
After OAuth is implemented, you'll need to:
1. Create webhooks via Figma API
2. Set webhook passcode in environment:
```bash
FIGMA_WEBHOOK_PASSCODE=your-secure-random-string
```

## 4. Slack Integration

### Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app → "From scratch"
3. Configure:
   - Redirect URI: `https://your-domain.com/api/integrations/slack/callback`
   - Scopes: `channels:history`, `groups:history`, `im:history`, `mpim:history`
   - Get Client ID and Client Secret

### Environment Variables
```bash
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_REDIRECT_URI=https://your-domain.com/api/integrations/slack/callback
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

## 5. Initial Test Project

### Create Test Project
You'll need to create a test project in the database. You can do this via:
1. Direct SQL in Supabase SQL Editor:
```sql
INSERT INTO projects (name, description)
VALUES ('Test Project', 'Initial test project for Klynt');
```

2. Or via API once we create the project management UI

### Set Default Project ID
```bash
DEFAULT_PROJECT_ID=uuid-from-above-insert
```

## 6. Testing the Pipeline

### Test Webhook Reception
1. Start dev server: `npm run dev`
2. Send test POST to webhook endpoints
3. Check Supabase raw_events table

### Test AI Processing
1. Call `/api/jobs/process-events` with project ID
2. Check candidate_events and project_facts tables
3. Verify AI interpretations

## Current Status

### ✅ Completed
- Database schema and migrations
- TypeScript types and database helpers
- Webhook endpoints (Figma + Slack)
- AI processing job endpoint
- Event storage in database

### 🚧 In Progress
- Supabase project setup (needs your action)
- OAuth flows (Figma + Slack)
- Background job queue
- Project management UI

### 📋 Next Steps
1. Set up Supabase project and apply migrations
2. Implement OAuth flows for Figma and Slack
3. Create project management UI
4. Test end-to-end pipeline with real data
