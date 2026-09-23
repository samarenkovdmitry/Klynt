import { NextResponse } from 'next/server'
import {
  getSupabaseConfigError,
  isSupabaseConfigured,
} from '@/lib/supabase-server'
import { supabase } from '@/lib/db/supabase'
import { sendBetaAccessEmail } from '@/lib/send-waitlist-email'
import { createDemoProject } from '@/lib/demo-project'
import { getSiteUrl } from '@/lib/site'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

async function findOrCreateUser(email: string): Promise<string> {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  })

  if (created?.user) return created.user.id

  if (!error?.message?.toLowerCase().includes('already')) {
    throw error || new Error('Failed to create user')
  }

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError
  const existing = users.find(u => u.email?.toLowerCase() === email)
  if (!existing) throw new Error('User exists but could not be found')
  return existing.id
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
    const email = String(body.email ?? '').trim().toLowerCase()

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      )
    }

    // Record the signup (idempotent)
    const { error: insertError } = await supabase.from('beta_signups').insert({
      email,
      status: 'invited',
    })
    if (insertError && insertError.code !== '23505') {
      throw new Error(insertError.message)
    }

    // Create the account and seed the sample project
    const userId = await findOrCreateUser(email)

    try {
      const { data: existingDemo } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', userId)
        .eq('is_demo', true)
        .limit(1)
        .maybeSingle()
      if (!existingDemo) {
        await createDemoProject(userId)
      }
    } catch (demoError) {
      console.error('[waitlist/beta] demo seed failed:', demoError)
    }

    // One-click sign-in link
    const siteUrl = getSiteUrl()
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/project` },
    })
    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError || new Error('Failed to generate sign-in link')
    }

    const accessUrl = `${siteUrl}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink&next=/project`

    // Signup succeeds even if the email fails — the account + demo exist
    try {
      await sendBetaAccessEmail(email, accessUrl)
    } catch (emailError) {
      console.error('[waitlist/beta] access email failed:', emailError)
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
