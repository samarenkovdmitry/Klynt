import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { sendConfirmEmail } from '@/lib/send-confirm-email';
import { getSiteUrl } from '@/lib/site';
import { checkRateLimit } from '@/lib/rate-limit';
import { t } from '@/lib/i18n';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/auth/register — creates an unconfirmed user via the admin API,
// generates a signup confirmation link and sends OUR branded email (Resend).
// The client-side supabase.auth.signUp path is bypassed so the stock
// Supabase "Confirm your email" template is never sent.
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!(await checkRateLimit(`register:${ip}`, 5, 60_000))) {
      return NextResponse.json({ error: t('auth.tooManyAttempts') }, { status: 429 });
    }

    const { email: rawEmail, password, next: rawNext } = await request.json();
    const email = String(rawEmail || '').trim().toLowerCase();
    const next =
      typeof rawNext === 'string' && rawNext.startsWith('/') && !rawNext.startsWith('//')
        ? rawNext
        : '/project';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: t('auth.invalidEmail') }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: t('auth.passwordTooShort') }, { status: 400 });
    }

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });
    if (createError) {
      if (createError.message?.toLowerCase().includes('already')) {
        return NextResponse.json({ error: t('auth.alreadyRegistered') }, { status: 409 });
      }
      throw createError;
    }

    const siteUrl = getSiteUrl();
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { redirectTo: `${siteUrl}${next}` },
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError || new Error('Failed to generate confirmation link');
    }

    const confirmUrl = `${siteUrl}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=signup&next=${encodeURIComponent(next)}`;

    try {
      await sendConfirmEmail(email, confirmUrl);
    } catch (emailError) {
      console.error('[register] confirmation email failed:', emailError);
      return NextResponse.json({ error: t('auth.emailSendFailed') }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
