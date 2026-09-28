import { getLocale } from '@/lib/market';

// Flat dictionary, dot-keys. t('sidebar.projects') → localized string.
// Locale is per-deployment (env-driven), not per-user — the RU product is a
// separate deployment, so no runtime switching or locale routing.

type Dict = Record<string, string>;

const en: Dict = {
  // Sidebar
  'sidebar.projects': 'Projects',
  'sidebar.newProject': 'New project',
  'sidebar.integrations': 'Integrations',
  'sidebar.settings': 'Settings',
  'sidebar.logout': 'Log out',
  'sidebar.itemsNeedAttention': 'items need attention',
  'sidebar.itemNeedsAttention': 'item needs attention',

  // Integrations page
  'integrations.title': 'Integrations',
  'integrations.subtitle': 'Connect tools to keep project state up to date.',
  'integrations.project': 'Project',
  'integrations.loading': 'Loading…',
  'integrations.connect': 'Connect',
  'integrations.reconnect': 'Reconnect',
  'integrations.disconnect': 'Disconnect',
  'integrations.comingSoon': 'Coming soon',
  'integrations.connected': 'Connected',
  'integrations.lastSync': 'Last sync',
  'integrations.never': 'Never',
  'integrations.justNow': 'Just now',
  'integrations.connectedNotice': '{name} connected. Importing recent activity…',
  'integrations.disconnectedNotice': '{name} disconnected.',
  'integrations.disconnectConfirm': 'Disconnect {source} from this project?',
  'integrations.disconnectFailed': 'Failed to disconnect. Try again.',
  'integrations.connectionFailed': 'Connection failed: {error}',

  // Integrations — service copy
  'integrations.figma.desc': 'Import comments, versions, and design changes.',
  'integrations.slack.desc': 'Import messages, decisions, and mentions.',
  'integrations.linear.desc': 'Import issue status changes and comments.',
  'integrations.telegram.desc': 'Import messages from a project chat.',
  'integrations.gdocs.desc': 'Import briefs, comments, and decisions from docs.',
  'integrations.notion.desc': 'Sync pages and decisions.',

  // Integrations — Telegram panel
  'integrations.telegram.bot': 'Bot',
  'integrations.telegram.tracking': 'Tracking {chat}',
  'integrations.telegram.waiting': 'Waiting for chat',
  'integrations.telegram.addBot': 'Add @{bot} to the project chat — it binds automatically.',
  'integrations.telegram.tokenPlaceholder': 'Paste bot token from @BotFather…',
  'integrations.telegram.howto': '1. Create a bot via @BotFather in Telegram. 2. Paste the token here. 3. Add the bot to the project chat (disable its privacy mode so it can read messages).',
  'integrations.telegram.connectedNotice': 'Bot @{bot} connected. Add it to the project chat.',

  // Integrations — Figma panel
  'integrations.figma.watching': 'Watching',
  'integrations.figma.live': 'Live',
  'integrations.figma.polling': 'Polling',
  'integrations.figma.syncNow': 'Sync now',
  'integrations.figma.stop': 'Stop',
  'integrations.figma.filePlaceholder': 'Paste a Figma file link…',
  'integrations.figma.watch': 'Watch',
  'integrations.figma.hint': 'Pick which file to track. Right-click a file in Figma → Copy link.',
  'integrations.figma.synced': 'Synced — {count} new events',
  'integrations.figma.syncedOne': 'Synced — 1 new event',
  'integrations.figma.syncFailed': 'Sync failed',

  // Integrations — Slack panel
  'integrations.slack.channelsTracked': '{count} channels tracked',
  'integrations.slack.channelTracked': '1 channel tracked',
  'integrations.slack.allChannels': 'All channels tracked',
  'integrations.slack.pickChannels': 'Pick channels',
  'integrations.slack.close': 'Close',
  'integrations.slack.private': 'private',
  'integrations.slack.privateHint': 'Private channels: invite the bot with /invite first.',
  'integrations.slack.save': 'Save',

  // Integrations — Linear panel
  'integrations.linear.teamsTracked': '{count} teams tracked',
  'integrations.linear.teamTracked': '1 team tracked',
  'integrations.linear.allTeams': 'All public teams tracked',
  'integrations.linear.pickTeams': 'Pick teams',
  'integrations.linear.close': 'Close',
  'integrations.linear.live': 'Live',
  'integrations.linear.noWebhook': 'No webhook',
  'integrations.linear.uncheckAll': 'Uncheck all to track every public team.',
  'integrations.linear.save': 'Save',

  // Dashboard
  'dashboard.latest': 'Latest',
  'dashboard.newSinceVisit': 'New since last visit',
  'dashboard.nothingNew': 'Nothing new since your last visit.',
  'dashboard.moreInActivity': '+{count} more in Activity below',
  'dashboard.noChangesYet': 'No changes yet',
  'dashboard.connectToTrack': 'to start tracking your project.',
  'dashboard.connectIntegration': 'Connect an integration',
  'dashboard.noChangesPeriod': 'No changes in the last {period}.',
  'dashboard.connectToSeeState': 'Connect an integration to see what is currently true.',
  'dashboard.connectToSeeChanges': 'Connect an integration to see what changed.',
  'dashboard.activity': 'Activity',
  'dashboard.needsAttention': 'Needs attention',
  'dashboard.needsAttentionCount': '{count} need your attention',
  'dashboard.decisionNeeds': 'decision needs',
  'dashboard.decisionsNeed': 'decisions need',
  'dashboard.noIssues': 'No issues to review.',
  'dashboard.current': 'Current',
  'dashboard.previousState': 'Previous state',
  'dashboard.whyCurrentState': 'Why this is the current state',
  'dashboard.noReason': 'No reason given',
  'dashboard.originalMessage': 'Original message',
  'dashboard.undo': 'Undo',
  'dashboard.updating': 'Updating…',
  'dashboard.resolved': 'Resolved',
  'dashboard.needsDecision': 'Needs decision',
  'dashboard.areas': 'areas',
  'dashboard.approved': 'approved',
  'dashboard.needReview': 'need review',
  'dashboard.new': 'new',
  'dashboard.pending': 'pending',
  'dashboard.sinceLastVisit': 'since your last visit',
  'dashboard.updated': 'Updated',
  'dashboard.createFirst': 'Create your first project',
  'dashboard.seeExample': 'See a live example first',
  'dashboard.preparingSample': 'Preparing sample project…',
  'dashboard.7d': '7 days',
  'dashboard.30d': '30 days',
  'dashboard.all': 'All time',
  'dashboard.periodAll': 'All',
  'dashboard.justNow': 'just now',
  'dashboard.minAgo': '{m} min ago',
  'dashboard.hAgo': '{h}h ago',
  'dashboard.dAgo': '{d}d ago',
  'dashboard.showMore': 'Show {count} more',
  'dashboard.showLess': 'Show less',
  'dashboard.viewSource': 'View source',
  'dashboard.emptyProjectText': 'Klynt will collect decisions and changes from Figma, Slack and docs, and keep the project state up to date.',
  'dashboard.accept': 'Accept',
  'dashboard.keepAsIs': 'Keep as is',
  'dashboard.notSure': 'Not sure',
  'dashboard.confidence': 'Confidence {confidence}%',
  'dashboard.change': 'change',
  'dashboard.changes': 'changes',
  'dashboard.peopleInvolved': 'people involved',
  // Plural forms joined by | — one|few|many (en uses first two)
  'plural.change': 'change|changes|changes',
  'plural.person': 'person|people|people',
  'plural.area': 'area|areas|areas',

  // Dashboard — state/conflict labels
  'state.approved': 'Approved',
  'state.added': 'New',
  'state.modify': 'Needs review',
  'state.modified': 'Needs review',
  'state.removed': 'Decision pending',
  'conflict.state_change': 'No final decision',
  'conflict.contradiction': 'Decision conflict',
  'conflict.scope_change': 'Scope change',
  'conflict.scope_question': 'Scope question',
  'conflict.missing_confirmation': 'Not confirmed',
};

const ru: Dict = {
  // Sidebar
  'sidebar.projects': 'Проекты',
  'sidebar.newProject': 'Новый проект',
  'sidebar.integrations': 'Интеграции',
  'sidebar.settings': 'Настройки',
  'sidebar.logout': 'Выйти',
  'sidebar.itemsNeedAttention': 'требуют внимания',
  'sidebar.itemNeedsAttention': 'требует внимания',

  // Integrations page
  'integrations.title': 'Интеграции',
  'integrations.subtitle': 'Подключите инструменты, чтобы состояние проекта было актуальным.',
  'integrations.project': 'Проект',
  'integrations.loading': 'Загрузка…',
  'integrations.connect': 'Подключить',
  'integrations.reconnect': 'Переподключить',
  'integrations.disconnect': 'Отключить',
  'integrations.comingSoon': 'Скоро',
  'integrations.connected': 'Подключено',
  'integrations.lastSync': 'Синхронизация',
  'integrations.never': 'Никогда',
  'integrations.justNow': 'Только что',
  'integrations.connectedNotice': '{name} подключён. Импортируем недавнюю активность…',
  'integrations.disconnectedNotice': '{name} отключён.',
  'integrations.disconnectConfirm': 'Отключить {source} от этого проекта?',
  'integrations.disconnectFailed': 'Не удалось отключить. Попробуйте ещё раз.',
  'integrations.connectionFailed': 'Ошибка подключения: {error}',

  // Integrations — service copy
  'integrations.figma.desc': 'Импорт комментариев, версий и изменений дизайна.',
  'integrations.slack.desc': 'Импорт сообщений, решений и упоминаний.',
  'integrations.linear.desc': 'Импорт изменений статусов задач и комментариев.',
  'integrations.telegram.desc': 'Импорт сообщений из проектного чата.',
  'integrations.gdocs.desc': 'Импорт брифов, комментариев и решений из документов.',
  'integrations.notion.desc': 'Синхронизация страниц и решений.',

  // Integrations — Telegram panel
  'integrations.telegram.bot': 'Бот',
  'integrations.telegram.tracking': 'Следим за {chat}',
  'integrations.telegram.waiting': 'Ждём чат',
  'integrations.telegram.addBot': 'Добавьте @{bot} в проектный чат — привяжется автоматически.',
  'integrations.telegram.tokenPlaceholder': 'Вставьте токен бота от @BotFather…',
  'integrations.telegram.howto': '1. Создайте бота через @BotFather в Telegram. 2. Вставьте токен сюда. 3. Добавьте бота в проектный чат (отключите privacy mode, чтобы он мог читать сообщения).',
  'integrations.telegram.connectedNotice': 'Бот @{bot} подключён. Добавьте его в проектный чат.',

  // Integrations — Figma panel
  'integrations.figma.watching': 'Следим за',
  'integrations.figma.live': 'Live',
  'integrations.figma.polling': 'Опроc',
  'integrations.figma.syncNow': 'Синхронизировать',
  'integrations.figma.stop': 'Остановить',
  'integrations.figma.filePlaceholder': 'Вставьте ссылку на файл Figma…',
  'integrations.figma.watch': 'Следить',
  'integrations.figma.hint': 'Выберите файл для отслеживания. Правый клик по файлу в Figma → Copy link.',
  'integrations.figma.synced': 'Синхронизировано — новых событий: {count}',
  'integrations.figma.syncedOne': 'Синхронизировано — 1 новое событие',
  'integrations.figma.syncFailed': 'Ошибка синхронизации',

  // Integrations — Slack panel
  'integrations.slack.channelsTracked': 'Каналов отслеживается: {count}',
  'integrations.slack.channelTracked': 'Отслеживается 1 канал',
  'integrations.slack.allChannels': 'Все каналы отслеживаются',
  'integrations.slack.pickChannels': 'Выбрать каналы',
  'integrations.slack.close': 'Закрыть',
  'integrations.slack.private': 'приватный',
  'integrations.slack.privateHint': 'Приватные каналы: сначала пригласите бота через /invite.',
  'integrations.slack.save': 'Сохранить',

  // Integrations — Linear panel
  'integrations.linear.teamsTracked': 'Команд отслеживается: {count}',
  'integrations.linear.teamTracked': 'Отслеживается 1 команда',
  'integrations.linear.allTeams': 'Все публичные команды отслеживаются',
  'integrations.linear.pickTeams': 'Выбрать команды',
  'integrations.linear.close': 'Закрыть',
  'integrations.linear.live': 'Live',
  'integrations.linear.noWebhook': 'Нет webhook',
  'integrations.linear.uncheckAll': 'Снимите все галочки, чтобы следить за всеми публичными командами.',
  'integrations.linear.save': 'Сохранить',

  // Dashboard
  'dashboard.latest': 'Последнее',
  'dashboard.newSinceVisit': 'Новое с прошлого визита',
  'dashboard.nothingNew': 'Ничего нового с прошлого визита.',
  'dashboard.moreInActivity': '+{count} ещё в «Активности» ниже',
  'dashboard.noChangesYet': 'Пока нет изменений',
  'dashboard.connectToTrack': ', чтобы начать отслеживать проект.',
  'dashboard.connectIntegration': 'Подключите интеграцию',
  'dashboard.noChangesPeriod': 'Нет изменений за последние {period}.',
  'dashboard.connectToSeeState': 'Подключите интеграцию, чтобы увидеть текущее состояние.',
  'dashboard.connectToSeeChanges': 'Подключите интеграцию, чтобы увидеть изменения.',
  'dashboard.activity': 'Активность',
  'dashboard.needsAttention': 'Требует внимания',
  'dashboard.needsAttentionCount': 'Требуют решения: {count}',
  'dashboard.decisionNeeds': 'решение требует',
  'dashboard.decisionsNeed': 'решений требуют',
  'dashboard.noIssues': 'Нет вопросов на проверку.',
  'dashboard.current': 'Сейчас',
  'dashboard.previousState': 'Предыдущее состояние',
  'dashboard.whyCurrentState': 'Почему это текущее состояние',
  'dashboard.noReason': 'Без пояснения',
  'dashboard.originalMessage': 'Исходное сообщение',
  'dashboard.undo': 'Отменить',
  'dashboard.updating': 'Обновление…',
  'dashboard.resolved': 'Решено',
  'dashboard.needsDecision': 'Нужно решение',
  'dashboard.areas': 'областей',
  'dashboard.approved': 'подтверждено',
  'dashboard.needReview': 'на ревью',
  'dashboard.new': 'новых',
  'dashboard.pending': 'в ожидании',
  'dashboard.sinceLastVisit': 'с прошлого визита',
  'dashboard.updated': 'Обновлено',
  'dashboard.createFirst': 'Создайте первый проект',
  'dashboard.seeExample': 'Посмотреть живой пример',
  'dashboard.preparingSample': 'Готовим пример проекта…',
  'dashboard.7d': '7 дней',
  'dashboard.30d': '30 дней',
  'dashboard.all': 'Всё время',
  'dashboard.periodAll': 'Все',
  'dashboard.justNow': 'только что',
  'dashboard.minAgo': '{m} мин назад',
  'dashboard.hAgo': '{h} ч назад',
  'dashboard.dAgo': '{d} дн назад',
  'dashboard.showMore': 'Показать ещё {count}',
  'dashboard.showLess': 'Свернуть',
  'dashboard.viewSource': 'Открыть источник',
  'dashboard.emptyProjectText': 'Собирает решения и изменения из рабочих инструментов и держит состояние проекта актуальным.',
  'dashboard.accept': 'Принять',
  'dashboard.keepAsIs': 'Оставить как есть',
  'dashboard.notSure': 'Не уверен',
  'dashboard.confidence': 'Уверенность {confidence}%',
  'dashboard.change': 'изменение',
  'dashboard.changes': 'изменений',
  'dashboard.peopleInvolved': 'участников',
  // Plural forms joined by | — one|few|many
  'plural.change': 'изменение|изменения|изменений',
  'plural.person': 'участник|участника|участников',
  'plural.area': 'область|области|областей',

  // Dashboard — state/conflict labels
  'state.approved': 'Подтверждено',
  'state.added': 'Новое',
  'state.modify': 'Нужен ревью',
  'state.modified': 'Нужен ревью',
  'state.removed': 'Решение не принято',
  'conflict.state_change': 'Нет финального решения',
  'conflict.contradiction': 'Конфликт решений',
  'conflict.scope_change': 'Изменение объёма',
  'conflict.scope_question': 'Вопрос по объёму',
  'conflict.missing_confirmation': 'Не подтверждено',
};

const dicts: Record<string, Dict> = { en, ru };

export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = getLocale();
  let s = dicts[locale]?.[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

// Look up plural forms from the dictionary: 'plural.change' → 'change|changes|changes'
export function tp(n: number, key: string): string {
  const forms = t(key).split('|') as [string, string, string];
  return plural(n, forms);
}

// Russian plurals need three forms (1 участник, 3 участника, 5 участников).
// English uses the first two forms (one/other).
export function plural(n: number, forms: [one: string, few: string, many: string]): string {
  if (getLocale() !== 'ru') return n === 1 ? forms[0] : forms[1];
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export { getLocale };
