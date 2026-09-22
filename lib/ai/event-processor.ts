import Anthropic from '@anthropic-ai/sdk';
import { CandidateEventType, Importance } from '@/lib/types/events';

// Minimal shape the processor needs — callers pass DB rows whose
// enums/timestamps are looser than the domain types in lib/types/events.
export interface EventInput {
  source: string;
  event_type: string;
  timestamp: string | Date;
  content?: string;
  author_id?: string;
  metadata?: Record<string, any>;
}

export interface ConflictEventInput {
  id: string;
  event_type: string;
  action?: string;
  subject: string;
  confidence: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIInterpretation {
  event_type: CandidateEventType;
  subject: string;
  action?: string;
  display_state?: string;
  confidence: number;
  importance: Importance;
  reason: string;
  related_entities: string[];
  potential_impacts: string[];
}

export async function interpretEvent(
  rawEvent: EventInput,
  context?: {
    previousEvents?: EventInput[];
    projectFacts?: any[];
    threadContext?: EventInput[];
  }
): Promise<AIInterpretation> {
  const systemPrompt = `You are an AI assistant that interprets project communication events from tools like Figma and Slack. Your goal is to extract meaningful project information from raw events.

Analyze the event and determine:
1. event_type: One of: decision, request, discussion, approval, change, question, commitment, blocker, scope_change, idea
2. subject: The entity being discussed (e.g., "pricing section", "homepage hero", "mobile navigation")
3. action: The machine state this event represents. One of: add, remove, modify, approve, reject, in_progress, undecided. Keep it short and stable.
4. display_state: A short, human-readable status that answers "what is happening with this right now?" (2-5 words). Examples: "Approved", "Needs mobile review", "Decision pending", "Waiting for legal review", "New", "Removed"
5. confidence: How confident you are in this interpretation (0.00 to 1.00)
6. importance: How impactful this event is: "low", "medium", or "high"
7. reason: A short title for this event (max 12 words) that restates what the message says or proposes. It is shown as the one-line title in the UI.
8. related_entities: Array of related project entities (e.g., ["homepage", "mobile", "pricing"])
9. potential_impacts: What parts of the project this might affect

Guidelines for display_state:
- It should describe the current situation, not the action to take.
- Use specific, plain language.
- If approved, say "Approved".
- If a decision is not yet made, say "Decision pending".
- If something is blocked by a specific review, say "Waiting for ... review".
- If something is being modified or needs work, say "Needs ... review".

Guidelines:
- "decision": Clear resolution or agreement on something
- "request": Someone asking for something to be done
- "discussion": General conversation without clear resolution
- "approval": Explicit confirmation or sign-off
- "change": Something is being modified
- "question": Something that needs an answer
- "commitment": Promise to do something by a certain time
- "blocker": Something preventing progress
- "scope_change": Addition/removal that affects project scope
- "idea": Suggestion not yet decided

Guidelines for reason:
- Write a declarative title, never copy the message verbatim. Rephrase into a statement:
  "Do we need dark mode for a marketing site?" → "Dark mode questioned for marketing site"
  "Can someone review the hero?" → "Hero review requested"
  "walk faster" → "Request to speed up the pace"
  "you design soo good" → "Compliment on design work"
- The title should read as what happened, not what was said — the UI shows the original message separately.
- Describe the content, never your uncertainty. Do NOT write meta-commentary such as "ambiguous message", "lacks context", "low confidence", "interpretation is uncertain", or "could refer to".
- Keep it under 12 words so it reads as a title, not a paragraph.

Consider the context of who is speaking (if available):
- Client messages carry more weight for decisions/approvals
- Designer messages are typically about design changes
- Developer messages are about implementation

For Figma version updates, use the file name from metadata as the subject and treat the action as 'modify' unless it is the very first version of a new file.

Return ONLY valid JSON with no additional text.`;

  const userPrompt = buildPrompt(rawEvent, context);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Using Haiku for cost efficiency
      max_tokens: 1024,
      system: [
        { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
      ],
      messages: [
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Clean up response - Claude may wrap JSON in markdown code blocks
    let text = content.text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    text = text.trim();

    const interpretation = JSON.parse(text) as AIInterpretation;

    // Validate and normalize the interpretation
    return {
      event_type: interpretation.event_type || 'discussion',
      subject: interpretation.subject || 'unknown',
      action: interpretation.action,
      display_state: interpretation.display_state,
      confidence: Math.min(Math.max(interpretation.confidence, 0), 1),
      importance: interpretation.importance || 'medium',
      reason: interpretation.reason || '',
      related_entities: interpretation.related_entities || [],
      potential_impacts: interpretation.potential_impacts || [],
    };
  } catch (error) {
    console.error('Error interpreting event:', error);
    // Return a safe default interpretation
    return {
      event_type: 'discussion',
      subject: 'unknown',
      confidence: 0.3,
      importance: 'low',
      reason: 'AI interpretation failed',
      related_entities: [],
      potential_impacts: [],
    };
  }
}

function buildPrompt(rawEvent: EventInput, context?: any): string {
  // Convert timestamp string to Date if needed
  const timestamp = typeof rawEvent.timestamp === 'string'
    ? new Date(rawEvent.timestamp)
    : rawEvent.timestamp;

  let prompt = `Analyze this project event:\n\n`;
  prompt += `Source: ${rawEvent.source}\n`;
  prompt += `Type: ${rawEvent.event_type}\n`;
  prompt += `Timestamp: ${timestamp.toISOString()}\n`;

  if (rawEvent.content) {
    prompt += `Content: "${rawEvent.content}"\n`;
  }

  if (rawEvent.author_id) {
    prompt += `Author: ${rawEvent.author_id}\n`;
  }

  // Include Figma/Slack metadata to improve subject/state extraction
  if (rawEvent.metadata?.file_name) {
    prompt += `File name: ${rawEvent.metadata.file_name}\n`;
  }
  if (rawEvent.metadata?.description) {
    prompt += `Details: ${rawEvent.metadata.description}\n`;
  }
  if (rawEvent.metadata?.channel) {
    prompt += `Channel: ${rawEvent.metadata.channel}\n`;
  }

  // Add context if available
  if (context?.previousEvents && context.previousEvents.length > 0) {
    prompt += `\nRecent events in this project:\n`;
    context.previousEvents.slice(-5).forEach((event: EventInput, i: number) => {
      prompt += `${i + 1}. ${event.source} - ${event.content || '(no content)'}\n`;
    });
  }

  if (context?.threadContext && context.threadContext.length > 0) {
    prompt += `\nThread context:\n`;
    context.threadContext.forEach((event: EventInput, i: number) => {
      prompt += `${i + 1}. ${event.content || '(no content)'}\n`;
    });
  }

  if (context?.projectFacts && context.projectFacts.length > 0) {
    prompt += `\nCurrent project facts:\n`;
    context.projectFacts.slice(0, 10).forEach((fact: any) => {
      prompt += `- ${fact.subject}: ${fact.current_state}\n`;
    });
  }

  return prompt;
}

export async function detectConflicts(
  newEvent: ConflictEventInput,
  existingFact: any
): Promise<any[]> {
  const conflicts: any[] = [];

  if (!existingFact) return conflicts;

  // Skip conflicts for non-state-changing events
  if (newEvent.event_type === 'discussion' || newEvent.event_type === 'question' || newEvent.event_type === 'idea') {
    return conflicts;
  }

  const newAction = (newEvent.action || newEvent.event_type).toLowerCase();
  const currentState = existingFact.current_state.toLowerCase();

  // If state is the same, no conflict
  if (newAction === currentState) return conflicts;

  // Define normal state flows that are not conflicts
  const nonConflictingFlows: Record<string, string[]> = {
    'modify': ['approve', 'review', 'in_progress'],
    'in progress': ['approve', 'review', 'modify'],
    'undecided': ['modify', 'remove', 'add', 'approve', 'in progress'],
    'add': ['modify', 'approve', 'review', 'in progress'],
    'remove': ['add', 'revert'],
  };

  // If the new action is a natural progression from current state, no conflict
  if (nonConflictingFlows[currentState]?.includes(newAction)) {
    return conflicts;
  }

  // Strong conflicts: removing or rejecting something already approved/confirmed
  const strongConflictingStates = ['approved', 'confirmed', 'done', 'completed'];
  if (strongConflictingStates.includes(currentState) && ['remove', 'reject', 'revert', 'cancel'].includes(newAction)) {
    conflicts.push({
      subject: newEvent.subject,
      conflict_type: 'contradiction',
      previous_fact_id: existingFact.id,
      new_event_id: newEvent.id,
      description: `Previously "${existingFact.current_state}" but now "${newAction}". This contradicts an earlier decision.`,
    });
    return conflicts;
  }

  // State change conflicts: any other significant state change with high confidence
  if (newEvent.confidence > 0.7) {
    conflicts.push({
      subject: newEvent.subject,
      conflict_type: 'state_change',
      previous_fact_id: existingFact.id,
      new_event_id: newEvent.id,
      description: `New event suggests "${newAction}" but current state is "${existingFact.current_state}"`,
    });
  }

  return conflicts;
}
