export function buildShareText(auditedUrl?: string) {
  const target = auditedUrl?.trim();

  if (target) {
    return `UX clarity report for ${target} — generated with Klynt`;
  }

  return "UX clarity report — generated with Klynt";
}

export type ShareTarget = {
  id: string;
  label: string;
  href: string;
};

export function getShareTargets(shareUrl: string, auditedUrl?: string): ShareTarget[] {
  const url = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(buildShareText(auditedUrl));
  const title = text;

  return [
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    },
    {
      id: "reddit",
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${url}&title=${title}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${buildShareText(auditedUrl)} ${shareUrl}`)}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("Klynt UX Report")}&body=${encodeURIComponent(`${buildShareText(auditedUrl)}\n\n${shareUrl}`)}`,
    },
  ];
}
