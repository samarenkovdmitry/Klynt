import { fetchRecentGapGroups } from "@/lib/reports-db";

const SIMILARITY_THRESHOLD = 0.5;
const REPEAT_FREQUENCY_THRESHOLD = 0.7;
const MIN_REPORTS_FOR_DETECTION = 5;

function normalizeGapText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = wordsA.size + wordsB.size - intersection;
  return intersection / union;
}

type GapCluster = {
  normalized: string;
  canonical: string;
  seenInReports: Set<number>;
};

function clusterGapTexts(allGroups: string[][]): GapCluster[] {
  const clusters: GapCluster[] = [];

  for (const [reportIndex, gaps] of allGroups.entries()) {
    const matchedClustersThisReport = new Set<number>();

    for (const gap of gaps) {
      const normalized = normalizeGapText(gap);
      if (!normalized) continue;

      let bestMatch = -1;
      let bestScore = SIMILARITY_THRESHOLD;

      for (const [clusterIndex, cluster] of clusters.entries()) {
        const score = jaccardSimilarity(normalized, cluster.normalized);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = clusterIndex;
        }
      }

      if (bestMatch >= 0) {
        if (!matchedClustersThisReport.has(bestMatch)) {
          clusters[bestMatch].seenInReports.add(reportIndex);
          matchedClustersThisReport.add(bestMatch);
        }
      } else {
        const newIndex = clusters.length;
        clusters.push({
          normalized,
          canonical: gap,
          seenInReports: new Set([reportIndex]),
        });
        matchedClustersThisReport.add(newIndex);
      }
    }
  }

  return clusters;
}

export async function logRepeatingGapPatterns(currentGaps: string[]): Promise<void> {
  try {
    const recentGroups = await fetchRecentGapGroups(10);

    if (recentGroups.length < MIN_REPORTS_FOR_DETECTION) {
      return;
    }

    const allGroups = [...recentGroups, currentGaps];
    const totalReports = allGroups.length;
    const threshold = Math.ceil(totalReports * REPEAT_FREQUENCY_THRESHOLD);

    const clusters = clusterGapTexts(allGroups);
    const repeating = clusters.filter((c) => c.seenInReports.size >= threshold);

    for (const cluster of repeating) {
      console.warn(
        `[checklist-quality] Repeating gap pattern in ${cluster.seenInReports.size}/${totalReports} recent reports: "${cluster.canonical}". ` +
          `Prompt may be templating instead of analyzing.`
      );
    }
  } catch (err) {
    console.error("[checklist-quality] Gap pattern check failed:", err);
  }
}
