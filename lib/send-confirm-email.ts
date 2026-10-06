import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";
import { getLocale } from "@/lib/market";

function buildConfirmContent(confirmUrl: string) {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);
  const ru = getLocale() === "ru";

  const lines = ru
    ? {
        greeting: "Здравствуйте!",
        body: "Подтвердите адрес, чтобы завершить регистрацию в Klynt.",
        button: "Подтвердить почту",
        note: "Ссылка одноразовая.",
        fallback: "Или откройте ссылку:",
        sign: "— Klynt",
      }
    : {
        greeting: "Hey,",
        body: "Confirm your email to finish signing up for Klynt.",
        button: "Confirm email",
        note: "This link works once.",
        fallback: "Or paste this link:",
        sign: "— Klynt",
      };

  const text = [
    lines.greeting,
    "",
    lines.body,
    "",
    `${lines.button}: ${confirmUrl}`,
    "",
    lines.sign,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="${ru ? "ru" : "en"}">
  <body style="margin:0;padding:0;background:#F5F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1B17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F4EF;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(28,27,23,0.08);border-radius:20px;padding:32px 28px;">
            <tr>
              <td style="padding-bottom:24px;">
                ${logoHtml}
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;line-height:1.7;color:#1C1B17;">
                <p style="margin:0 0 16px;">${lines.greeting}</p>
                <p style="margin:0 0 24px;">${lines.body}</p>
                <p style="margin:0 0 24px;">
                  <a href="${confirmUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0F3D2E;color:#FFE79A;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:999px;">${lines.button}</a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;color:#8C887D;">${lines.note}</p>
                <p style="margin:0;font-size:13px;color:#8C887D;">${lines.fallback} ${confirmUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function sendConfirmEmail(email: string, confirmUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in the environment.");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildConfirmContent(confirmUrl);
  const ru = getLocale() === "ru";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: ru ? "Подтвердите почту — Klynt" : "Confirm your email — Klynt",
      text,
      html,
    }),
  });

  const json = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) {
    throw new Error(json?.message || "Failed to send email.");
  }
}
