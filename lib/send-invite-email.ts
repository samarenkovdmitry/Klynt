import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildInviteContent(projectName: string, inviterName: string | null, acceptUrl: string) {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);
  const safeName = escapeHtml(projectName);
  const inviterLine = inviterName ? `${escapeHtml(inviterName)} invited you` : "You've been invited";

  const text = [
    "Hey,",
    "",
    `${inviterName ? inviterName + " invited you" : "You've been invited"} to join "${projectName}" on Klynt.`,
    "",
    "Klynt keeps track of what is actually true in a project — what changed,",
    "what's approved, and what needs attention — from Figma, Slack and Linear.",
    "",
    `Accept the invite: ${acceptUrl}`,
    "",
    "— Klynt",
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
                <p style="margin:0 0 16px;">${inviterLine} to join <strong>${safeName}</strong> on Klynt.</p>
                <p style="margin:0 0 24px;">Klynt keeps track of what is actually true in a project — what changed, what's approved, and what needs attention — from Figma, Slack and Linear.</p>
                <p style="margin:0 0 24px;">
                  <a href="${acceptUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0F3D2E;color:#FFE79A;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:999px;">Accept invite</a>
                </p>
                <p style="margin:0;font-size:13px;color:#8C887D;">Or paste this link: ${acceptUrl}</p>
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

export async function sendProjectInviteEmail(
  email: string,
  projectName: string,
  inviterName: string | null,
  acceptUrl: string,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in the environment.");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildInviteContent(projectName, inviterName, acceptUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `You're invited to ${projectName} on Klynt`,
      text,
      html,
    }),
  });

  const json = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) {
    throw new Error(json?.message || "Failed to send email.");
  }
}
