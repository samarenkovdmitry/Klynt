import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject } from '@/lib/db/queries';
import { ImpactError, loadImpactContext, listImpact, saveImpact, reviewImpact } from '@/lib/db/impact';
import { analyzeImpact } from '@/lib/ai/impact-analysis';
import { checkRateLimit } from '@/lib/rate-limit';
import { getLocale } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handle(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();
    if (process.env.NEXT_PUBLIC_IMPACT_ANALYSIS_ENABLED !== 'true') {
      return NextResponse.json({ error: 'unavailable' }, { status: 404 });
    }
    const params = request.nextUrl.searchParams;
    const projectId = params.get('projectId') || '';
    const factId = params.get('factId') || '';
    if (!uuid.test(projectId) || !uuid.test(factId)) throw new ImpactError('invalid_request');
    if (!(await getProject(projectId, user.id))) throw new ImpactError('not_found', 404);
    const context = await loadImpactContext(projectId, factId);
    let checked: number | undefined;
    let eligible: number | undefined;
    if (request.method !== 'GET') {
      const body = await request.json();
      if (request.method === 'POST') {
        if (typeof body.eventId !== 'string' || !uuid.test(body.eventId)) throw new ImpactError('invalid_request');
        const signal = context.signals.find(s => s.candidateId === body.eventId);
        if (!signal) throw new ImpactError('not_found', 404);
        // Probe storage before spending tokens. The migration must be applied.
        await listImpact(context);
        if (!(await checkRateLimit(`impact:${projectId}:${user.id}`, 5, 60 * 60 * 1000))) {
          throw new ImpactError('rate_limited', 429);
        }
        const decisions = context.decisionsFor(signal.timestamp);
        eligible = decisions.length;
        const result = await analyzeImpact({
          sourceFactId: factId, event: signal, decisions,
          asOf: new Date().toISOString(), locale: getLocale(),
        });
        checked = result.checked;
        // A decision may have changed during the LLM call. Do not save a stale suggestion.
        const fresh = await loadImpactContext(projectId, factId);
        const suggestions = result.suggestions.filter(s => {
          const target = fresh.facts.find(f => f.id === s.targetFactId);
          return target && fresh.revision(target) === s.revision;
        });
        await saveImpact(fresh, body.eventId, suggestions);
        return NextResponse.json({ recommendations: await listImpact(fresh), checked, eligible });
      }
      if (typeof body.id !== 'string' || !uuid.test(body.id) ||
          !['reconsider', 'not_related'].includes(body.review)) throw new ImpactError('invalid_request');
      await reviewImpact(context, body.id, body.review, user.id);
    }
    return NextResponse.json({
      signals: context.signals,
      recommendations: await listImpact(context),
    });
  } catch (error) {
    if (error instanceof ImpactError) return NextResponse.json({ error: error.code }, { status: error.status });
    console.error('Impact analysis failed:', error);
    return NextResponse.json({ error: 'analysis_failed' }, { status: 503 });
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
