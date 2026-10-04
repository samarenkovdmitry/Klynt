import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";

function buildBetaAccessContent(accessUrl: string) {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);

  const text = [
    "Hey,",
    "",
    "Your Klynt workspace is ready.",
    "",
    "We set up a sample project so you can see how Klynt reads a",
    "project's current state — what changed, what's approved, and",
    "what's still unresolved.",
    "",
    `Open Klynt: ${accessUrl}`,
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
                <p style="margin:0 0 16px;">Your Klynt workspace is ready.</p>
                <p style="margin:0 0 16px;">We set up a sample project so you can see how Klynt reads a project's current state — what changed, what's approved, and what's still unresolved.</p>
                <p style="margin:0 0 24px;">
                  <a href="${accessUrl}" style="display:inline-block;background:#1C1B17;color:#F5F4EF;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:15px;font-weight:500;">Open Klynt</a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#6B675F;">This link signs you in instantly — no password needed.</p>
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

export async function sendBetaAccessEmail(email: string, accessUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY in the environment."
    );
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildBetaAccessContent(accessUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Klynt workspace is ready",
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
