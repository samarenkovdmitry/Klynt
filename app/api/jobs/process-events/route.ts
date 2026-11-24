import { NextRequest, NextResponse } from 'next/server';
import {
  getUnprocessedEvents,
  findFactForSubject,
  recordEntityAlias,
  listProjectFacts,
  markEventProcessed,
  createCandidateEvent,
  createProjectFact,
  updateProjectFact,
  createConflict,
  createFactHistory,
  getProject,
} from '@/lib/db/queries';
import { interpretEvent, interpretEventBatch, detectConflicts, canonicalState, type AIInterpretation } from '@/lib/ai/event-processor';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabase } from '@/lib/db/supabase';

// Events that should update project state
export const STATE_CHANGING_EVENTS = ['decision', 'approval', 'change', 'scope_change', 'commitment', 'request'];

// Minimum confidence to auto-confirm and update state
const CONFIDENCE_THRESHOLD = 0.65;

// An event that keeps failing interpretation is dead-lettered after this
// many attempts instead of looping forever.
const MAX_PROCESSING_ATTEMPTS = 5;

// A confirmed event that establishes a decisive state answers a pending
// dispute by itself — the evidence already contains the resolution.
const DECISIVE_STATES = new Set(['approved', 'removed']);

async function autoResolveOpenConflicts(
  projectId: string,
  factId: string,
  factSubject: string,
  eventId: string,
  action: string,
  flowed: boolean,
  reason: string,
) {
  // Fetch conflicts linked to the fact plus legacy unlinked ones; the latter
  // are matched by normalized subject, which drifts in casing between events.
  const { data: rows } = await supabase
    .from('conflicts')
    .select('id, new_event_id, previous_fact_id, subject')
    .eq('project_id', projectId)
    .eq('status', 'unresolved')
    .or(`previous_fact_id.eq.${factId},previous_fact_id.is.null`);
  const norm = (s: string) => (s || '').toLowerCase().trim();
  const open = (rows || []).filter(c =>
    c.previous_fact_id === factId || norm(c.subject) === norm(factSubject));
  if (!open.length) return 0;
  const { data: candidates } = await supabase
    .from('candidate_events')
    .select('id, action')
    .in('id', open.map(c => c.new_event_id).filter(Boolean));
  const proposed = new Map((candidates || []).map(c => [c.id, canonicalState(c.action || '')]));
  const eventAction = canonicalState(action);
  const ids = open
    .filter(c => c.new_event_id !== eventId &&
               (proposed.get(c.new_event_id) === eventAction ||
                (flowed && DECISIVE_STATES.has(eventAction))))
    .map(c => c.id);
  if (!ids.length) return 0;
  await supabase.from('conflicts')
    .update({
      status: 'resolved',
      resolution: `Resolved by new evidence: ${reason}`,
      resolved_at: new Date().toISOString(),
    })
    .in('id', ids);
  return ids.length;
}

// A threaded reply ("yes, let's do that") is meaningless without its parent.
// Pull earlier messages from the same thread into the interpretation context.
async function threadContextFor(projectId: string, event: any) {
  if (event.source === 'telegram') {
    const replyTo = event.metadata?.reply_to_message_id;
    if (!replyTo) return undefined;
    const { data } = await supabase
      .from('raw_events')
      .select('content, author_id, timestamp, source, event_type, metadata')
      .eq('project_id', projectId)
      .eq('source', 'telegram')
      .eq('source_event_id', String(replyTo))
      .limit(1);
    return data?.length ? data : undefined;
  }
  const threadTs = event.metadata?.thread_ts;
  if (!threadTs || event.source !== 'slack') return undefined;
  const { data } = await supabase
    .from('raw_events')
    .select('content, author_id, timestamp, source, event_type, metadata')
    .eq('project_id', projectId)
    .eq('source', 'slack')
    .or(`source_event_id.eq.${threadTs},metadata->>thread_ts.eq.${threadTs}`)
    .lt('timestamp', event.timestamp)
    .order('timestamp', { ascending: true })
    .limit(5);
  return data?.length ? data : undefined;
}

// Apply one confirmed candidate event to project facts: detect conflicts,
// update or create the fact, write history, auto-resolve open disputes.
// Shared by the batch loop and the manual "confirm pending" path — a human
// confirmation must land on exactly the same rules.
export async function applyCandidateToFacts(
  projectId: string,
  rawEvent: { id: string; timestamp: any },
  candidateEvent: { id: string; subject: string; action?: string; event_type: string; confidence: number },
  interpretation: AIInterpretation,
  projectFacts: any[],
): Promise<{ factsCreated: number; factsUpdated: number; conflictsDetected: number; conflictsResolved: number }> {
  const out = { factsCreated: 0, factsUpdated: 0, conflictsDetected: 0, conflictsResolved: 0 };
  const newState = interpretation.action || interpretation.event_type;
  const displayState = interpretation.display_state;
  const scope = interpretation.scope;
  const eventTimestamp = new Date(rawEvent.timestamp).toISOString();

  const existingFact = await findFactForSubject(projectId, interpretation.subject, 'design_component', projectFacts);
  if (existingFact) {
    await recordEntityAlias(projectId, existingFact.subject, interpretation.subject).catch(() => {});
  }

  if (existingFact) {
    // Don't overwrite with older events
    const existingTimestamp = existingFact.last_updated_at ? new Date(existingFact.last_updated_at).toISOString() : null;

    if (existingTimestamp && new Date(eventTimestamp) <= new Date(existingTimestamp)) {
      console.log(`Skipping older event for ${interpretation.subject}: ${eventTimestamp} <= ${existingTimestamp}`);
    } else {
      // Detect conflicts
      const conflicts = await detectConflicts(candidateEvent as any, existingFact);

      // A retry after a mid-run crash can reach this point again for the
      // same candidate — don't duplicate an already-open dispute.
      const { data: alreadyOpen } = await supabase
        .from('conflicts')
        .select('previous_fact_id, conflict_type')
        .eq('new_event_id', candidateEvent.id)
        .eq('status', 'unresolved');
      const have = new Set((alreadyOpen || []).map(c => `${c.previous_fact_id}:${c.conflict_type}`));

      for (const conflict of conflicts) {
        if (have.has(`${conflict.previous_fact_id}:${conflict.conflict_type}`)) continue;
        await createConflict({
          project_id: projectId,
          ...conflict,
        });
        out.conflictsDetected++;
      }

      if (conflicts.length === 0) {
        // Record history before updating
        await createFactHistory({
          fact_id: existingFact.id,
          project_id: projectId,
          previous_state: existingFact.current_state,
          new_state: newState,
          previous_value: existingFact.current_value,
          event_id: candidateEvent.id,
          decided_at: eventTimestamp,
          confidence: interpretation.confidence,
          reason: interpretation.reason,
          evidence: [rawEvent.id],
        });

        // Update existing fact with source event timestamp
        await updateProjectFact(existingFact.id, {
          current_state: newState,
          current_value: { ...(existingFact.current_value || {}), ...(displayState ? { display_state: displayState } : {}), ...(scope ? { scope } : {}) },
          confidence: interpretation.confidence,
          importance: interpretation.importance,
          evidence_summary: interpretation.reason,
          primary_event_id: candidateEvent.id,
          last_updated_at: eventTimestamp,
        });

        out.factsUpdated++;
        const idx = projectFacts.findIndex((f: any) => f.id === existingFact.id);
        const refreshed = { ...existingFact, current_state: newState, evidence_summary: interpretation.reason };
        if (idx >= 0) projectFacts[idx] = refreshed; else projectFacts.push(refreshed);
      }
      // else: a conflicting proposal does not overwrite the confirmed
      // state — it waits in conflicts for human resolution.

      // A newer confirmed event can itself answer a pending dispute:
      // close open conflicts whose proposed action it now establishes,
      // and — when it settled the subject without new conflicts — any
      // dispute it resolves decisively.
      out.conflictsResolved += await autoResolveOpenConflicts(
        projectId, existingFact.id, existingFact.subject, candidateEvent.id,
        interpretation.action || interpretation.event_type,
        conflicts.length === 0,
        interpretation.reason,
      );
    }
  } else {
    // Create new fact
    const newFact = await createProjectFact({
      project_id: projectId,
      subject: interpretation.subject,
      subject_type: 'design_component',
      fact_type: interpretation.event_type === 'decision' ? 'decision' : 'state',
      current_state: newState,
      current_value: { ...(displayState ? { display_state: displayState } : {}), ...(scope ? { scope } : {}) },
      confidence: interpretation.confidence,
      importance: interpretation.importance,
      evidence_summary: interpretation.reason,
      primary_event_id: candidateEvent.id,
      last_updated_at: eventTimestamp,
    });

    // Record initial history
    await createFactHistory({
      fact_id: newFact.id,
      project_id: projectId,
      new_state: newState,
      event_id: candidateEvent.id,
      decided_at: eventTimestamp,
      confidence: interpretation.confidence,
      reason: interpretation.reason,
      evidence: [rawEvent.id],
    });

    out.factsCreated++;
    projectFacts.push(newFact);
  }
  return out;
}

export async function processProjectEvents(projectId: string, interpret = interpretEvent) {
  const events = await getUnprocessedEvents(projectId, 50);
  const projectFacts = await listProjectFacts(projectId);

  const result = { processed: 0, factsCreated: 0, factsUpdated: 0, conflictsDetected: 0, conflictsResolved: 0 };
  if (events.length === 0) return result;

  console.log(`Processing ${events.length} unprocessed events for project ${projectId}`);

  let processedCount = 0;
  let factsCreated = 0;
  let factsUpdated = 0;
  let conflictsDetected = 0;
  let conflictsResolved = 0;

  // Thread context lookups are independent — prefetch them in parallel
  // before interpretation.
  const contexts = await Promise.all(events.map(async (event, i) => ({
    previousEvents: events.slice(Math.max(0, i - 5), i),
    projectFacts,
    threadContext: await threadContextFor(projectId, event),
  })));

  // The real interpreter batches several events per LLM call. An injected
  // interpreter (tests) keeps the simple per-event contract — either way
  // every slot below is an interpretation or an Error.
  let interpretations: (AIInterpretation | Error)[];
  if (interpret === interpretEvent) {
    interpretations = await interpretEventBatch(events, contexts, projectFacts);
  } else {
    interpretations = await Promise.all(events.map(async (event, i) => {
      try {
        return await interpret(event, contexts[i]);
      } catch (e) {
        return e instanceof Error ? e : new Error(String(e));
      }
    }));
  }

    for (const [i, event] of events.entries()) {
      try {
        const interpretation = interpretations[i];
        if (interpretation instanceof Error) throw interpretation;

        console.log(`AI interpretation for event ${event.id}:`, {
          event_type: interpretation.event_type,
          subject: interpretation.subject,
          action: interpretation.action,
          confidence: interpretation.confidence,
          importance: interpretation.importance,
        });

        // Create candidate event
        const candidateEvent = await createCandidateEvent({
          raw_event_id: event.id,
          project_id: projectId,
          event_type: interpretation.event_type,
          subject: interpretation.subject,
          action: interpretation.action,
          confidence: interpretation.confidence,
          importance: interpretation.importance,
          reason: interpretation.reason,
          related_entities: interpretation.related_entities,
          potential_impacts: interpretation.potential_impacts,
          status: interpretation.confidence > CONFIDENCE_THRESHOLD ? 'confirmed' : 'pending',
        });

        // Only high-confidence, state-changing events update project facts
        if (interpretation.confidence > CONFIDENCE_THRESHOLD && STATE_CHANGING_EVENTS.includes(interpretation.event_type)) {
          const applied = await applyCandidateToFacts(projectId, event, candidateEvent, interpretation, projectFacts);
          factsCreated += applied.factsCreated;
          factsUpdated += applied.factsUpdated;
          conflictsDetected += applied.conflictsDetected;
          conflictsResolved += applied.conflictsResolved;
        }

        await markEventProcessed(event.id);
        processedCount++;

      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        // Leave the event unprocessed so it is retried next run, but track
        // attempts and dead-letter a permanently failing event.
        const meta = typeof event.metadata === 'string' ? JSON.parse(event.metadata || '{}') : (event.metadata || {});
        const attempts = (meta.processing_attempts || 0) + 1;
        await supabase.from('raw_events').update({
          metadata: {
            ...meta,
            processing_attempts: attempts,
            processing_error: error instanceof Error ? error.message : String(error),
          },
        }).eq('id', event.id);
        if (attempts >= MAX_PROCESSING_ATTEMPTS) {
          console.error(`Dead-lettering event ${event.id} after ${attempts} attempts`);
          await markEventProcessed(event.id);
        }
      }
    }

    result.processed = processedCount;
    result.factsCreated = factsCreated;
    result.factsUpdated = factsUpdated;
    result.conflictsDetected = conflictsDetected;
    result.conflictsResolved = conflictsResolved;
    return result;
}

export async function POST(request: NextRequest) {
  try {
    const isCron = !!process.env.CRON_SECRET &&
      request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

    const body = await request.json().catch(() => ({}));

    let projectIds: string[];
    if (isCron) {
      // Cron mode: process the given project, or every project with pending events
      if (body.projectId) {
        projectIds = [body.projectId];
      } else {
        const { data } = await supabase
          .from('raw_events')
          .select('project_id')
          .is('processed_at', null);
        projectIds = [...new Set((data || []).map(r => r.project_id))];
      }
    } else {
      const { projectId } = body;
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }
      const user = await getSessionUser();
      if (!user) return unauthorizedResponse();
      const project = await getProject(projectId, user.id);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      projectIds = [projectId];
    }

    const totals = { processed: 0, factsCreated: 0, factsUpdated: 0, conflictsDetected: 0, conflictsResolved: 0 };
    for (const projectId of projectIds) {
      const r = await processProjectEvents(projectId);
      totals.processed += r.processed;
      totals.factsCreated += r.factsCreated;
      totals.factsUpdated += r.factsUpdated;
      totals.conflictsDetected += r.conflictsDetected;
      totals.conflictsResolved += r.conflictsResolved;
    }

    return NextResponse.json({ message: 'Events processed successfully', ...totals });
  } catch (error) {
    console.error('Error in process-events job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Vercel Cron invokes endpoints via GET — delegate to the same handler.
export { POST as GET };
