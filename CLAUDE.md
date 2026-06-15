# Klynt — Claude Code Memory

## Stack
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 4
- Icons: Remix Icon
- Vercel (deploy, analytics, OG)
- Supabase (report storage)
- OpenAI gpt-4.1-nano (UX audit via screenshots)
- Puppeteer + @sparticuz/chromium (screenshot capture)
- Sharp (image processing)

## Key conventions
- App Router structure: app/ directory
- API routes are serverless (Next.js route handlers)
- Client-side caching via localStorage/sessionStorage
- All code in TypeScript, no JS files

## What NOT to touch
- Puppeteer/Chromium config — fragile on Vercel, don't refactor without asking
- OpenAI prompt structure — changes affect audit quality
- Supabase schema — confirm before any migrations

## Deploy
- Vercel, auto-deploy on main branch push
- Don't add server-only packages without checking Vercel compatibility

## Language
- Respond in Russian
- Code comments in English