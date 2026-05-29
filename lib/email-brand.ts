import { absoluteUrl } from "@/lib/site";

/** PNG logo for HTML email (SVG is blocked in Gmail, Outlook, etc.). */
export const EMAIL_LOGO_PATH = "/klynt-logo-email.png";

export const EMAIL_LOGO_WIDTH = 109;
export const EMAIL_LOGO_HEIGHT = 33;

export function getEmailLogoUrl() {
  return absoluteUrl(EMAIL_LOGO_PATH);
}

export function buildEmailLogoHtml(siteUrl: string) {
  const logoUrl = absoluteUrl(EMAIL_LOGO_PATH);
  const safeSiteUrl = siteUrl.replace(/"/g, "&quot;");

  return `<a href="${safeSiteUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-block;">
  <img
    src="${logoUrl}"
    alt="Klynt"
    width="${EMAIL_LOGO_WIDTH}"
    height="${EMAIL_LOGO_HEIGHT}"
    border="0"
    style="display:block;border:0;outline:none;text-decoration:none;width:${EMAIL_LOGO_WIDTH}px;height:${EMAIL_LOGO_HEIGHT}px;max-width:${EMAIL_LOGO_WIDTH}px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;font-weight:600;color:#061C2F;"
  />
</a>`;
}
