<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:klynt-verification -->
# Verification before every commit
- `npx tsc --noEmit` does NOT catch Next.js route-export constraints — route
  files may only export HTTP method handlers + config fields. Any exported
  helper from `app/**/route.ts` fails the production build silently at the
  typecheck step. Run `npm run build` before merging to main.
- `npm run test:scenarios` — pipeline scenario harness (needs .env.local).
- `npm run eval:interpret` / `eval:interpret --batch` — real-LLM eval.
<!-- END:klynt-verification -->
