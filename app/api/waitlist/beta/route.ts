import { NextResponse } from 'next/server'
import {
  createServerSupabase,
  getSupabaseConfigError,
  isSupabaseConfigured,
} from '@/lib/supabase-server'
import { sendBetaConfirmationEmail } from '@/lib/send-waitlist-email'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    const configError = getSupabaseConfigError()
    console.error('[waitlist/beta]', configError)

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development' && configError
            ? configError
            : 'Waitlist is temporarily unavailable. Please try again later.',
      },
      { status: 503 }
    )
  }

  try {
    const body = (await req.json()) as { email?: string }
    const email = String(body.email ?? '').trim()

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()
    const { error } = await supabase.from('beta_signups').insert({
      email: email.toLowerCase(),
      status: 'pending',
    })

    if (error) {
      throw new Error(error.message)
    }

    // Signup succeeds even if the confirmation email fails
    try {
      await sendBetaConfirmationEmail(email)
    } catch (emailError) {
      console.error('[waitlist/beta] confirmation email failed:', emailError)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.'

    console.error('[waitlist/beta]', error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
