import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";

function buildBetaConfirmationContent() {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);

  const text = [
    "Hey,",
    "",
    "You're on the Klynt beta list.",
    "",
    "Klynt keeps track of what is actually true in your project —",
    "it collects meaningful changes from Figma, Slack and docs,",
    "and turns them into a current state you can read in 30 seconds.",
    "",
    "We'll reach out as soon as your invite is ready.",
    "",
    "— Dmitry",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
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
                <p style="margin:0 0 16px;">Hey,</p>
                <p style="margin:0 0 16px;">You're on the Klynt beta list.</p>
                <p style="margin:0 0 16px;">Klynt keeps track of what is actually true in your project — it collects meaningful changes from Figma, Slack and docs, and turns them into a current state you can read in 30 seconds.</p>
                <p style="margin:0 0 16px;">We'll reach out as soon as your invite is ready.</p>
                <p style="margin:0;">— Dmitry</p>
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

export async function sendBetaConfirmationEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY in the environment."
    );
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildBetaConfirmationContent();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "You're on the Klynt beta list",
      text,
      html,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to send email.");
  }
}
