import { getLLM, extractJson } from '@/lib/ai/llm';
import { summarySystemPrompt, summaryUserPrompt } from '@/lib/ai/prompts';

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
  const text = await getLLM().complete({
    system: summarySystemPrompt(),
    user: summaryUserPrompt(input),
    maxTokens: 1024,
    temperature: 0.3,
  });

  return JSON.parse(extractJson(text)) as ProjectSummary;
}
