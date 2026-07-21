import { buildEmailLogoHtml } from "@/lib/email-brand";
import { getSiteUrl } from "@/lib/site";

type WaitlistEmailPayload = {
  email: string;
  reportUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isValidReportUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (!parsed.pathname.startsWith("/report/")) {
      return false;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const siteOrigin = new URL(getSiteUrl()).origin;
    const allowedOrigins = new Set([siteOrigin]);

    if (process.env.VERCEL_URL) {
      allowedOrigins.add(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
    }

    if (
      process.env.NODE_ENV !== "production" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      return true;
    }

    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
}

function buildWaitlistEmailContent(reportUrl: string) {
  const siteUrl = getSiteUrl();
  const logoHtml = buildEmailLogoHtml(siteUrl);
  const safeReportUrl = escapeHtml(reportUrl);

  const text = [
    "Hey,",
    "",
    "Your UX analysis is ready.",
    "",
    "Open your full report here:",
    reportUrl,
    "",
    "What Klynt does:",
    "→ detects UX friction points",
    "→ explains behavioral impact",
    "→ prioritizes issues by importance",
    "",
    "We're also launching on Product Hunt on June 2 🚀",
    "",
    "Would love your feedback.",
    "",
    "— Dmitry",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#F5F7FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#061C2F;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F7FA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(6,28,47,0.08);border-radius:20px;padding:32px 28px;">
            <tr>
              <td style="padding-bottom:24px;">
                ${logoHtml}
              </td>
            </tr>
            <tr>
              <td style="font-size:16px;line-height:1.7;color:#061C2F;">
                <p style="margin:0 0 16px;">Hey,</p>
                <p style="margin:0 0 16px;">Your UX analysis is ready.</p>
                <p style="margin:0 0 8px;">Open your full report here:</p>
                <p style="margin:0 0 24px;">
                  <a href="${safeReportUrl}" style="color:#4A4AFF;text-decoration:underline;">${safeReportUrl}</a>
                </p>
                <p style="margin:0 0 8px;font-weight:600;">What Klynt does:</p>
                <p style="margin:0 0 4px;">→ detects UX friction points</p>
                <p style="margin:0 0 4px;">→ explains behavioral impact</p>
                <p style="margin:0 0 24px;">→ prioritizes issues by importance</p>
                <p style="margin:0 0 16px;">We're also launching on Product Hunt on June 2 🚀</p>
                <p style="margin:0 0 16px;">Would love your feedback.</p>
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

export async function sendWaitlistEmail(payload: WaitlistEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY in the environment."
    );
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt <onboarding@resend.dev>";

  const { text, html } = buildWaitlistEmailContent(payload.reportUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      subject: "Your Klynt UX analysis is ready",
      text,
      html,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to send email. Please try again.");
  }
}
