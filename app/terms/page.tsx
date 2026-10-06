import Link from "next/link";
import { getLocale } from "@/lib/market";
import {
  LegalDocumentPage,
  LegalSection,
  type LegalSectionNav,
} from "@/components/LegalDocumentPage";

const ru = getLocale() === "ru";

const SECTIONS: LegalSectionNav[] = ru
  ? [
      { id: "agreement", title: "Соглашение" },
      { id: "service", title: "Сервис" },
      { id: "accounts", title: "Аккаунты и требования" },
      { id: "connected-services", title: "Подключаемые сервисы" },
      { id: "acceptable-use", title: "Допустимое использование" },
      { id: "ai-disclaimer", title: "Результаты ИИ" },
      { id: "your-data", title: "Ваши данные" },
      { id: "intellectual-property", title: "Интеллектуальная собственность" },
      { id: "disclaimer", title: "Отказ от гарантий" },
      { id: "limitation", title: "Ограничение ответственности" },
      { id: "indemnification", title: "Возмещение убытков" },
      { id: "termination", title: "Прекращение" },
      { id: "changes", title: "Изменения условий" },
      { id: "governing-law", title: "Применимое право" },
      { id: "contact", title: "Контакты" },
    ]
  : [
      { id: "agreement", title: "Agreement" },
      { id: "service", title: "The Service" },
      { id: "accounts", title: "Accounts & eligibility" },
      { id: "connected-services", title: "Connected services" },
      { id: "acceptable-use", title: "Acceptable use" },
      { id: "ai-disclaimer", title: "AI disclaimer" },
      { id: "your-data", title: "Your data" },
      { id: "intellectual-property", title: "Intellectual property" },
      { id: "disclaimer", title: "Disclaimer" },
      { id: "limitation", title: "Limitation of liability" },
      { id: "indemnification", title: "Indemnification" },
      { id: "termination", title: "Termination" },
      { id: "changes", title: "Changes" },
      { id: "governing-law", title: "Governing law" },
      { id: "contact", title: "Contact" },
    ];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title={ru ? "Условия использования" : "Terms of Service"}
      lastUpdated={ru ? "20 сентября 2026 г." : "September 20, 2026"}
      sections={SECTIONS}
    >
      {ru ? <RuTerms /> : <EnTerms />}
    </LegalDocumentPage>
  );
}

function RuTerms() {
  return (
    <>
      <LegalSection id="agreement" title="Соглашение">
        <p>
          Настоящие Условия использования (&laquo;Условия&raquo;) регулируют
          доступ к сервису Klynt на klynt.ru (&laquo;Сервис&raquo;) и его
          использование. Создавая аккаунт или используя Сервис, вы принимаете
          эти Условия. Если вы с ними не согласны, не используйте Сервис.
        </p>
      </LegalSection>

      <LegalSection id="service" title="Сервис">
        <p>
          Klynt — слой правды о проекте. Он подключается к инструментам,
          которыми вы уже пользуетесь — например, к Figma и Telegram, — собирает
          значимые изменения, интерпретирует их с помощью ИИ и поддерживает
          актуальное состояние проекта: что изменилось, что согласовано, что не
          решено и где новая информация противоречит ранним решениям.
        </p>
        <p>
          Сервис находится в закрытой бете. Функции могут меняться, добавляться
          и исчезать в любой момент, а доступность и качество могут варьироваться
          по мере развития продукта.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Аккаунты и требования">
        <p>
          Для использования Сервиса вам должно быть не менее 16 лет (или
          минимальный возраст, установленный законодательством вашей страны). Вы
          отвечаете за сохранность данных для входа и за все действия,
          совершаемые в вашем аккаунте.
        </p>
        <p>
          Если вы подключаете рабочее пространство или проект от имени компании
          или команды, вы подтверждаете, что уполномочены это делать и
          предоставлять Сервису запрашиваемый доступ.
        </p>
      </LegalSection>

      <LegalSection id="connected-services" title="Подключаемые сервисы">
        <p>
          Сервис работает за счёт подключаемых сторонних сервисов — сейчас это
          Figma и Telegram, позже появятся другие. Подключая аккаунт, вы даёте
          Klynt доступ к тому контенту и событиям, которые выбираете сами
          (например, к сообщениям в подключённых чатах или к активности в файлах
          Figma), чтобы Сервис мог находить и интерпретировать изменения в
          проекте.
        </p>
        <p>
          Использование этих сторонних сервисов по-прежнему регулируется их
          собственными условиями и политиками конфиденциальности. Подключайте
          только те рабочие пространства и файлы, которыми вправе делиться.
          Интеграцию можно отключить в любой момент — сбор данных из этого
          источника прекратится.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Допустимое использование">
        <p>Вы соглашаетесь не:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            использовать Сервис в незаконных целях или для нарушения прав других
            лиц;
          </li>
          <li>
            подключать рабочие пространства, чаты и файлы, которыми у вас нет
            права делиться, и обрабатывать через Сервис чужие персональные
            данные без законного основания;
          </li>
          <li>
            пытаться нарушить работу Сервиса, перегрузить его, копировать,
            исследовать его устройство или обходить меры защиты;
          </li>
          <li>
            получать доступ к проектам и данным других пользователей без
            разрешения;
          </li>
          <li>
            выдавать интерпретации, сформированные ИИ, за проверенные факты,
            экспертную оценку или юридическую/деловую консультацию без
            соответствующей оговорки.
          </li>
        </ul>
        <p>
          Мы можем ограничить или приостановить доступ, если есть основания
          считать, что вы нарушили эти Условия или используете Сервис во вред.
        </p>
      </LegalSection>

      <LegalSection id="ai-disclaimer" title="Результаты ИИ">
        <p>
          Состояние проекта, интерпретации, сводки и обнаруженные противоречия
          формируются искусственным интеллектом на основе собранных событий.
          Результат может быть неполным, запаздывать или содержать ошибки —
          например, пропустить важное изменение или неверно оценить его
          значимость.
        </p>
        <p>
          Сервис — помощник для ориентации в проекте, а не система записи.
          Важные решения, согласования и противоречия проверяйте по исходным
          источникам, прежде чем действовать.
        </p>
      </LegalSection>

      <LegalSection id="your-data" title="Ваши данные">
        <p>
          Права на контент, к которому Klynt получает доступ через подключённые
          сервисы, и на данные проектов в вашем аккаунте остаются за вами. Вы
          предоставляете нам ограниченную неисключительную лицензию на обработку
          этого контента исключительно для работы и улучшения Сервиса — включая
          передачу событий нашему провайдеру ИИ для интерпретации.
        </p>
        <p>
          Как мы собираем, храним и используем информацию, описано в{" "}
          <Link
            href="/privacy"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            Политике конфиденциальности
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Интеллектуальная собственность">
        <p>
          Название Klynt, бренд, сайт, программное обеспечение и связанные с
          ними материалы принадлежат нам или нашим лицензиарам и защищены
          законодательством об интеллектуальной собственности. Эти Условия не
          дают вам права использовать наш бренд, кроме как в объёме, необходимом
          для использования Сервиса по назначению.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="Отказ от гарантий">
        <p>
          Сервис предоставляется &laquo;как есть&raquo; и &laquo;по мере
          доступности&raquo;, без каких-либо явных или подразумеваемых гарантий,
          включая гарантии пригодности для конкретной цели и ненарушения прав.
        </p>
        <p>
          Мы не гарантируем, что Сервис будет работать бесперебойно, без ошибок
          и безопасно, что он обнаружит каждое значимое изменение или что
          интерпретации, сводки и найденные противоречия будут точными и
          полными.
        </p>
      </LegalSection>

      <LegalSection id="limitation" title="Ограничение ответственности">
        <p>
          В максимальном объёме, допустимом законом, Klynt, его операторы и
          поставщики не несут ответственности за косвенные, случайные, штрафные
          или последующие убытки, а также за упущенную выгоду, потерю данных,
          репутации или деловых возможностей, возникшие в результате
          использования Сервиса, — включая доверие к результатам ИИ и пропущенные
          события.
        </p>
        <p>
          Наша совокупная ответственность по любым претензиям, связанным с
          Сервисом, не превышает большей из двух величин: суммы, уплаченной вами
          за Сервис за двенадцать месяцев до претензии, или 100 долларов США.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="Возмещение убытков">
        <p>
          Вы соглашаетесь возместить Klynt и его операторам убытки, расходы и
          претензии (включая разумные расходы на юристов), возникшие из-за
          вашего использования Сервиса, подключённых вами данных и рабочих
          пространств, а также из-за нарушения этих Условий или применимого
          законодательства.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Прекращение">
        <p>
          Вы можете прекратить использование Сервиса и отключить интеграции в
          любой момент. Мы можем приостановить или прекратить доступ — с
          уведомлением или без — если вы нарушаете Условия, создаёте риски или
          юридическую нагрузку для нас либо если мы прекращаем работу Сервиса.
        </p>
        <p>
          Положения, которые по своей природе должны действовать после
          прекращения, — включая отказ от гарантий, ограничение ответственности
          и возмещение убытков — продолжают действовать.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Изменения условий">
        <p>
          Мы можем обновлять эти Условия, публикуя новую версию на этой
          странице. Дата последнего обновления отражает актуальную редакцию.
          Существенные изменения вступают в силу с момента публикации, если не
          указано иное. Продолжение использования Сервиса после вступления
          изменений в силу означает принятие обновлённых Условий.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Применимое право">
        <p>
          Условия регулируются применимым законодательством юрисдикции, в
          которой работает Klynt, без учёта коллизионных норм. Если какое-либо
          положение будет признано недействительным, остальные сохраняют силу в
          полном объёме.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Контакты">
        <p>
          Вопросы по этим Условиям? Пишите на{" "}
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

function EnTerms() {
  return (
    <>
      <LegalSection id="agreement" title="Agreement">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of Klynt at klynt.one (the &ldquo;Service&rdquo;). By creating an
          account or using the Service, you agree to these Terms. If you do not
          agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="The Service">
        <p>
          Klynt is a project truth layer. It connects to tools you already use —
          such as Slack and Figma — collects the changes that carry meaning,
          interprets them using AI, and maintains a current state of your
          project: what changed, what is approved, what is unresolved, and where
          new information contradicts earlier decisions.
        </p>
        <p>
          The Service is currently in closed beta. Features may change, be
          added, or be removed at any time, and availability or quality may vary
          while we iterate.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Accounts & eligibility">
        <p>
          You must be at least 16 years old (or the minimum age required in your
          jurisdiction) to use the Service. You are responsible for keeping your
          account credentials confidential and for all activity under your
          account.
        </p>
        <p>
          If you connect a workspace or project on behalf of a company or team,
          you represent that you are authorized to do so and to grant the access
          the Service requests.
        </p>
      </LegalSection>

      <LegalSection id="connected-services" title="Connected services">
        <p>
          The Service relies on third-party services you connect — currently
          Slack and Figma, with others planned. When you connect an account, you
          grant Klynt access to the content and events you configure (for
          example, messages in selected Slack channels or activity in connected
          Figma files) so it can detect and interpret project changes.
        </p>
        <p>
          Your use of those third-party services remains governed by their own
          terms and privacy policies. Only connect workspaces and files you have
          the right to share. You can disconnect an integration at any time,
          which stops further collection from that source.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the Service for unlawful purposes or to violate others&apos; rights</li>
          <li>
            Connect workspaces, channels, or files you do not have permission to
            share, or use the Service to process other people&apos;s private
            data without a lawful basis
          </li>
          <li>
            Attempt to disrupt, overload, scrape, reverse engineer, or
            circumvent the Service or its security controls
          </li>
          <li>
            Access projects or data belonging to other users without
            authorization
          </li>
          <li>
            Misrepresent AI-generated interpretations as verified facts, human
            expert review, or legal/business advice without appropriate
            disclosure
          </li>
        </ul>
        <p>
          We may suspend or restrict access if we reasonably believe you have
          violated these Terms or used the Service in a harmful way.
        </p>
      </LegalSection>

      <LegalSection id="ai-disclaimer" title="AI disclaimer">
        <p>
          Project state, interpretations, summaries, and conflict detections are
          generated by artificial intelligence from the content of events Klynt
          collects. AI output can be incomplete, delayed, or wrong — including
          missing a meaningful change or misreading its importance.
        </p>
        <p>
          The Service is an aid to awareness, not a system of record. You are
          responsible for verifying important decisions, approvals, and
          contradictions against the original sources before acting on them.
        </p>
      </LegalSection>

      <LegalSection id="your-data" title="Your data">
        <p>
          You retain ownership of the content Klynt accesses through your
          connected services and of the project data in your account. You grant
          us a limited, non-exclusive license to process that content solely to
          operate, provide, and improve the Service — including sending event
          content to our AI provider for interpretation.
        </p>
        <p>
          How we collect, store, and use information is described in our{" "}
          <Link
            href="/privacy"
            className="font-medium text-[var(--accent-link)] hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="Intellectual property">
        <p>
          The Klynt name, brand, website, software, and related materials are
          owned by us or our licensors and are protected by applicable
          intellectual property laws. These Terms do not grant you any right to
          use our branding except as needed to use the Service as intended.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="Disclaimer">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
          IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
          A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that the Service will be uninterrupted, error-free,
          or secure, that it will detect every meaningful change, or that
          interpretations, summaries, and detected conflicts will be accurate or
          complete.
        </p>
      </LegalSection>

      <LegalSection id="limitation" title="Limitation of liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, KLYNT AND ITS OPERATORS,
          AFFILIATES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
          OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES ARISING
          FROM YOUR USE OF THE SERVICE — INCLUDING RELIANCE ON AI-GENERATED
          INTERPRETATIONS OR MISSED EVENTS.
        </p>
        <p>
          Our total liability for any claim relating to the Service will not
          exceed the greater of (a) the amount you paid us for the Service in
          the twelve months before the claim, or (b) USD $100.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Klynt and its operators from
          any claims, damages, losses, or expenses (including reasonable legal
          fees) arising from your use of the Service, content or workspaces you
          connect, or your violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Termination">
        <p>
          You may stop using the Service and disconnect integrations at any
          time. We may suspend or terminate access, with or without notice, if
          you violate these Terms, create risk or legal exposure for us, or if
          we discontinue the Service.
        </p>
        <p>
          Sections that by their nature should survive termination — including
          disclaimers, limitations of liability, and indemnification — will
          survive.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may modify these Terms by posting an updated version on this page.
          The &ldquo;Last updated&rdquo; date will reflect the latest revision.
          Material changes take effect when posted unless stated otherwise.
          Continued use after changes become effective means you accept the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing law">
        <p>
          These Terms are governed by applicable law in the jurisdiction where
          Klynt operates, without regard to conflict-of-law principles. If any
          provision is found unenforceable, the remaining provisions remain in
          full force and effect.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these Terms? Email{" "}
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
