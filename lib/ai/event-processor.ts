import OpenAI from 'openai';
import { RawEvent, CandidateEvent, CandidateEventType, Importance } from '@/lib/types/events';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIInterpretation {
  event_type: CandidateEventType;
  subject: string;
  action?: string;
  confidence: number;
  importance: Importance;
  reason: string;
  related_entities: string[];
  potential_impacts: string[];
}

export async function interpretEvent(
  rawEvent: RawEvent,
  context?: {
    previousEvents?: RawEvent[];
    projectFacts?: any[];
    threadContext?: RawEvent[];
  }
): Promise<AIInterpretation> {
  const systemPrompt = `You are an AI assistant that interprets project communication events from tools like Figma and Slack. Your goal is to extract meaningful project information from raw events.

Analyze the event and determine:
1. event_type: One of: decision, request, discussion, approval, change, question, commitment, blocker, scope_change, idea
2. subject: The entity being discussed (e.g., "pricing section", "homepage hero", "mobile navigation")
3. action: What action is being taken (e.g., "add", "remove", "modify", "approve", "reject")
4. confidence: How confident you are in this interpretation (0.00 to 1.00)
5. importance: How impactful this event is: "low", "medium", or "high"
6. reason: Brief explanation of your interpretation
7. related_entities: Array of related project entities (e.g., ["homepage", "mobile", "pricing"])
8. potential_impacts: What parts of the project this might affect

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

Consider the context of who is speaking (if available):
- Client messages carry more weight for decisions/approvals
- Designer messages are typically about design changes
- Developer messages are about implementation

Return ONLY valid JSON with no additional text.`;

  const userPrompt = buildPrompt(rawEvent, context);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    const interpretation = JSON.parse(content) as AIInterpretation;

    // Validate and normalize the interpretation
    return {
      event_type: interpretation.event_type || 'discussion',
      subject: interpretation.subject || 'unknown',
      action: interpretation.action,
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

function buildPrompt(rawEvent: RawEvent, context?: any): string {
  let prompt = `Analyze this project event:\n\n`;
  prompt += `Source: ${rawEvent.source}\n`;
  prompt += `Type: ${rawEvent.event_type}\n`;
  prompt += `Timestamp: ${rawEvent.timestamp.toISOString()}\n`;

  if (rawEvent.content) {
    prompt += `Content: "${rawEvent.content}"\n`;
  }

  if (rawEvent.author_id) {
    prompt += `Author ID: ${rawEvent.author_id}\n`;
  }

  // Add context if available
  if (context?.previousEvents && context.previousEvents.length > 0) {
    prompt += `\nRecent events in this project:\n`;
    context.previousEvents.slice(-5).forEach((event: RawEvent, i: number) => {
      prompt += `${i + 1}. ${event.source} - ${event.content || '(no content)'}\n`;
    });
  }

  if (context?.threadContext && context.threadContext.length > 0) {
    prompt += `\nThread context:\n`;
    context.threadContext.forEach((event: RawEvent, i: number) => {
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
  newEvent: CandidateEvent,
  existingFacts: any[]
): Promise<any[]> {
  const conflicts: any[] = [];

  for (const fact of existingFacts) {
    // Check if the subject matches
    if (fact.subject.toLowerCase() === newEvent.subject.toLowerCase()) {
      // Check if there's a state change that might conflict
      if (fact.current_state !== newEvent.action && newEvent.confidence > 0.7) {
        conflicts.push({
          subject: fact.subject,
          conflict_type: 'state_change',
          previous_fact_id: fact.id,
          new_event_id: newEvent.id,
          description: `New event suggests "${newEvent.action}" but current state is "${fact.current_state}"`,
        });
      }
    }
  }

  return conflicts;
}
