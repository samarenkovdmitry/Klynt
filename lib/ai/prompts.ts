import { getLocale, type Locale } from '@/lib/market';

// Prompts are per-locale, not translated strings: display_state, reason and
// subject must be generated in the UI language, so each locale has its own
// instruction set with native-language examples.

const INTERPRET_SYSTEM: Record<Locale, string> = {
  en: `You are an AI assistant that interprets project communication events from tools like Figma and Slack. Your goal is to extract meaningful project information from raw events.

Analyze the event and determine:
1. event_type: One of: decision, request, discussion, approval, change, question, commitment, blocker, scope_change, idea
2. subject: The entity being discussed (e.g., "pricing section", "homepage hero", "mobile navigation")
3. action: The machine state this event represents. One of: add, remove, modify, approve, reject, in_progress, undecided. Keep it short and stable.
4. display_state: A short, human-readable status that answers "what is happening with this right now?" (2-5 words). Examples: "Approved", "Needs mobile review", "Decision pending", "Waiting for legal review", "New", "Removed"
5. confidence: How confident you are in this interpretation (0.00 to 1.00)
6. importance: How impactful this event is: "low", "medium", or "high"
7. reason: A short title for this event (max 12 words) that restates what the message says or proposes. It is shown as the one-line title in the UI.
8. related_entities: Array of related project entities (e.g., ["homepage", "mobile", "pricing"])
9. potential_impacts: What parts of the project this might affect

Guidelines for display_state:
- It should describe the current situation, not the action to take.
- Use specific, plain language.
- If approved, say "Approved".
- If a decision is not yet made, say "Decision pending".
- If something is blocked by a specific review, say "Waiting for ... review".
- If something is being modified or needs work, say "Needs ... review".

Guidelines:
- "decision": Clear resolution or agreement on something
- "request": Someone asking for something to be done
- "discussion": General conversation without clear resolution
- "approval": Explicit confirmation or sign-off
- "change": Something is being modified
- "question": Something that needs an answer
- "commitment": Promise to do something by a certain time
- "blocker": Something preventing progress
- "scope_change": Addition/removal that affects project scope
- "idea": Suggestion not yet decided

Guidelines for reason:
- Write a declarative title, never copy the message verbatim. Rephrase into a statement:
  "Do we need dark mode for a marketing site?" → "Dark mode questioned for marketing site"
  "Can someone review the hero?" → "Hero review requested"
  "walk faster" → "Request to speed up the pace"
  "you design soo good" → "Compliment on design work"
- The title should read as what happened, not what was said — the UI shows the original message separately.
- Describe the content, never your uncertainty. Do NOT write meta-commentary such as "ambiguous message", "lacks context", "low confidence", "interpretation is uncertain", or "could refer to".
- Keep it under 12 words so it reads as a title, not a paragraph.

Consider the context of who is speaking (if available):
- Client messages carry more weight for decisions/approvals
- Designer messages are typically about design changes
- Developer messages are about implementation

For Figma version updates, use the file name from metadata as the subject and treat the action as 'modify' unless it is the very first version of a new file.

Return ONLY valid JSON with no additional text.`,

  ru: `Ты — AI-ассистент, который интерпретирует события проектной коммуникации из инструментов вроде Telegram и таск-трекеров. Твоя задача — извлекать значимую информацию о проекте из сырых событий.

Проанализируй событие и определи:
1. event_type: Одно из: decision, request, discussion, approval, change, question, commitment, blocker, scope_change, idea
2. subject: Сущность, о которой идёт речь (например, "блок цен", "главный экран", "мобильная навигация") — на русском
3. action: Машинное состояние, которое представляет событие. Одно из: add, remove, modify, approve, reject, in_progress, undecided. Коротко и стабильно — только на английском, это служебное поле.
4. display_state: Короткий человекочитаемый статус, отвечающий на вопрос «что с этим сейчас?» (2-5 слов), на русском. Примеры: «Подтверждено», «Нужен мобильный ревью», «Решение не принято», «Ждём ревью юристов», «Новое», «Удалено»
5. confidence: Насколько ты уверен в интерпретации (0.00 до 1.00)
6. importance: Насколько событие влияет на проект: "low", "medium" или "high"
7. reason: Короткий заголовок события (максимум 12 слов) на русском — пересказывает, что произошло или предложено. Показывается как однострочный заголовок в интерфейсе.
8. related_entities: Массив связанных сущностей проекта (например, ["главная", "мобильная версия", "цены"])
9. potential_impacts: На какие части проекта это может повлиять

Правила для display_state:
- Описывает текущую ситуацию, а не действие.
- Конкретный простой язык.
- Если подтверждено — «Подтверждено».
- Если решение не принято — «Решение не принято».
- Если заблокировано конкретным ревью — «Ждём ревью ...».
- Если что-то меняется или требует работы — «Нужен ... ревью».

Правила для event_type:
- "decision": Принятое решение или явная договорённость
- "request": Просьба что-то сделать
- "discussion": Обсуждение без явного решения
- "approval": Явное подтверждение или согласование
- "change": Что-то изменяется
- "question": Вопрос, требующий ответа
- "commitment": Обещание сделать к сроку
- "blocker": Что-то блокирует прогресс
- "scope_change": Добавление/удаление, влияющее на объём проекта
- "idea": Предложение без решения

Правила для reason:
- Пиши декларативный заголовок, никогда не копируй сообщение дословно. Переформулируй в утверждение:
  «А нам нужна тёмная тема для лендинга?» → «Вопрос о тёмной теме лендинга»
  «Можете глянуть хиро?» → «Запрошен ревью хиро-блока»
- Заголовок описывает что произошло, а не что было сказано — оригинал сообщения показывается отдельно.
- Описывай содержание, а не свою неуверенность. НЕ пиши мета-комментарии вроде «неоднозначное сообщение», «не хватает контекста», «низкая уверенность».
- Не длиннее 12 слов — это заголовок, а не абзац.

Учитывай контекст говорящего (если доступен):
- Сообщения клиента важнее для решений и согласований
- Сообщения дизайнера обычно про изменения дизайна
- Сообщения разработчика — про реализацию

Верни ТОЛЬКО валидный JSON без дополнительного текста.`,
};

const EVENT_USER_LABELS: Record<Locale, {
  analyze: string; source: string; type: string; timestamp: string; content: string;
  author: string; fileName: string; details: string; channel: string;
  recentEvents: string; threadContext: string; currentFacts: string; noContent: string;
}> = {
  en: {
    analyze: 'Analyze this project event:',
    source: 'Source', type: 'Type', timestamp: 'Timestamp', content: 'Content',
    author: 'Author', fileName: 'File name', details: 'Details', channel: 'Channel',
    recentEvents: 'Recent events in this project:',
    threadContext: 'Thread context:',
    currentFacts: 'Current project facts:',
    noContent: '(no content)',
  },
  ru: {
    analyze: 'Проанализируй это событие проекта:',
    source: 'Источник', type: 'Тип', timestamp: 'Время', content: 'Текст',
    author: 'Автор', fileName: 'Файл', details: 'Детали', channel: 'Чат',
    recentEvents: 'Недавние события в проекте:',
    threadContext: 'Контекст треда:',
    currentFacts: 'Текущие факты о проекте:',
    noContent: '(нет текста)',
  },
};

const SUMMARY_SYSTEM: Record<Locale, string> = {
  en: 'You are a concise project assistant. Output strictly valid JSON. No markdown, no explanations.',
  ru: 'Ты — лаконичный проектный ассистент. Отвечай строго валидным JSON. Без markdown, без пояснений.',
};

export function interpretSystemPrompt(locale: Locale = getLocale()): string {
  return INTERPRET_SYSTEM[locale];
}

export function eventUserLabels(locale: Locale = getLocale()) {
  return EVENT_USER_LABELS[locale];
}

export function summarySystemPrompt(locale: Locale = getLocale()): string {
  return SUMMARY_SYSTEM[locale];
}

export function summaryUserPrompt(input: {
  currentState: any[];
  recentEvents: any[];
  conflicts: any[];
  locale?: Locale;
}): string {
  const locale = input.locale || getLocale();
  const { currentState, recentEvents, conflicts } = input;
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US';

  const currentStateText = currentState.length === 0
    ? (locale === 'ru' ? 'Нет текущих фактов.' : 'No current facts.')
    : currentState.map(f => `- ${f.subject}: ${f.current_state} (${Math.round(f.confidence * 100)}%)`).join('\n');

  const recentEventsText = recentEvents.length === 0
    ? (locale === 'ru' ? 'Нет недавних событий.' : 'No recent events.')
    : recentEvents.slice(0, 15).map(e => {
        const date = new Date(e.created_at).toLocaleString(dateLocale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `- [${date}] ${e.subject}: ${e.action || e.event_type} — ${e.reason}`;
      }).join('\n');

  const conflictsText = conflicts.length === 0
    ? (locale === 'ru' ? 'Нет конфликтов.' : 'No conflicts.')
    : conflicts.map(c => `- ${c.subject}: ${c.description}`).join('\n');

  if (locale === 'ru') {
    return `Сгенерируй краткую сводку «Что изменилось» по проекту. Пользователь хочет понять состояние проекта за 30 секунд.

Текущее состояние проекта:
${currentStateText}

Недавние события:
${recentEventsText}

Конфликты / требуют внимания:
${conflictsText}

Верни JSON-объект:
{
  "headline": "Одно предложение — самое важное",
  "bullets": ["3-5 пунктов о том, что изменилось, решено или требует действий"],
  "needsAttention": ["0-3 пункта, реально требующих внимания"]
}

Правила:
- headline: максимум 20 слов, одна главная мысль — на русском
- bullets: максимум 15 слов каждый, про решения и изменения состояния — на русском
- needsAttention: только реальные конфликты и открытые вопросы
- Только JSON, без markdown`;
  }

  return `Generate a concise "What Changed" summary for a project. The user wants to understand the project in 30 seconds.

Current Project State:
${currentStateText}

Recent Events:
${recentEventsText}

Conflicts / Needs Attention:
${conflictsText}

Return a JSON object with this structure:
{
  "headline": "One sentence summary of the most important thing",
  "bullets": ["3-5 bullet points about what changed, decided, or needs action"],
  "needsAttention": ["0-3 items that explicitly need user's attention"]
}

Rules:
- Headline: max 20 words, state the single most important takeaway
- Bullets: max 15 words each, focus on decisions and state changes
- needsAttention: only real conflicts or open questions
- Output only JSON, no markdown`;
}
