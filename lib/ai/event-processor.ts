import { CandidateEventType, Importance } from '@/lib/types/events';
import { getLLM, extractJson } from '@/lib/ai/llm';
import { interpretSystemPrompt, interpretBatchSystemPrompt, eventUserLabels } from '@/lib/ai/prompts';

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
  scope?: string;
  confidence: number;
  importance: Importance;
  reason: string;
  related_entities: string[];
  potential_impacts: string[];
}

export interface EventContext {
  previousEvents?: EventInput[];
  projectFacts?: any[];
  threadContext?: EventInput[];
}

// One LLM interpretation payload → normalized domain shape. Throws on a
// malformed response so callers can fall back instead of storing garbage.
function normalizeInterpretation(raw: any): AIInterpretation {
  if (typeof raw?.confidence !== 'number' || Number.isNaN(raw.confidence)) {
    throw new Error('AI returned an invalid interpretation (missing confidence)');
  }
  return {
    event_type: raw.event_type || 'discussion',
    subject: raw.subject || 'unknown',
    action: raw.action,
    display_state: raw.display_state,
    scope: raw.scope,
    confidence: Math.min(Math.max(raw.confidence, 0), 1),
    importance: raw.importance || 'medium',
    reason: raw.reason || '',
    related_entities: raw.related_entities || [],
    potential_impacts: raw.potential_impacts || [],
  };
}

export async function interpretEvent(
  rawEvent: EventInput,
  context?: EventContext
): Promise<AIInterpretation> {
  const systemPrompt = interpretSystemPrompt();
  const userPrompt = buildPrompt(rawEvent, context);

  try {
    const text = await getLLM().complete({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 1024,
      temperature: 0.3,
    });

    const interpretation = JSON.parse(extractJson(text)) as AIInterpretation;
    return normalizeInterpretation(interpretation);
  } catch (error) {
    console.error('Error interpreting event:', error);
    // Do not fake an interpretation — the caller leaves the event
    // unprocessed so it is retried instead of silently dropped.
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Events per LLM call. Larger batches dilute per-event attention; smaller
// ones don't amortize the system prompt.
const INTERPRET_BATCH_SIZE = 6;

// Interpret a chronological run of events in one LLM call per chunk instead
// of one call per event — the system prompt and project-facts context are
// shared, so fixed prompt cost is amortized ~BATCH_SIZE×.
// Every slot resolves to an interpretation or an Error: a chunk that fails
// wholesale (or returns malformed/missing entries) falls back to per-event
// calls, and per-event failures are reported in their own slot.
export async function interpretEventBatch(
  events: EventInput[],
  contexts: EventContext[],
  projectFacts?: any[],
): Promise<(AIInterpretation | Error)[]> {
  const out: (AIInterpretation | Error)[] = new Array(events.length);

  for (let start = 0; start < events.length; start += INTERPRET_BATCH_SIZE) {
    const chunk = events.slice(start, start + INTERPRET_BATCH_SIZE);
    const ctxs = contexts.slice(start, start + INTERPRET_BATCH_SIZE);

    const fallback = async (k: number) => {
      try {
        out[start + k] = await interpretEvent(chunk[k], ctxs[k]);
      } catch (e) {
        out[start + k] = e instanceof Error ? e : new Error(String(e));
      }
    };

    try {
      const text = await getLLM().complete({
        system: interpretBatchSystemPrompt(),
        user: buildBatchPrompt(chunk, ctxs, projectFacts),
        maxTokens: 4096,
        temperature: 0.3,
      });
      const parsed = JSON.parse(extractJson(text));
      const arr: any[] = Array.isArray(parsed) ? parsed : [parsed];
      // Slot interpretations by their "event" index; position as a fallback
      // when the model omits the field.
      const byIndex = new Map<number, any>();
      arr.forEach((item, k) => {
        byIndex.set(typeof item?.event === 'number' ? item.event : k + 1, item);
      });
      for (let k = 0; k < chunk.length; k++) {
        const item = byIndex.get(k + 1);
        try {
          if (!item) throw new Error(`batch response missing event ${k + 1}`);
          out[start + k] = normalizeInterpretation(item);
        } catch {
          await fallback(k);
        }
      }
    } catch {
      for (let k = 0; k < chunk.length; k++) await fallback(k);
    }
  }
  return out;
}

function buildEventBlock(rawEvent: EventInput, L: ReturnType<typeof eventUserLabels>, threadContext?: EventInput[]): string {
  const timestamp = typeof rawEvent.timestamp === 'string'
    ? new Date(rawEvent.timestamp)
    : rawEvent.timestamp;

  let block = `${L.source}: ${rawEvent.source}\n`;
  block += `${L.type}: ${rawEvent.event_type}\n`;
  block += `${L.timestamp}: ${timestamp.toISOString()}\n`;
  if (rawEvent.content) block += `${L.content}: "${rawEvent.content}"\n`;
  if (rawEvent.author_id) block += `${L.author}: ${rawEvent.author_id}\n`;
  if (rawEvent.metadata?.file_name) block += `${L.fileName}: ${rawEvent.metadata.file_name}\n`;
  if (rawEvent.metadata?.description) block += `${L.details}: ${rawEvent.metadata.description}\n`;
  if (rawEvent.metadata?.channel) block += `${L.channel}: ${rawEvent.metadata.channel}\n`;
  if (threadContext && threadContext.length > 0) {
    block += `${L.threadContext}\n`;
    threadContext.forEach((event, i) => {
      block += `${i + 1}. ${event.content || L.noContent}\n`;
    });
  }
  return block;
}

// Batch prompt: shared project context once, then one numbered block per
// event carrying its own metadata and thread context.
function buildBatchPrompt(
  events: EventInput[],
  contexts: EventContext[],
  projectFacts: any[] | undefined,
): string {
  const L = eventUserLabels();
  let prompt = `${L.analyze}\n\n`;

  // The events before this batch are the conversation so far.
  const prior = contexts[0]?.previousEvents;
  if (prior && prior.length > 0) {
    prompt += `${L.recentEvents}\n`;
    prior.slice(-5).forEach((event, i) => {
      prompt += `${i + 1}. ${event.source} - ${event.content || L.noContent}\n`;
    });
    prompt += '\n';
  }

  if (projectFacts && projectFacts.length > 0) {
    prompt += `${L.currentFacts}\n`;
    projectFacts.slice(0, 10).forEach((fact: any) => {
      prompt += `- ${fact.subject}: ${fact.current_state}\n`;
    });
  }

  events.forEach((event, i) => {
    prompt += `\n--- Event ${i + 1} ---\n`;
    prompt += buildEventBlock(event, L, contexts[i]?.threadContext);
  });

  return prompt;
}

function buildPrompt(rawEvent: EventInput, context?: any): string {
  const L = eventUserLabels();

  let prompt = `${L.analyze}\n\n`;
  prompt += buildEventBlock(rawEvent, L, context?.threadContext);

  // Add context if available
  if (context?.previousEvents && context.previousEvents.length > 0) {
    prompt += `\n${L.recentEvents}\n`;
    context.previousEvents.slice(-5).forEach((event: EventInput, i: number) => {
      prompt += `${i + 1}. ${event.source} - ${event.content || L.noContent}\n`;
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

// Actions and stored states drift apart in spelling ("approve" vs "approved",
// "remove" vs "out of scope", "in_progress" vs "in progress") — compare
// canonical groups, not surface forms.
const STATE_GROUPS: Record<string, string> = {
  approve: 'approved', approved: 'approved', confirm: 'approved', confirmed: 'approved',
  done: 'approved', completed: 'approved',
  remove: 'removed', removed: 'removed', 'out of scope': 'removed',
  reject: 'removed', rejected: 'removed', revert: 'removed', cancel: 'removed', cancelled: 'removed',
  modify: 'modified', modified: 'modified', change: 'modified', changed: 'modified',
  add: 'added', added: 'added',
};

export function canonicalState(s: string): string {
  const n = s.toLowerCase().replace(/_/g, ' ').trim();
  return STATE_GROUPS[n] || n;
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

  // If state is the same, no conflict
  if (canonicalState(newEvent.action || newEvent.event_type) === canonicalState(existingFact.current_state)) return conflicts;

  const newAction = canonicalState(newEvent.action || newEvent.event_type);
  const currentState = canonicalState(existingFact.current_state);

  // Define normal state flows that are not conflicts. An approved state is
  // precious: only an established event (decision/approval/change) transitions
  // it quietly — a request or idea stays a flagged proposal.
  const nonConflictingFlows: Record<string, string[]> = {
    'modified': ['approved', 'review', 'in progress'],
    'in progress': ['approved', 'review', 'modified'],
    'undecided': ['modified', 'removed', 'added', 'approved', 'in progress'],
    'added': ['modified', 'approved', 'review', 'in progress'],
    'removed': ['added'],
    'approved': ['in progress', 'modified'],
  };

  const established = !['request', 'idea', 'question', 'discussion'].includes(newEvent.event_type);
  if (nonConflictingFlows[currentState]?.includes(newAction) &&
      (currentState !== 'approved' || established)) {
    return conflicts;
  }

  // Strong conflicts: removing or rejecting something already approved/confirmed
  if (currentState === 'approved' && newAction === 'removed') {
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
