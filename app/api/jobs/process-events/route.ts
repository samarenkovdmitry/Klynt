import { NextRequest, NextResponse } from 'next/server';
import {
  getUnprocessedEvents,
  markEventProcessed,
  createCandidateEvent,
  getProjectFact,
  createProjectFact,
  updateProjectFact,
  createConflict,
  createFactHistory,
  getProject,
} from '@/lib/db/queries';
import { interpretEvent, detectConflicts } from '@/lib/ai/event-processor';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

// Events that should update project state
const STATE_CHANGING_EVENTS = ['decision', 'approval', 'change', 'scope_change', 'commitment', 'request'];

// Minimum confidence to auto-confirm and update state
const CONFIDENCE_THRESHOLD = 0.65;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const events = await getUnprocessedEvents(projectId, 50);

    if (events.length === 0) {
      return NextResponse.json({ message: 'No unprocessed events', processed: 0 });
    }

    console.log(`Processing ${events.length} unprocessed events for project ${projectId}`);

    let processedCount = 0;
    let factsCreated = 0;
    let factsUpdated = 0;
    let conflictsDetected = 0;

    for (const event of events) {
      try {
        const interpretation = await interpretEvent(event);

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
          const newState = interpretation.action || interpretation.event_type;
          const displayState = interpretation.display_state;
          const eventTimestamp = typeof event.timestamp === 'string' ? new Date(event.timestamp).toISOString() : event.timestamp.toISOString();

          const existingFact = await getProjectFact(projectId, interpretation.subject, 'design_component');

          if (existingFact) {
            // Don't overwrite with older events
            const existingTimestamp = existingFact.last_updated_at ? new Date(existingFact.last_updated_at).toISOString() : null;

            if (existingTimestamp && new Date(eventTimestamp) <= new Date(existingTimestamp)) {
              console.log(`Skipping older event for ${interpretation.subject}: ${eventTimestamp} <= ${existingTimestamp}`);
            } else {
              // Detect conflicts
              const conflicts = await detectConflicts(candidateEvent, existingFact);

              for (const conflict of conflicts) {
                await createConflict({
                  project_id: projectId,
                  ...conflict,
                });
                conflictsDetected++;
              }

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
                evidence: [event.id],
              });

              // Update existing fact with source event timestamp
              await updateProjectFact(existingFact.id, {
                current_state: newState,
                current_value: { ...(existingFact.current_value || {}), ...(displayState ? { display_state: displayState } : {}) },
                confidence: interpretation.confidence,
                importance: interpretation.importance,
                evidence_summary: interpretation.reason,
                primary_event_id: candidateEvent.id,
                last_updated_at: eventTimestamp,
              });

              factsUpdated++;
            }
          } else {
            // Create new fact
            const newFact = await createProjectFact({
              project_id: projectId,
              subject: interpretation.subject,
              subject_type: 'design_component',
              fact_type: interpretation.event_type === 'decision' ? 'decision' : 'state',
              current_state: newState,
              current_value: displayState ? { display_state: displayState } : {},
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
              evidence: [event.id],
            });

            factsCreated++;
          }
        }

        await markEventProcessed(event.id);
        processedCount++;

      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Events processed successfully',
      processed: processedCount,
      factsCreated,
      factsUpdated,
      conflictsDetected,
    });

  } catch (error) {
    console.error('Error in process-events job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
