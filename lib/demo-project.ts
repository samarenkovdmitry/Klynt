import { supabase } from '@/lib/db/supabase';
import { getLocale } from '@/lib/market';

// A realistic demo project: 12 days of a mobile app redesign with a
// client, a PM and a designer. Events arrive already interpreted
// (candidate_events) and drive project_facts + fact_history + conflicts,
// so the dashboard shows the full "truth layer" without any AI calls.

const isRu = getLocale() === 'ru';
// Localized seed content — every user-visible string gets en/ru variants.
const S = (en: string, ru: string) => (isRu ? ru : en);

const now = Date.now();
const daysAgo = (d: number, hour = 10) =>
  new Date(now - d * 86400 * 1000 + hour * 3600 * 1000).toISOString();

interface DemoEvent {
  daysAgo: number;
  hour: number;
  source: 'figma' | 'slack' | 'linear' | 'telegram';
  author: 'Anna' | 'John' | 'Sara';
  content: string;
  subject: string;
  event_type: string;
  action: string;
  reason: string;
  importance: 'low' | 'medium' | 'high';
  confidence: number;
  figma?: boolean;
}

const AUTHORS = {
  Anna: { source: 'figma', role: 'designer', display: S('Anna', 'Анна') },
  John: { source: isRu ? 'telegram' : 'slack', role: 'pm', display: S('John', 'Джон') },
  Sara: { source: isRu ? 'telegram' : 'slack', role: 'client', display: S('Sara', 'Сара') },
} as const;

const EVENTS: DemoEvent[] = [
  { daysAgo: 12, hour: 10, source: 'figma', author: 'Anna', subject: S('home screen', 'главный экран'), event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: S('Home screen wireframe v1 uploaded. Exploring a 5-tab bottom navigation.', 'Вайрфрейм главного экрана v1 загружен. Пробуем нижнюю навигацию на 5 вкладок.'),
    reason: S('Home screen wireframe v1 added', 'Добавлен вайрфрейм главного экрана v1') },
  { daysAgo: 12, hour: 14, source: 'slack', author: 'John', subject: S('bottom navigation', 'нижняя навигация'), event_type: 'request', action: 'modify', confidence: 0.85, importance: 'medium',
    content: S('Home looks good, but 5 tabs feels like too many for mobile. Can we try 3?', 'Главный экран хорош, но 5 вкладок многовато для мобильного. Попробуем 3?'),
    reason: S('3-tab navigation requested instead of 5', 'Запрошена навигация из 3 вкладок вместо 5') },
  { daysAgo: 11, hour: 10, source: 'figma', author: 'Anna', subject: S('bottom navigation', 'нижняя навигация'), event_type: 'change', action: 'modify', confidence: 0.9, importance: 'medium', figma: true,
    content: S('Updated home screen with 3-tab navigation. Cleaner layout.', 'Обновила главный экран — навигация из 3 вкладок. Чище.'),
    reason: S('Bottom navigation changed to 3 tabs', 'Нижняя навигация изменена на 3 вкладки') },
  { daysAgo: 11, hour: 16, source: 'slack', author: 'Sara', subject: S('bottom navigation', 'нижняя навигация'), event_type: 'approval', action: 'approve', confidence: 0.95, importance: 'high',
    content: S('3 tabs is much better. Approved for now.', '3 вкладки намного лучше. Подтверждаю.'),
    reason: S('3-tab navigation approved by client', 'Навигация из 3 вкладок подтверждена клиентом') },
  { daysAgo: 10, hour: 10, source: 'figma', author: 'Anna', subject: S('avatar upload', 'загрузка аватара'), event_type: 'change', action: 'add', confidence: 0.8, importance: 'medium', figma: true,
    content: S('Added profile screen with avatar upload placeholder.', 'Добавила экран профиля с плейсхолдером загрузки аватара.'),
    reason: S('Avatar upload added to profile screen', 'Загрузка аватара добавлена на экран профиля') },
  { daysAgo: 10, hour: 15, source: 'slack', author: 'John', subject: S('avatar upload', 'загрузка аватара'), event_type: 'scope_change', action: 'remove', confidence: 0.9, importance: 'high',
    content: S('Avatar upload is out of scope for MVP. We can add it later.', 'Загрузка аватара вне объёма MVP. Добавим позже.'),
    reason: S('Avatar upload marked out of scope for MVP', 'Загрузка аватара вынесена из объёма MVP') },
  { daysAgo: 9, hour: 10, source: 'figma', author: 'Anna', subject: S('checkout flow', 'флоу оплаты'), event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: S('Checkout flow v1. Need feedback on payment placement.', 'Флоу оплаты v1. Нужен фидбек по размещению оплаты.'),
    reason: S('Checkout flow v1 added', 'Добавлен флоу оплаты v1') },
  { daysAgo: 9, hour: 17, source: 'slack', author: 'Sara', subject: S('payment method', 'способ оплаты'), event_type: 'request', action: 'add', confidence: 0.9, importance: 'high',
    content: S('Checkout is missing a payment method step. Please add before review.', 'В флоу оплаты не хватает шага выбора способа оплаты. Добавьте до ревью.'),
    reason: S('Payment method step requested in checkout', 'Запрошен шаг выбора способа оплаты') },
  { daysAgo: 8, hour: 10, source: 'figma', author: 'Anna', subject: S('payment method', 'способ оплаты'), event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: S('Added payment method selection screen.', 'Добавила экран выбора способа оплаты.'),
    reason: S('Payment method screen added', 'Добавлен экран выбора способа оплаты') },
  { daysAgo: 8, hour: 18, source: 'slack', author: 'Sara', subject: S('checkout flow', 'флоу оплаты'), event_type: 'approval', action: 'approve', confidence: 0.95, importance: 'high',
    content: S('Payment flow looks good. Approved.', 'Флоу оплаты выглядит хорошо. Подтверждаю.'),
    reason: S('Checkout flow approved by client', 'Флоу оплаты подтверждён клиентом') },
  { daysAgo: 7, hour: 10, source: 'figma', author: 'Anna', subject: S('dark mode', 'тёмная тема'), event_type: 'change', action: 'add', confidence: 0.85, importance: 'medium', figma: true,
    content: S('Dark mode variants added for main screens.', 'Добавила варианты тёмной темы для основных экранов.'),
    reason: S('Dark mode variants added', 'Добавлены варианты тёмной темы') },
  { daysAgo: 7, hour: 15, source: 'slack', author: 'John', subject: S('dark mode', 'тёмная тема'), event_type: 'question', action: 'undecided', confidence: 0.8, importance: 'medium',
    content: S('Do we really need dark mode now? It adds a lot of work.', 'Тёмная тема точно нужна сейчас? Это много работы.'),
    reason: S('Dark mode scope questioned', 'Объём работ по тёмной теме под вопросом') },
  { daysAgo: 6, hour: 9, source: 'slack', author: 'Sara', subject: S('dark mode', 'тёмная тема'), event_type: 'decision', action: 'approve', confidence: 0.9, importance: 'medium',
    content: S('Yes, dark mode is important for launch. Keep it.', 'Да, тёмная тема важна к запуску. Оставляем.'),
    reason: S('Dark mode kept for launch per client', 'Тёмная тема оставлена к запуску по решению клиента') },
  { daysAgo: 5, hour: 10, source: 'figma', author: 'Anna', subject: S('settings screen', 'экран настроек'), event_type: 'change', action: 'add', confidence: 0.9, importance: 'medium', figma: true,
    content: S('Settings screen created with notifications toggle.', 'Создала экран настроек с переключателем уведомлений.'),
    reason: S('Settings screen added', 'Добавлен экран настроек') },
  { daysAgo: 4, hour: 10, source: 'slack', author: 'Sara', subject: S('app icon', 'иконка приложения'), event_type: 'decision', action: 'approve', confidence: 0.9, importance: 'medium',
    content: S("App icon: let's go with the blue version. It feels more premium.", 'Иконка приложения: берём синюю — выглядит премиальнее.'),
    reason: S('Blue app icon approved by client', 'Синяя иконка приложения подтверждена клиентом') },
  { daysAgo: 3, hour: 14, source: 'slack', author: 'John', subject: S('app icon', 'иконка приложения'), event_type: 'decision', action: 'modify', confidence: 0.85, importance: 'high',
    content: S('Actually, the green app icon tested better in user research.', 'Вообще, зелёная иконка лучше показала себя в исследовании.'),
    reason: S('Green app icon proposed after user research', 'Предложена зелёная иконка после исследования') },
  { daysAgo: 2, hour: 10, source: 'figma', author: 'Anna', subject: S('app icon', 'иконка приложения'), event_type: 'change', action: 'modify', confidence: 0.9, importance: 'medium', figma: true,
    content: S("Switched to green app icon based on John's research.", 'Переключила на зелёную иконку по исследованию Джона.'),
    reason: S('App icon switched to green', 'Иконка приложения заменена на зелёную') },
  { daysAgo: 1, hour: 9, source: 'slack', author: 'Sara', subject: S('app icon', 'иконка приложения'), event_type: 'request', action: 'modify', confidence: 0.85, importance: 'high',
    content: S('Wait, I liked blue better. Can we revert before the review?', 'Стоп, синяя нравилась больше. Можем вернуть до ревью?'),
    reason: S('Client asked to revert to blue icon', 'Клиент просит вернуть синюю иконку') },
  { daysAgo: 1, hour: 11, source: 'figma', author: 'Anna', subject: S('app icon', 'иконка приложения'), event_type: 'change', action: 'modify', confidence: 0.85, importance: 'high', figma: true,
    content: S('Reverted to blue app icon for now. Need final decision.', 'Вернула синюю иконку пока. Нужно финальное решение.'),
    reason: S('Reverted to blue, final decision pending', 'Вернули синий, финальное решение не принято') },
];

// Final fact states: subject -> { state, display, confidence, importance }
// Keys use the same S() subjects as EVENTS so lookups work in any locale.
const FACTS: Record<string, { state: string; display: string; confidence: number; importance: string }> = {
  [S('home screen', 'главный экран')]:       { state: 'approved', display: S('Approved', 'Согласовано'),        confidence: 0.95, importance: 'high' },
  [S('bottom navigation', 'нижняя навигация')]: { state: 'approved', display: S('Approved', 'Согласовано'),   confidence: 0.95, importance: 'high' },
  [S('avatar upload', 'загрузка аватара')]:  { state: 'removed',  display: S('Out of scope', 'Вне рамок проекта'),    confidence: 0.85, importance: 'medium' },
  [S('checkout flow', 'флоу оплаты')]:       { state: 'approved', display: S('Approved', 'Согласовано'),      confidence: 0.92, importance: 'high' },
  [S('payment method', 'способ оплаты')]:    { state: 'added',    display: S('Added', 'Добавлено'),            confidence: 0.88, importance: 'high' },
  [S('dark mode', 'тёмная тема')]:           { state: 'approved', display: S('Approved', 'Согласовано'),      confidence: 0.80, importance: 'low' },
  [S('settings screen', 'экран настроек')]:  { state: 'modify',   display: S('In progress', 'В работе'),       confidence: 0.78, importance: 'medium' },
  [S('app icon', 'иконка приложения')]:      { state: 'modify',   display: S('Decision pending', 'Ждёт решения'), confidence: 0.55, importance: 'high' },
};

const CONFLICTS = [
  {
    subject: S('app icon', 'иконка приложения'),
    conflict_type: 'state_change',
    description: S(
      'App icon flipped blue → green → blue in 3 days. Client and PM disagree; final decision still pending.',
      'Клиент просит вернуть синюю иконку. В плане остаётся зелёная.',
    ),
  },
  {
    subject: S('avatar upload', 'загрузка аватара'),
    conflict_type: 'scope_change',
    description: S(
      'Designer added avatar upload to the profile screen, but the PM marked it out of scope for MVP.',
      'В макете появилась загрузка фото. В согласованный объём она не входит.',
    ),
  },
];

export async function createDemoProject(ownerId: string) {
  const base = {
    name: 'Lunar mobile',
    description: S(
      'Sample project — a mobile app redesign tracked from Figma and Slack.',
      'Редизайн мобильного приложения. Решения и изменения из Figma и Telegram.',
    ),
    owner_id: ownerId,
    slug: `sample-lunar-mobile-${Date.now().toString(36)}`,
  };

  let { data: project, error } = await supabase
    .from('projects')
    .insert({ ...base, is_demo: true })
    .select()
    .single();

  // is_demo column not yet migrated — insert without it
  if (error && error.message?.includes('is_demo')) {
    ({ data: project, error } = await supabase.from('projects').insert(base).select().single());
  }
  if (error) throw error;
  return seedProjectData(project!);
}

async function seedProjectData(project: { id: string }) {
  const projectId = project.id;

  // People directory (external authors)
  for (const [name, meta] of Object.entries(AUTHORS)) {
    await supabase.from('project_members').insert({
      project_id: projectId,
      external_user_id: `demo_${name.toLowerCase()}`,
      external_source: meta.source,
      name: meta.display,
      role: meta.role,
    });
  }

  // Facts + per-event raw/candidate rows + history
  const factIds: Record<string, string> = {};
  const eventRows: { candidateId: string; rawId: string; e: DemoEvent }[] = [];

  // last_updated_at = timestamp of the most recent event on that subject
  const lastEventAt = (subject: string) => {
    const e = [...EVENTS].reverse().find(ev => ev.subject === subject);
    return e ? daysAgo(e.daysAgo, e.hour) : daysAgo(0, 9);
  };

  for (const [subject, f] of Object.entries(FACTS)) {
    const { data: fact } = await supabase
      .from('project_facts')
      .insert({
        project_id: projectId,
        subject,
        subject_type: 'design_component',
        fact_type: 'state',
        current_state: f.state,
        current_value: { display_state: f.display },
        confidence: f.confidence,
        importance: f.importance,
        evidence_summary: `${S('Latest', 'Последнее')}: ${f.display.toLowerCase()}`,
        last_updated_at: lastEventAt(subject),
      })
      .select('id')
      .single();
    if (fact) factIds[subject] = fact.id;
  }

  for (const [i, e] of EVENTS.entries()) {
    const ts = daysAgo(e.daysAgo, e.hour);
    // On the ru deployment the chat source is Telegram, not Slack.
    const source = e.source === 'slack' && isRu ? 'telegram' : e.source;
    const metadata = {
      author: { name: AUTHORS[e.author].display },
      ...(e.source === 'slack'
        ? isRu
          ? { channel: 'lunar-mobile', chat_id: -1000000000000 + i, message_id: `demo_${i}` }
          : { channel: 'lunar-mobile', channel_id: 'C0DEMO', team_id: 'T0DEMO', message_id: `demo_${i}` }
        : {}),
      ...(e.source === 'figma'
        ? { file_key: 'demoLunarFile', file_name: 'Lunar mobile', comment_id: `demo_c${i}` }
        : {}),
    };

    const { data: raw } = await supabase
      .from('raw_events')
      .insert({
        project_id: projectId,
        source,
        source_event_id: `demo_${i}`,
        event_type: e.source === 'slack' ? 'message' : 'comment',
        author_id: AUTHORS[e.author].display,
        timestamp: ts,
        content: e.content,
        metadata,
        processed_at: ts,
      })
      .select('id')
      .single();
    if (!raw) continue;

    const { data: cand } = await supabase
      .from('candidate_events')
      .insert({
        raw_event_id: raw.id,
        project_id: projectId,
        event_type: e.event_type,
        subject: e.subject,
        action: e.action,
        confidence: e.confidence,
        importance: e.importance,
        reason: e.reason,
        related_entities: [e.subject],
        potential_impacts: [],
        status: 'confirmed',
        created_at: ts,
      })
      .select('id')
      .single();
    if (!cand) continue;

    eventRows.push({ candidateId: cand.id, rawId: raw.id, e });
  }

  // Fact history: one row per state-changing event on a fact's subject
  const prevState: Record<string, string> = {};
  for (const { candidateId, rawId, e } of eventRows) {
    const factId = factIds[e.subject];
    if (!factId) continue;
    const previous = prevState[e.subject] || null;
    await supabase.from('fact_history').insert({
      fact_id: factId,
      project_id: projectId,
      previous_state: previous,
      new_state: e.action,
      event_id: candidateId,
      decided_at: daysAgo(e.daysAgo, e.hour),
      confidence: e.confidence,
      reason: e.reason,
      evidence: [rawId],
    });
    prevState[e.subject] = e.action;
  }

  for (const c of CONFLICTS) {
    await supabase.from('conflicts').insert({
      project_id: projectId,
      subject: c.subject,
      conflict_type: c.conflict_type,
      previous_fact_id: factIds[c.subject] || null,
      status: 'unresolved',
      description: c.description,
    });
  }

  return project;
}
