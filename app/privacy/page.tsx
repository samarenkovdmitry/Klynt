import { getLocale } from "@/lib/market";
import {
  LegalDocumentPage,
  LegalSection,
  type LegalSectionNav,
} from "@/components/LegalDocumentPage";

const ru = getLocale() === "ru";

const SECTIONS: LegalSectionNav[] = ru
  ? [
      { id: "introduction", title: "Введение" },
      { id: "information-we-collect", title: "Какие данные мы собираем" },
      { id: "connected-data", title: "Данные подключённых сервисов" },
      { id: "how-we-use", title: "Как мы используем данные" },
      { id: "ai-processing", title: "Обработка с помощью ИИ" },
      { id: "legal-bases", title: "Правовые основания" },
      { id: "storage-retention", title: "Хранение и сроки" },
      { id: "sharing", title: "Передача данных" },
      { id: "cookies-analytics", title: "Cookies и аналитика" },
      { id: "your-rights", title: "Ваши права" },
      { id: "children", title: "Дети" },
      { id: "changes", title: "Изменения политики" },
      { id: "contact", title: "Контакты" },
    ]
  : [
      { id: "introduction", title: "Introduction" },
      { id: "information-we-collect", title: "Information we collect" },
      { id: "connected-data", title: "Connected workspace data" },
      { id: "how-we-use", title: "How we use information" },
      { id: "ai-processing", title: "AI processing" },
      { id: "legal-bases", title: "Legal bases" },
      { id: "storage-retention", title: "Storage & retention" },
      { id: "sharing", title: "Sharing" },
      { id: "cookies-analytics", title: "Cookies & analytics" },
      { id: "your-rights", title: "Your rights" },
      { id: "children", title: "Children" },
      { id: "changes", title: "Changes" },
      { id: "contact", title: "Contact" },
    ];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title={ru ? "Политика конфиденциальности" : "Privacy Policy"}
      lastUpdated={ru ? "20 сентября 2026 г." : "September 20, 2026"}
      sections={SECTIONS}
    >
      {ru ? <RuPrivacy /> : <EnPrivacy />}
    </LegalDocumentPage>
  );
}

function RuPrivacy() {
  return (
    <>
      <LegalSection id="introduction" title="Введение">
        <p>
          Klynt (&laquo;Klynt&raquo;, &laquo;мы&raquo;) — сервис на klynt.ru,
          слой правды о проекте: он подключается к инструментам вроде Figma и
          Telegram, собирает значимые изменения и поддерживает актуальное
          состояние проекта. Эта Политика конфиденциальности объясняет, какую
          информацию мы собираем, как её используем и какие у вас есть
          варианты.
        </p>
        <p>
          Используя Klynt, вы соглашаетесь на сбор и использование информации в
          соответствии с этой политикой. Если вы не согласны, пожалуйста, не
          используйте Сервис.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Какие данные мы собираем">
        <p>В зависимости от того, как вы пользуетесь Klynt, мы можем обрабатывать:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Данные аккаунта
            </strong>{" "}
            — адрес электронной почты и данные для входа при регистрации и
            авторизации;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Данные проектов
            </strong>{" "}
            — созданные вами проекты, их названия и настройки, а также факты,
            интерпретации и обнаруженные противоречия, которые Сервис для них
            формирует;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Контактные данные
            </strong>{" "}
            — имя, адрес почты и содержимое сообщения, когда вы пишете нам;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Данные листа ожидания
            </strong>{" "}
            — адрес почты, если вы записались на бета-доступ;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Данные об использовании и устройстве
            </strong>{" "}
            — обобщённая аналитика: посещённые страницы, источник перехода, тип
            браузера и примерная геолокация (страна/регион);
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Технические логи
            </strong>{" "}
            — IP-адрес, время запросов и логи ошибок, которые хранятся
            недолго ради безопасности, защиты от злоупотреблений и стабильности
            Сервиса.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="connected-data" title="Данные подключённых сервисов">
        <p>
          Подключая интеграцию, вы даёте Klynt доступ к части этого рабочего
          пространства, чтобы Сервис мог находить значимые изменения в проекте.
          Сейчас это:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Figma
            </strong>{" "}
            — активность в файлах: сохранённые версии, комментарии и связанные
            метаданные (названия файлов, имена пользователей);
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Telegram
            </strong>{" "}
            — сообщения в подключённых чатах: текст, имена авторов и время
            отправки.
          </li>
        </ul>
        <p>
          Чтобы подключения работали, мы храним выданные Klynt токены доступа
          (в зашифрованном виде). Они позволяют Сервису читать данные из
          источников, пока вы не отключите интеграцию.
        </p>
        <p>
          Контент из подключённых сервисов обрабатывается для обнаружения
          событий проекта и обновления его состояния. Мы не используем его для
          рекламы и не продаём.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="Как мы используем данные">
        <p>Собранная информация нужна нам, чтобы:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            получать события из подключённых инструментов и поддерживать
            актуальное состояние вашего проекта;
          </li>
          <li>обеспечивать работу, поддержку и развитие Сервиса;</li>
          <li>отвечать на обращения и запросы;</li>
          <li>
            отправлять подтверждения и новости продукта, на которые вы
            подписались;
          </li>
          <li>
            следить за производительностью, исправлять ошибки и предотвращать
            злоупотребления;
          </li>
          <li>выполнять требования законодательства.</li>
        </ul>
      </LegalSection>

      <LegalSection id="ai-processing" title="Обработка с помощью ИИ">
        <p>
          Чтобы определить, что изменилось и почему это важно, содержимое
          событий из подключённых источников передаётся нашему провайдеру ИИ
          (Anthropic) для автоматической интерпретации. Результат —
          классификация событий, факты и обнаруженные противоречия — хранится
          вместе с данными вашего проекта.
        </p>
        <p>
          Мы не используем контент ваших рабочих пространств для обучения
          собственных моделей, а провайдер ИИ обрабатывает его на условиях
          собственных правил работы с данными для API.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="Правовые основания">
        <p>
          Там, где законодательство о защите данных требует правового
          основания, мы опираемся на:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Договор / предоставление сервиса
            </strong>{" "}
            — чтобы оказывать Сервис, на который вы зарегистрировались, включая
            обработку данных подключённых пространств;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Законные интересы
            </strong>{" "}
            — чтобы защищать, улучшать и измерять Сервис с уважением к вашей
            конфиденциальности;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Согласие
            </strong>{" "}
            — там, где оно требуется для необязательных рассылок: листа
            ожидания и новостей продукта.
          </li>
        </ul>
        <p>
          Подключая рабочее пространство от имени команды или компании, вы
          отвечаете за наличие полномочий и необходимых уведомлений или согласий
          на передачу этих данных в Klynt.
        </p>
      </LegalSection>

      <LegalSection id="storage-retention" title="Хранение и сроки">
        <p>
          Данные аккаунта, проектов, события и производные данные хранятся в
          нашей базе данных (на инфраструктуре Supabase), пока ваш аккаунт
          активен.
        </p>
        <p>
          Отключение интеграции прекращает сбор новых данных из этого источника.
          Уже собранные события и факты могут сохраняться, пока вы не удалите
          проект или не попросите нас удалить данные. Токены доступа удаляются
          при отключении интеграции или удалении проекта.
        </p>
        <p>
          Обращения и адреса из листа ожидания хранятся ровно столько, сколько
          нужно для ответа, работы Сервиса или выполнения требований закона.
          Серверные логи хранятся ограниченное время для безопасности и
          диагностики.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Передача данных">
        <p>
          Мы передаём информацию только тем поставщикам, которые помогают
          работе Klynt:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Vercel
            </strong>{" "}
            — хостинг и доставка приложения;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Supabase
            </strong>{" "}
            — база данных и аутентификация;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Anthropic
            </strong>{" "}
            — интерпретация событий проекта с помощью ИИ;
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Resend
            </strong>{" "}
            — доставка транзакционных писем и писем листа ожидания.
          </li>
        </ul>
        <p>
          Эти провайдеры обрабатывают данные по нашему поручению, с
          договорными гарантиями и только для целей, описанных в этой политике.
        </p>
        <p>
          Мы также можем раскрыть информацию, если этого требует закон, для
          защиты наших прав или пользователей, либо в связи со слиянием,
          поглощением или продажей активов — с уведомлением там, где оно
          требуется.
        </p>
      </LegalSection>

      <LegalSection id="cookies-analytics" title="Cookies и аналитика">
        <p>
          Мы используем необходимые cookies для аутентификации и работы
          Сервиса, а также бережную к приватности аналитику (Vercel Analytics и
          Speed Insights) для понимания использования в обобщённом виде.
        </p>
        <p>
          Cookies можно контролировать в настройках браузера. Отключение
          необходимых cookies может помешать входу и базовым функциям.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Ваши права">
        <p>
          В зависимости от вашей страны вы можете иметь право запросить доступ
          к своим персональным данным, их исправление, удаление или ограничение
          обработки, а также возразить против отдельных видов обработки. Вы
          также можете подать жалобу в надзорный орган.
        </p>
        <p>
          Чтобы воспользоваться этими правами, напишите на{" "}
          <a
            href="mailto:hello@klynt.one"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            hello@klynt.one
          </a>
          . Прежде чем ответить, нам может понадобиться подтвердить вашу
          личность.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Дети">
        <p>
          Klynt не предназначен для детей младше 16 лет (или минимального
          возраста по законодательству вашей страны). Мы сознательно не собираем
          персональные данные детей. Если вы считаете, что ребёнок передал нам
          свои данные, напишите нам — мы примем меры для их удаления.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Изменения политики">
        <p>
          Мы можем время от времени обновлять эту Политику конфиденциальности.
          Дата последнего обновления вверху страницы показывает актуальную
          редакцию. Существенные изменения публикуются на этой странице.
          Продолжение использования Сервиса после их вступления в силу означает
          принятие обновлённой политики.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Контакты">
        <p>
          Вопросы по этой Политике конфиденциальности? Пишите на{" "}
          <a
            href="mailto:hello@klynt.one"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            hello@klynt.one
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}

function EnPrivacy() {
  return (
    <>
      <LegalSection id="introduction" title="Introduction">
        <p>
          Klynt (&ldquo;Klynt&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
          operates klynt.one, a project truth layer that connects to tools like
          Slack and Figma, collects meaningful changes, and keeps a current
          state of your project. This Privacy Policy explains what information
          we collect, how we use it, and the choices you have.
        </p>
        <p>
          By using Klynt, you agree to the collection and use of information in
          accordance with this policy. If you do not agree, please do not use
          the Service.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Information we collect">
        <p>Depending on how you use Klynt, we may process:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Account information
            </strong>{" "}
            — email address and authentication credentials when you register or
            log in
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Project data
            </strong>{" "}
            — projects you create, their names, settings, and the facts,
            interpretations, and conflict detections the Service derives for
            them
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Contact information
            </strong>{" "}
            — name, email address, and message content when you email us
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Waitlist information
            </strong>{" "}
            — email address if you join the beta waitlist
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Usage and device data
            </strong>{" "}
            — aggregated analytics such as pages visited, referrer, browser
            type, and general location (country/region)
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Technical logs
            </strong>{" "}
            — IP address, request timestamps, and error logs retained briefly
            for security, abuse prevention, and service reliability
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="connected-data" title="Connected workspace data">
        <p>
          When you connect an integration, you grant Klynt access to parts of
          that workspace so it can detect meaningful project changes. Currently:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Slack
            </strong>{" "}
            — messages and events in the channels you select, including message
            text, author names, and timestamps
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Figma
            </strong>{" "}
            — file activity such as version saves, comments, and related file
            metadata (file names, user handles)
          </li>
        </ul>
        <p>
          To keep these connections working, we store the OAuth access and
          refresh tokens issued to Klynt. These tokens let the Service read from
          the connected sources until you disconnect the integration.
        </p>
        <p>
          Content from connected services is processed to detect project events
          and update project state. We do not use it for advertising, and we do
          not sell it.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="How we use information">
        <p>We use collected information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Collect events from connected tools and maintain your project&apos;s
            current state
          </li>
          <li>Operate, maintain, and improve the Service</li>
          <li>Respond to contact and support requests</li>
          <li>Send waitlist confirmations and product updates you opt into</li>
          <li>Monitor performance, debug issues, and prevent abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="ai-processing" title="AI processing">
        <p>
          To interpret what changed and why it matters, event content from your
          connected sources is sent to our AI provider (Anthropic) for automated
          interpretation. The output — event classifications, facts, and
          detected conflicts — is stored with your project data.
        </p>
        <p>
          We do not use your connected workspace content to train our own
          models, and our AI provider processes it under its own data handling
          terms for API usage.
        </p>
      </LegalSection>

      <LegalSection id="legal-bases" title="Legal bases">
        <p>
          Where applicable data protection laws require a legal basis, we rely
          on:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Contract / service delivery
            </strong>{" "}
            — to provide the Service you signed up for, including processing the
            workspace data you connect
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Legitimate interests
            </strong>{" "}
            — to secure, improve, and measure the Service in a way that respects
            your privacy
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Consent
            </strong>{" "}
            — where required for optional communications such as waitlist and
            product emails
          </li>
        </ul>
        <p>
          When you connect a workspace on behalf of a team or company, you are
          responsible for having the authority and any required notices or
          consents to share that data with Klynt.
        </p>
      </LegalSection>

      <LegalSection id="storage-retention" title="Storage & retention">
        <p>
          Your account, project, event, and derived data are stored in our
          database (hosted by Supabase) while your account is active.
        </p>
        <p>
          Disconnecting an integration stops further collection from that
          source. Previously collected events and derived facts may remain until
          you delete the project or ask us to delete your data. OAuth tokens are
          removed when an integration is disconnected or the project is
          deleted.
        </p>
        <p>
          Contact form submissions and waitlist emails are retained only as long
          as needed to respond, operate the Service, or meet legal requirements.
          Server logs are kept for a limited period for security and
          diagnostics.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Sharing">
        <p>
          We share information only with service providers that help us operate
          Klynt:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Vercel
            </strong>{" "}
            — hosting and application delivery
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Supabase
            </strong>{" "}
            — database and authentication
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Anthropic
            </strong>{" "}
            — AI interpretation of project events
          </li>
          <li>
            <strong className="font-medium text-[var(--ink-primary)]">
              Resend
            </strong>{" "}
            — transactional and waitlist email delivery
          </li>
        </ul>
        <p>
          These providers process data on our behalf under contractual
          safeguards and only for the purposes described in this policy.
        </p>
        <p>
          We may also disclose information if required by law, to protect our
          rights or users, or in connection with a merger, acquisition, or sale
          of assets, with appropriate notice where required.
        </p>
      </LegalSection>

      <LegalSection id="cookies-analytics" title="Cookies & analytics">
        <p>
          We use essential cookies required for authentication and for the
          Service to function. We use privacy-focused analytics (Vercel
          Analytics and Speed Insights) to understand usage in aggregated form.
        </p>
        <p>
          You can control cookies through your browser settings. Disabling
          essential cookies may prevent sign-in and other core functionality.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="Your rights">
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, or restrict processing of your personal information, or to
          object to certain processing. You may also have the right to lodge a
          complaint with a supervisory authority.
        </p>
        <p>
          To exercise these rights, email{" "}
          <a
            href="mailto:hello@klynt.one"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            hello@klynt.one
          </a>
          . We may need to verify your request before responding.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          Klynt is not directed to children under 16 (or the minimum age
          required in your jurisdiction). We do not knowingly collect personal
          information from children. If you believe a child has provided us
          personal information, please contact us and we will take appropriate
          steps to delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page indicates when the policy
          was last revised. Material changes will be posted on this page.
          Continued use of the Service after changes become effective
          constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about this Privacy Policy? Email{" "}
          <a
            href="mailto:hello@klynt.one"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            hello@klynt.one
          </a>
          .
        </p>
      </LegalSection>
    </>
  );
}
