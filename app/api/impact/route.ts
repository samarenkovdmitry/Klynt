import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { ImpactError, loadImpactContext, listImpact, saveImpact, reviewImpact } from '@/lib/db/impact';
import { analyzeImpact } from '@/lib/ai/impact-analysis';
import { checkRateLimit } from '@/lib/rate-limit';
import { getLocale } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = Awaited<ReturnType<typeof loadImpactContext>>;

// Analysis runs automatically for the newest unanalyzed signal — asking the
// user to trigger a check would put the system's job on them. "Analyzed" is
// marked in rate_limit_hits so a check that found nothing is never re-run.
const analyzedKey = (projectId: string, candidateId: string) => `impact:analyzed:${projectId}:${candidateId}`;

async function autoAnalyze(context: Context, userId: string): Promise<boolean> {
  if (!context.signals.length) return false;
  const candidateIds = context.signals.map(s => s.candidateId);
  const [marks, recs] = await Promise.all([
    supabase.from('rate_limit_hits').select('key')
      .in('key', candidateIds.map(id => analyzedKey(context.projectId, id))),
    supabase.from('impact_recommendations').select('source_event_id')
      .eq('project_id', context.projectId).in('source_event_id', candidateIds),
  ]);
  const done = new Set((marks.data || []).map(r => r.key));
  const recEvents = new Set((recs.data || []).map(r => r.source_event_id));
  const pending = context.signals.find(s =>
    !done.has(analyzedKey(context.projectId, s.candidateId)) && !recEvents.has(s.candidateId));
  if (!pending) return false;

  const key = analyzedKey(context.projectId, pending.candidateId);
  // Claim the signal first so concurrent GETs don't run the same analysis twice.
  const claim = await supabase.from('rate_limit_hits').insert({ key });
  if (claim.error) return false;
  try {
    if (!(await checkRateLimit(`impact:${context.projectId}:${userId}`, 5, 60 * 60 * 1000))) {
      throw new ImpactError('rate_limited', 429);
    }
    const result = await analyzeImpact({
      sourceFactId: context.fact.id, event: pending,
      decisions: context.decisionsFor(pending.timestamp),
      asOf: new Date().toISOString(), locale: getLocale(),
    });
    // A decision may have changed during the LLM call. Do not save a stale suggestion.
    const fresh = await loadImpactContext(context.projectId, context.fact.id);
    const suggestions = result.suggestions.filter(s => {
      const target = fresh.facts.find(f => f.id === s.targetFactId);
      return target && fresh.revision(target) === s.revision;
    });
    await saveImpact(fresh, pending.candidateId, suggestions);
    return true;
  } catch (error) {
    // Release the claim so a later visit can retry — except on rate limit,
    // where retrying soon would just burn through the hourly budget.
    if (!(error instanceof ImpactError && error.code === 'rate_limited')) {
      await supabase.from('rate_limit_hits').delete().eq('key', key);
    }
    throw error;
  }
}

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

    if (request.method === 'GET') {
      let fresh = context;
      try {
        if (await autoAnalyze(context, user.id)) {
          fresh = await loadImpactContext(projectId, factId);
        }
      } catch (error) {
        // Auto-analysis is best-effort: a failed check must not break the drawer.
        console.warn('Auto impact analysis skipped:', error);
      }
      return NextResponse.json({
        signals: context.signals,
        recommendations: await listImpact(fresh),
      });
    }

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
      const eligible = decisions.length;
      const result = await analyzeImpact({
        sourceFactId: factId, event: signal, decisions,
        asOf: new Date().toISOString(), locale: getLocale(),
      });
      const checked = result.checked;
      const fresh = await loadImpactContext(projectId, factId);
      const suggestions = result.suggestions.filter(s => {
        const target = fresh.facts.find(f => f.id === s.targetFactId);
        return target && fresh.revision(target) === s.revision;
      });
      await saveImpact(fresh, body.eventId, suggestions);
      await supabase.from('rate_limit_hits').insert({ key: analyzedKey(projectId, body.eventId) });
      return NextResponse.json({ recommendations: await listImpact(fresh), checked, eligible });
    }

    if (typeof body.id !== 'string' || !uuid.test(body.id) ||
        !['reconsider', 'not_related'].includes(body.review)) throw new ImpactError('invalid_request');
    await reviewImpact(context, body.id, body.review, user.id);
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
