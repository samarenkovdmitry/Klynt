export const MODELS = {
  extraction: "claude-haiku-4-5-20251001",
  narrative:  "claude-sonnet-4-6",
} as const;

export type ModelRole = keyof typeof MODELS;

export const COST_PER_1K = {
  extraction: { input: 0.00025, cachedInput: 0.00008, output: 0.00125 },
  narrative:  { input: 0.003,   cachedInput: 0.0003,  output: 0.015  },
} as const;

export function getModel(role: ModelRole): string {
  const envKey = role === "extraction" ? "EXTRACTION_MODEL" : "NARRATIVE_MODEL";
  return process.env[envKey] ?? MODELS[role];
}
