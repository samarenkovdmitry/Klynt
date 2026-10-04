import { CandidateEventType, Importance } from '@/lib/types/events';
import { getLLM, extractJson } from '@/lib/ai/llm';
import { interpretSystemPrompt, eventUserLabels } from '@/lib/ai/prompts';
import { getLocale } from '@/lib/market';

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
  const locale = getLocale();
  const systemPrompt = interpretSystemPrompt(locale);
  const userPrompt = buildPrompt(rawEvent, context, locale);

  try {
    const text = await getLLM().complete({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 1024,
      temperature: 0.3,
    });

    const interpretation = JSON.parse(extractJson(text)) as AIInterpretation;

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

function buildPrompt(rawEvent: EventInput, context?: any, locale: 'en' | 'ru' = 'en'): string {
  const L = eventUserLabels(locale);

  // Convert timestamp string to Date if needed
  const timestamp = typeof rawEvent.timestamp === 'string'
    ? new Date(rawEvent.timestamp)
    : rawEvent.timestamp;

  let prompt = `${L.analyze}\n\n`;
  prompt += `${L.source}: ${rawEvent.source}\n`;
  prompt += `${L.type}: ${rawEvent.event_type}\n`;
  prompt += `${L.timestamp}: ${timestamp.toISOString()}\n`;

  if (rawEvent.content) {
    prompt += `${L.content}: "${rawEvent.content}"\n`;
  }

  if (rawEvent.author_id) {
    prompt += `${L.author}: ${rawEvent.author_id}\n`;
  }

  // Include Figma/Slack metadata to improve subject/state extraction
  if (rawEvent.metadata?.file_name) {
    prompt += `${L.fileName}: ${rawEvent.metadata.file_name}\n`;
  }
  if (rawEvent.metadata?.description) {
    prompt += `${L.details}: ${rawEvent.metadata.description}\n`;
  }
  if (rawEvent.metadata?.channel) {
    prompt += `${L.channel}: ${rawEvent.metadata.channel}\n`;
  }

  // Add context if available
  if (context?.previousEvents && context.previousEvents.length > 0) {
    prompt += `\n${L.recentEvents}\n`;
    context.previousEvents.slice(-5).forEach((event: EventInput, i: number) => {
      prompt += `${i + 1}. ${event.source} - ${event.content || L.noContent}\n`;
    });
  }

  if (context?.threadContext && context.threadContext.length > 0) {
    prompt += `\n${L.threadContext}\n`;
    context.threadContext.forEach((event: EventInput, i: number) => {
      prompt += `${i + 1}. ${event.content || L.noContent}\n`;
    });
  }

  if (context?.projectFacts && context.projectFacts.length > 0) {
    prompt += `\n${L.currentFacts}\n`;
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
  const ru = getLocale() === 'ru';

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
      description: ru
        ? `Раньше было «${existingFact.current_state}», теперь «${newAction}» — противоречит более раннему решению.`
        : `Previously "${existingFact.current_state}" but now "${newAction}". This contradicts an earlier decision.`,
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
      description: ru
        ? `Новое событие предлагает «${newAction}», а текущее состояние — «${existingFact.current_state}»`
        : `New event suggests "${newAction}" but current state is "${existingFact.current_state}"`,
    });
  }

  return conflicts;
}
