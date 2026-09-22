import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";
import type { ProjectSummary } from "@/lib/ai/summary-generator";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildDigestContent(
  projectName: string,
  summary: ProjectSummary,
  projectUrl: string,
) {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);
  const safeName = escapeHtml(projectName);

  const bulletsText = summary.bullets.map((b) => `• ${b}`).join("\n");
  const attentionText =
    summary.needsAttention.length > 0
      ? `\nNeeds attention:\n${summary.needsAttention.map((a) => `• ${a}`).join("\n")}`
      : "";

  const text = [
    `${projectName} — what changed`,
    "",
    summary.headline,
    "",
    bulletsText,
    attentionText,
    "",
    `Open project: ${projectUrl}`,
    "",
    "— Klynt",
  ].join("\n");

  const bulletsHtml = summary.bullets
    .map((b) => `<li style="margin:0 0 8px;">${escapeHtml(b)}</li>`)
    .join("");

  const attentionHtml =
    summary.needsAttention.length > 0
      ? `<p style="margin:20px 0 8px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#A34A28;">Needs attention</p>
         <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#1C1B17;">
           ${summary.needsAttention.map((a) => `<li style="margin:0 0 8px;">${escapeHtml(a)}</li>`).join("")}
         </ul>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#F5F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1B17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F4EF;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(28,27,23,0.08);border-radius:20px;padding:32px 28px;">
            <tr>
              <td style="padding-bottom:20px;">
                ${logoHtml}
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#8C887D;padding-bottom:8px;">
                ${safeName} — daily digest
              </td>
            </tr>
            <tr>
              <td style="font-size:20px;font-weight:600;line-height:1.4;color:#1C1B17;padding-bottom:20px;">
                ${escapeHtml(summary.headline)}
              </td>
            </tr>
            <tr>
              <td>
                <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#1C1B17;">
                  ${bulletsHtml}
                </ul>
                ${attentionHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;">
                <a href="${projectUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0F3D2E;color:#FFE79A;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:999px;">Open project</a>
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

export async function sendDigestEmail(
  email: string,
  projectName: string,
  summary: ProjectSummary,
  projectUrl: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in the environment.");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildDigestContent(projectName, summary, projectUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${projectName}: ${summary.headline}`,
      text,
      html,
    }),
  });

  const json = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) {
    throw new Error(json?.message || "Failed to send email.");
  }
}
