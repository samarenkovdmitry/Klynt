import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface SummaryInput {
  projectId: string;
  currentState: any[];
  recentEvents: any[];
  conflicts: any[];
  since?: string; // ISO date
}

export interface ProjectSummary {
  headline: string;
  bullets: string[];
  needsAttention: string[];
}

export async function generateProjectSummary(input: SummaryInput): Promise<ProjectSummary> {
  const prompt = buildSummaryPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    temperature: 0.3,
    system: 'You are a concise project assistant. Output strictly valid JSON. No markdown, no explanations.',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let text = content.text.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  text = text.trim();

  return JSON.parse(text) as ProjectSummary;
}

function buildSummaryPrompt(input: SummaryInput): string {
  const { currentState, recentEvents, conflicts } = input;

  const currentStateText = currentState.length === 0
    ? 'No current facts.'
    : currentState.map(f => `- ${f.subject}: ${f.current_state} (${Math.round(f.confidence * 100)}% confidence)`).join('\n');

  const recentEventsText = recentEvents.length === 0
    ? 'No recent events.'
    : recentEvents.slice(0, 15).map(e => {
        const date = new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `- [${date}] ${e.subject}: ${e.action || e.event_type} — ${e.reason}`;
      }).join('\n');

  const conflictsText = conflicts.length === 0
    ? 'No conflicts.'
    : conflicts.map(c => `- ${c.subject}: ${c.description}`).join('\n');

  return `Generate a concise "What Changed" summary for a project. The user wants to understand the project in 30 seconds.

Current Project State:
${currentStateText}

Recent Events:
${recentEventsText}

Conflicts / Needs Attention:
${conflictsText}

Return a JSON object with this structure:
{
  "headline": "One sentence summary of the most important thing",
  "bullets": ["3-5 bullet points about what changed, decided, or needs action"],
  "needsAttention": ["0-3 items that explicitly need user's attention"]
}

Rules:
- Headline: max 20 words, state the single most important takeaway
- Bullets: max 15 words each, focus on decisions and state changes
- needsAttention: only real conflicts or open questions
- Output only JSON, no markdown`;
}
