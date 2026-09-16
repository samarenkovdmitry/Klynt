# Подробная инструкция по настройке Klynt

## Шаг 1: Настройка Supabase

### 1.1 Создание проекта
1. Перейди на [supabase.com](https://supabase.com)
2. Нажми "Start your project"
3. Войди через GitHub (рекомендуется)
4. Нажми "New Project"
5. Заполни форму:
   - **Name**: `klynt` (или другое имя по твоему выбору)
   - **Database Password**: создай надёжный пароль и **сохрани его**
   - **Region**: выбери регион ближе к твоим пользователям (например, Frankfurt для Европы)
   - **Pricing Plan**: выбери Free (для начала)
6. Нажми "Create new project"
7. Подожди ~2 минуты пока проект создастся

### 1.2 Получение API ключей
1. Когда проект будет готов, перейди в **Settings** → **API**
2. Скопируй два значения:
   - **Project URL**: что-то вроде `https://xxxxxxxxxxxxx.supabase.co`
   - **service_role key**: длинный ключ начинающийся с `eyJ...`
3. **Важно**: service_role ключ даёт полный доступ к базе данных, храни его безопасно

### 1.3 Применение миграции базы данных
1. В Supabase dashboard перейди в **SQL Editor** (иконка SQL в левом меню)
2. Создай новый запрос (кнопка "New query")
3. Открой файл `supabase/migrations/20260908_klynt_core_schema.sql` в проекте
4. Скопируй весь SQL код из файла
5. Вставь в SQL Editor
6. Нажми "Run" (или Ctrl+Enter)
7. Убедись что в выводе нет ошибок (должен быть "Success. No rows returned")
8. Проверь что таблицы создались:
   - Перейди в **Table Editor** (иконка таблицы в левом меню)
   - Должны быть таблицы: `projects`, `project_members`, `integrations`, `raw_events`, `candidate_events`, `project_facts`, `fact_history`, `fact_evidence`, `conflicts`, `entities`

### 1.4 Настройка environment variables
1. Открой файл `.env.local` в корне проекта
2. Добавь (или обнови) следующие переменные:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://твой-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ-твой-длинный-ключ
```

## Шаг 2: Настройка Anthropic (Claude)

### 2.1 Создание API ключа
**Примечание:** Если у тебя уже есть Anthropic API ключ от текущего проекта UX Auditor, можешь использовать его же.

1. Перейди на [console.anthropic.com](https://console.anthropic.com)
2. Войди или создай аккаунт
3. Перейди в **API Keys** (в левом меню)
4. Нажми "Create Key"
5. Дай ключу имя (например, "Klynt Production")
6. **Скопируй ключ сразу** - он больше не будет показан
7. Ключ будет выглядеть как `sk-ant-...`

### 2.2 Добавление в environment variables
Добавь в `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-твой-ключ
```

**Почему Claude Haiku:**
- Используем модель Claude Haiku для интерпретации событий
- Это дешевле чем Sonnet и отлично подходит для таких задач
- ~$0.25 per 1M input tokens (дешевле чем GPT-4o-mini)
- Тебе уже familiar с Anthropic API

## Шаг 3: Настройка Figma OAuth

### 3.1 Создание OAuth приложения
1. Перейди на [Figma Developer Portal](https://www.figma.com/developers)
2. Войди в свой Figma аккаунт
3. Нажми "New App"
4. Заполни форму:
   - **App Name**: `Klynt`
   - **App Description**: `Project Truth Layer for design teams`
   - **Callback URL**: `https://klynt.one/api/integrations/figma/callback`
   - **Permissions** (OAuth scopes):
     - ✅ `file_comments:read` - чтение комментариев
     - ✅ `file_versions:read` - чтение версий файлов
5. Нажми "Save"
6. Скопируй:
   - **Client ID** (Figma Client ID)
   - **Client Secret** (Figma Client Secret)

### 3.2 Добавление в environment variables
Добавь в `.env.local`:
```bash
FIGMA_CLIENT_ID=твой-figma-client-id
FIGMA_CLIENT_SECRET=твой-figma-client-secret
FIGMA_REDIRECT_URI=https://klynt.one/api/integrations/figma/callback
FIGMA_WEBHOOK_PASSCODE=сгенерируй-случайную-строку-минимум-20-символов
```

**Совет для FIGMA_WEBHOOK_PASSCODE**: сгенерируй случайную строку, например:
```bash
openssl rand -base64 32
```

## Шаг 4: Настройка Slack OAuth

### 4.1 Создание Slack приложения
1. Перейди на [api.slack.com/apps](https://api.slack.com/apps)
2. Нажми "Create New App"
3. Выбери "From scratch"
4. Заполни форму:
   - **App Name**: `Klynt`
   - **Pick a workspace**: выбери твой Slack workspace
5. Нажми "Create App"

### 4.2 Настройка OAuth & Permissions
1. В левом меню выбери **OAuth & Permissions**
2. **Redirect URLs**:
   - Нажми "Add New Redirect URL"
   - Добавь: `https://klynt.one/api/integrations/slack/callback`
   - Нажми "Add"

3. **Scopes** (Bot Token Scopes):
   - В разделе "Bot Token Scopes" добавь:
     - `channels:history` - чтение истории публичных каналов
     - `groups:history` - чтение истории приватных каналов
     - `im:history` - чтение истории direct messages
     - `mpim:history` - чтение истории group DMs

4. **Scopes** (User Token Scopes):
   - В разделе "User Token Scopes" добавь:
     - `channels:read` - чтение информации о каналах
     - `groups:read` - чтение информации о группах
     - `im:read` - чтение информации о DM
     - `mpim:read` - чтение информации о group DMs

### 4.3 Получение ключей
1. Прокрути вверх до раздела "OAuth Tokens for Your Workspace"
2. Нажми "Install to Workspace"
3. Разреши доступ (может потребоваться подтверждение от админа workspace)
4. После установки скопируй:
   - **Bot User OAuth Token** (начинается с `xoxb-`)
   - **Signing Secret** (в разделе Basic Information → App Credentials)

### 4.4 Настройка Events API
1. В левом меню выбери **Event Subscriptions**
2. Включи "Enable Events"
3. **Request URL**: `https://klynt.one/api/webhooks/slack`
4. Slack отправит verification request — убедись что сервер запущен
5. **Subscribe to bot events**:
   - Добавь: `message.channels`
   - Добавь: `message.groups`
   - Добавь: `message.im`
   - Добавь: `message.mpim`

### 4.5 Добавление в environment variables
Добавь в `.env.local`:
```bash
SLACK_CLIENT_ID=твой-slack-client-id
SLACK_CLIENT_SECRET=твой-slack-client-secret
SLACK_REDIRECT_URI=https://klynt.one/api/integrations/slack/callback
SLACK_SIGNING_SECRET=твой-slack-signing-secret
```

## Шаг 5: Создание тестового проекта

### 5.1 Создание проекта в базе данных
1. В Supabase dashboard перейди в **SQL Editor**
2. Выполни следующий SQL:
```sql
INSERT INTO projects (name, description)
VALUES ('Test Project', 'Initial test project for Klynt development')
RETURNING id;
```

3. Скопируй возвращённый `id` (UUID)

### 5.2 Добавление в environment variables
Добавь в `.env.local`:
```bash
DEFAULT_PROJECT_ID=скопированный-uuid
```

## Шаг 6: Тестирование

### 6.1 Проверка подключения к базе данных
1. Запусти dev сервер: `npm run dev`
2. Если нет ошибок подключения к Supabase — отлично!

### 6.2 Тест создания проекта (через API)
Когда будет готово API для управления проектами, сможешь создать проект через UI.

### 6.3 Тест webhook endpoints
После настройки OAuth можно будет тестировать реальные webhooks.

## Проверочный список

Перед тем как продолжить, убедись что:

- [ ] Supabase проект создан с именем `klynt-prod` и миграция применена
- [ ] API ключи Supabase добавлены в `.env.local`
- [ ] Anthropic API ключ добавлен в `.env.local` (можешь использовать существующий от UX Auditor)
- [ ] Figma OAuth app создан, ключи добавлены
- [ ] Slack app создан, ключи добавлены
- [ ] Тестовый проект создан в базе данных
- [ ] DEFAULT_PROJECT_ID добавлен в `.env.local`
- [ ] Dev сервер запускается без ошибок

## Безопасность

**Важно:**
- Никогда не коммить `.env.local` в git
- Используй разные ключи для development и production
- Регулярно меняй webhook passcodes
- Ограничивай права OAuth приложений минимумом необходимым

## Следующие шаги

После завершения настройки:
1. Сообщи что готово
2. Я реализую OAuth flows для подключения интеграций
3. Создам UI для управления проектами
4. Протестируем end-to-end pipeline
