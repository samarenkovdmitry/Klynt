/**
 * Test script to demonstrate the event pipeline with MOCK AI responses
 * This simulates the flow: Raw Event → AI Interpretation → Candidate Event → Fact
 * Without making actual OpenAI API calls
 */

import { RawEvent, CandidateEvent, ProjectFact } from '../lib/types/events';

// Mock raw events simulating real project communication
const mockRawEvents: Omit<RawEvent, 'id' | 'project_id' | 'created_at'>[] = [
  {
    source: 'figma',
    source_event_id: 'figma_1',
    event_type: 'comment',
    author_id: 'user_designer',
    timestamp: new Date('2026-09-03T10:00:00Z'),
    content: 'I\'ve updated the pricing section based on client feedback',
    metadata: { file_name: 'Homepage', comment_id: '123' },
  },
  {
    source: 'slack',
    source_event_id: 'slack_1',
    event_type: 'message',
    author_id: 'user_client',
    timestamp: new Date('2026-09-03T14:30:00Z'),
    content: 'The pricing section looks great, let\'s move forward with this',
    metadata: { channel: 'project-acme', user: 'client_anna' },
  },
  {
    source: 'slack',
    source_event_id: 'slack_2',
    event_type: 'message',
    author_id: 'user_client',
    timestamp: new Date('2026-09-06T11:00:00Z'),
    content: 'Actually, let\'s remove the pricing section entirely. We decided to go with a different model',
    metadata: { channel: 'project-acme', user: 'client_anna' },
  },
  {
    source: 'figma',
    source_event_id: 'figma_2',
    event_type: 'comment',
    author_id: 'user_designer',
    timestamp: new Date('2026-09-06T15:00:00Z'),
    content: 'Are you sure about removing pricing? That was a key section in the original brief',
    metadata: { file_name: 'Homepage', comment_id: '124' },
  },
  {
    source: 'slack',
    source_event_id: 'slack_3',
    event_type: 'message',
    author_id: 'user_client',
    timestamp: new Date('2026-09-06T16:00:00Z'),
    content: 'Yes, confirmed. Remove pricing. We\'ll handle pricing discussions separately',
    metadata: { channel: 'project-acme', user: 'client_anna' },
  },
];

// Mock AI interpretation function (simulates OpenAI responses)
function mockInterpretEvent(rawEvent: RawEvent, context?: any): any {
  const content = rawEvent.content?.toLowerCase() || '';

  // Simple rule-based interpretation for demo
  if (content.includes('remove') || content.includes('delete')) {
    return {
      event_type: 'decision',
      subject: 'pricing section',
      action: 'remove',
      confidence: 0.9,
      importance: 'high',
      reason: 'Client explicitly requested removal',
      related_entities: ['homepage', 'pricing'],
      potential_impacts: ['homepage layout', 'mobile homepage'],
    };
  }

  if (content.includes('approved') || content.includes('looks great') || content.includes('move forward')) {
    return {
      event_type: 'approval',
      subject: 'pricing section',
      action: 'approve',
      confidence: 0.85,
      importance: 'high',
      reason: 'Client expressed approval',
      related_entities: ['homepage', 'pricing'],
      potential_impacts: ['development', 'handoff'],
    };
  }

  if (content.includes('updated') || content.includes('based on feedback')) {
    return {
      event_type: 'change',
      subject: 'pricing section',
      action: 'modify',
      confidence: 0.75,
      importance: 'medium',
      reason: 'Designer made updates based on feedback',
      related_entities: ['homepage', 'pricing'],
      potential_impacts: ['design', 'client review'],
    };
  }

  if (content.includes('sure') || content.includes('confirmed')) {
    return {
      event_type: 'decision',
      subject: 'pricing section',
      action: 'remove',
      confidence: 0.95,
      importance: 'high',
      reason: 'Client confirmed the decision',
      related_entities: ['homepage', 'pricing'],
      potential_impacts: ['homepage', 'mobile', 'development'],
    };
  }

  // Default
  return {
    event_type: 'discussion',
    subject: 'pricing section',
    confidence: 0.5,
    importance: 'low',
    reason: 'General discussion',
    related_entities: ['pricing'],
    potential_impacts: [],
  };
}

function detectConflicts(newEvent: CandidateEvent, existingFacts: ProjectFact[]): any[] {
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

async function runPipeline() {
  console.log('🚀 Starting Klynt Event Pipeline Test (Mock Mode)\n');
  console.log('='.repeat(60));

  const projectFacts: ProjectFact[] = [];
  const candidateEvents: CandidateEvent[] = [];

  for (let i = 0; i < mockRawEvents.length; i++) {
    const rawEvent = mockRawEvents[i] as RawEvent;
    console.log(`\n📥 Processing Event ${i + 1}/${mockRawEvents.length}`);
    console.log('-'.repeat(60));
    console.log(`Source: ${rawEvent.source}`);
    console.log(`Content: "${rawEvent.content}"`);
    console.log(`Timestamp: ${rawEvent.timestamp.toISOString()}`);

    // Mock AI Interpretation
    console.log('\n🤖 AI Interpretation (Mock)...');
    const interpretation = mockInterpretEvent(rawEvent, {
      previousEvents: mockRawEvents.slice(0, i),
      projectFacts,
    });

    console.log(`Event Type: ${interpretation.event_type}`);
    console.log(`Subject: ${interpretation.subject}`);
    console.log(`Action: ${interpretation.action || 'N/A'}`);
    console.log(`Confidence: ${(interpretation.confidence * 100).toFixed(0)}%`);
    console.log(`Importance: ${interpretation.importance}`);
    console.log(`Reason: ${interpretation.reason}`);
    console.log(`Related Entities: ${interpretation.related_entities.join(', ') || 'None'}`);

    // Create candidate event
    const candidateEvent: CandidateEvent = {
      id: `candidate_${i}`,
      raw_event_id: `raw_${i}`,
      project_id: 'test_project',
      ...interpretation,
      status: interpretation.confidence > 0.8 ? 'confirmed' : 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
    candidateEvents.push(candidateEvent);

    // Conflict detection
    if (projectFacts.length > 0) {
      console.log('\n⚠️  Checking for conflicts...');
      const conflicts = detectConflicts(candidateEvent, projectFacts);
      if (conflicts.length > 0) {
        console.log(`Found ${conflicts.length} conflict(s):`);
        conflicts.forEach(conflict => {
          console.log(`  - ${conflict.description}`);
        });
      } else {
        console.log('No conflicts detected');
      }
    }

    // Update project facts if high confidence
    if (interpretation.confidence > 0.8) {
      console.log('\n✅ Updating project facts...');
      const existingFact = projectFacts.find(
        f => f.subject.toLowerCase() === interpretation.subject.toLowerCase()
      );

      if (existingFact) {
        console.log(`Updating existing fact: ${existingFact.subject}`);
        console.log(`  Previous state: ${existingFact.current_state}`);
        console.log(`  New state: ${interpretation.action || interpretation.event_type}`);
        existingFact.current_state = interpretation.action || interpretation.event_type;
        existingFact.last_updated_at = new Date();
        existingFact.confidence = interpretation.confidence;
      } else {
        console.log(`Creating new fact: ${interpretation.subject}`);
        const newFact: ProjectFact = {
          id: `fact_${projectFacts.length}`,
          project_id: 'test_project',
          subject: interpretation.subject,
          subject_type: 'design_component',
          fact_type: interpretation.event_type === 'decision' ? 'decision' : 'state',
          current_state: interpretation.action || interpretation.event_type,
          confidence: interpretation.confidence,
          importance: interpretation.importance,
          last_updated_at: new Date(),
          evidence_summary: interpretation.reason,
          primary_event_id: candidateEvent.id,
          created_at: new Date(),
          updated_at: new Date(),
        };
        projectFacts.push(newFact);
      }
    } else {
      console.log('\n⏸️  Confidence too low to update facts (requires manual review)');
    }

    console.log('\n' + '='.repeat(60));
  }

  // Summary
  console.log('\n📊 Pipeline Summary');
  console.log('='.repeat(60));
  console.log(`Total Events Processed: ${mockRawEvents.length}`);
  console.log(`Candidate Events Created: ${candidateEvents.length}`);
  console.log(`Project Facts: ${projectFacts.length}`);

  console.log('\n🎯 Current Project State:');
  console.log('-'.repeat(60));
  projectFacts.forEach(fact => {
    console.log(`${fact.subject}: ${fact.current_state} (${(fact.confidence * 100).toFixed(0)}% confidence)`);
  });

  console.log('\n📋 Events Requiring Attention:');
  console.log('-'.repeat(60));
  const pendingEvents = candidateEvents.filter(e => e.status === 'pending');
  if (pendingEvents.length > 0) {
    pendingEvents.forEach(event => {
      console.log(`- ${event.subject}: ${event.event_type} (${(event.confidence * 100).toFixed(0)}% confidence)`);
    });
  } else {
    console.log('None');
  }

  console.log('\n📈 What Changed Analysis:');
  console.log('-'.repeat(60));
  console.log('Key insights from the timeline:');
  console.log('1. Pricing section was initially approved by client');
  console.log('2. Later, client requested removal of pricing section');
  console.log('3. Designer questioned the decision');
  console.log('4. Client confirmed removal decision');
  console.log('\n⚠️  Conflict detected: Pricing went from "approved" to "remove"');
  console.log('   This represents a scope change that should be documented.');

  console.log('\n✨ Test complete!');
  console.log('\n💡 This demonstrates the core Klynt value proposition:');
  console.log('   - Raw events from multiple sources are collected');
  console.log('   - AI interprets meaning and confidence');
  console.log('   - Conflicts are automatically detected');
  console.log('   - Current state is maintained with evidence');
  console.log('   - User can quickly understand "what changed"');
}

// Run the test
runPipeline().catch(console.error);
