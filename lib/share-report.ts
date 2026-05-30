import {
  buildShareEmailSubject,
  buildShareText,
  type ReportShareContext,
} from "@/lib/report-seo";

export type ShareTarget = {
  id: string;
  label: string;
  href: string;
};

export function getShareTargets(
  shareUrl: string,
  context?: ReportShareContext
) {
  const url = encodeURIComponent(shareUrl);
  const text = encodeURIComponent(buildShareText(context));
  const title = text;
  const shareLine = buildShareText(context);

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
      href: `https://wa.me/?text=${encodeURIComponent(`${shareLine}\n${shareUrl}`)}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(buildShareEmailSubject(context))}&body=${encodeURIComponent(`${shareLine}\n\n${shareUrl}`)}`,
    },
  ];
}

export { buildShareText, type ReportShareContext } from "@/lib/report-seo";
