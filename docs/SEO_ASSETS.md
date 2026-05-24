# SEO assets checklist

Built into the repo (no manual files required for a minimal launch):

| Asset | Location | Notes |
|-------|----------|--------|
| Open Graph image (1200×630) | `app/opengraph-image.tsx` | Generated at build/runtime via `next/og` |
| Twitter card image | `app/twitter-image.tsx` | Same as OG |
| Favicon | `app/icon.tsx` | Served at `/icon` |
| Apple touch icon | `app/apple-icon.tsx` | Served at `/apple-icon` |
| `robots.txt` | `app/robots.ts` | Disallows `/api/`, `/report/` |
| `sitemap.xml` | `app/sitemap.ts` | `/` and `/contact` only |
| Web manifest | `app/manifest.ts` | PWA-style metadata |
| JSON-LD | `components/landing-json-ld.tsx` | Organization, WebSite, SoftwareApplication |

## Environment

Set in production (Vercel, etc.):

```bash
NEXT_PUBLIC_SITE_URL=https://klynt.one
```

Without it, the app falls back to `VERCEL_URL` on Vercel, or `https://klynt.one` locally.

---

## Deploy checklist (подробно)

### 1. Переменные окружения

В панели хостинга (Vercel → Project → Settings → Environment Variables) для **Production**:

| Переменная | Значение | Зачем |
|------------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://klynt.one` | Canonical, `sitemap.xml`, Open Graph, JSON-LD — везде один и тот же домен |
| `OPENAI_API_KEY` | секрет | `/api/analyze` |
| `RESEND_API_KEY` | секрет | `/api/contact` |

**Важно для `NEXT_PUBLIC_SITE_URL`:**
- Только `https://`, без слэша в конце: `https://klynt.one` ✅, `https://klynt.one/` ❌
- Должен совпадать с тем доменом, который видит пользователь в браузере (если основной домен `klynt.one`, не указывайте `*.vercel.app`)
- После смены переменной нужен **новый деплой** (redeploy), чтобы пересобрались `sitemap`, OG и мета-теги

На Vercel без `NEXT_PUBLIC_SITE_URL` подставится `https://<project>.vercel.app` — для продакшена это плохо: в Google уйдёт preview-URL, шаринг в соцсетях тоже.

Локально скопируйте `.env.example` → `.env.local` и заполните те же ключи.

### 2. Домен и HTTPS

1. В Vercel: **Settings → Domains** → добавьте `klynt.one` (и при необходимости `www.klynt.one`).
2. У регистратора DNS: A/CNAME как подскажет Vercel.
3. Дождитесь SSL (обычно автоматически).
4. Выберите **один** основной вариант:
   - либо редирект `www` → apex (`klynt.one`),
   - либо наоборот — и тогда `NEXT_PUBLIC_SITE_URL` должен быть тем же, что редиректит «на себя».

Иначе дубли в индексе (два URL с одним контентом).

### 3. Деплой и быстрая проверка

После `git push` или ручного Deploy откройте в браузере:

| URL | Ожидание |
|-----|----------|
| `https://klynt.one/` | Главная, нормальный title во вкладке (не «Create Next App») |
| `https://klynt.one/robots.txt` | `Allow: /`, `Disallow: /api/`, `Disallow: /report/`, строка `Sitemap: https://klynt.one/sitemap.xml` |
| `https://klynt.one/sitemap.xml` | Два URL: `/` и `/contact` |
| `https://klynt.one/manifest.webmanifest` | JSON с именем Klynt |
| `https://klynt.one/opengraph-image` | PNG-превью (может открыться как картинка) |

**Просмотр meta-тегов:** View Page Source на главной или DevTools → Elements → `<head>`:
- `<title>`, `<meta name="description">`
- `<link rel="canonical" href="https://klynt.one/">`
- `og:title`, `og:image`, `twitter:card`

### 4. Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console) → добавить ресурс.
2. Тип **URL prefix**: `https://klynt.one/` (со слэшем — как в интерфейсе Google).
3. Подтверждение владения (один способ):
   - **HTML file**: скачать файл → положить в `public/` → деплой → «Verify»;
   - **DNS TXT** у регистратора (удобно, если не хотите лишний файл в репо);
   - **Meta tag** — пока не подключён в коде; можно добавить позже через env.
4. **Sitemaps** → ввести: `sitemap.xml` → Submit.
5. **URL inspection** → проверить `https://klynt.one/` → **Request indexing** (опционально, ускоряет первую индексацию, не гарантия).

Повторите для `www`, если он отдельно доступен без редиректа (лучше не допускать).

### 5. Другие поисковики (по желанию)

- [Bing Webmaster Tools](https://www.bing.com/webmasters) — импорт из Google или отдельная верификация + тот же sitemap.
- [Yandex Webmaster](https://webmaster.yandex.ru/) — если нужен RU-трафик.

### 6. Проверка шаринга (Open Graph)

Кэш соцсетей обновляется не сразу.

1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) → URL `https://klynt.one/` → **Scrape Again**.
2. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — то же.
3. X/Twitter — превью часто подтягивает OG; отдельный валидатор у X менялся, достаточно посмотреть карточку в дебаггере Meta.

Должны быть: заголовок, описание, картинка 1200×630 (с `/opengraph-image`).

### 7. Structured data (JSON-LD)

1. [Rich Results Test](https://search.google.com/test/rich-results) → URL главной.
2. Ошибок по Organization / WebSite / SoftwareApplication быть не должно (предупреждения возможны — смотреть текст).

### 8. Что не индексируем (намеренно)

Не добавляйте в sitemap и не ждите SEO от:
- `/analyze` — `noindex` (инструмент, не лендинг)
- `/report/*` — private + `robots.txt`

Это нормальная схема для SaaS.

### 9. После каждого крупного SEO-изменения

1. Redeploy на production.
2. Search Console → **Validate fix** / переотправить sitemap, если менялись URL.
3. Снова **Scrape Again** в Facebook Debugger, если меняли OG.

### 10. Типичные ошибки

| Симптом | Причина |
|---------|---------|
| В sitemap ссылки на `*.vercel.app` | Не задан `NEXT_PUBLIC_SITE_URL` на production |
| Два разных canonical (www и non-www) | Нет редиректа на один домен |
| Старая OG-картинка в Facebook | Кэш — Scrape Again |
| Google не индексирует `/analyze` | Так задумано (`noindex`) |
| Title всё ещё «Create Next App» | Старый деплой / не та ветка |

---

## Optional external files (recommended for polish)

These are **not required** while dynamic OG/icon routes are enabled. Add them if you want fixed branding in social previews or better Search Console setup.

### Branding & social

| File | Size / format | Purpose |
|------|----------------|---------|
| `public/og.png` | **1200×630** PNG or JPG | Static OG image (replace dynamic route by removing `app/opengraph-image.tsx` and setting `openGraph.images` in `lib/seo.ts`) |
| `public/og-square.png` | **1200×1200** | Some networks (optional) |
| `public/favicon.ico` | multi-size ICO | Legacy browsers; optional if `/icon` is enough |
| `public/icon-192.png` | 192×192 | Android / manifest (optional; manifest currently points to `/icon`) |
| `public/icon-512.png` | 512×512 | Android splash / install prompt |

### Logo (already in repo)

| File | Status |
|------|--------|
| `public/klynt-logo-dark.svg` | Used in UI and JSON-LD `logo` |

### Search engine verification (host at site root)

| File | Source |
|------|--------|
| `public/googleXXXXXXXX.html` | Google Search Console → URL prefix verification |
| `public/BingSiteAuth.xml` | Bing Webmaster Tools |
| Or meta tag | Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and wire in `lib/seo.ts` if you prefer |

### Analytics (not SEO, but often deployed together)

| Service | Typical env var |
|---------|------------------|
| Google Analytics 4 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Plausible / Fathom | script or env per provider |

---

## Indexing policy (current)

| URL | Indexed |
|-----|---------|
| `/` | Yes |
| `/contact` | Yes |
| `/analyze` | **No** (`noindex`) |
| `/report/*` | **No** (`noindex` + `robots.txt` disallow) |
| `/api/*` | Blocked in `robots.txt` |

---

## After deploy

1. Open `https://klynt.one/robots.txt` and `https://klynt.one/sitemap.xml`.
2. Submit sitemap in [Google Search Console](https://search.google.com/search-console).
3. Test sharing: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or X equivalent).
4. Run [Rich Results Test](https://search.google.com/test/rich-results) on the homepage.
