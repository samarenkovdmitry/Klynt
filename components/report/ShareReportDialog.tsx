"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiCloseLine,
  RiFacebookFill,
  RiFileCopyLine,
  RiLinkedinBoxFill,
  RiMailLine,
  RiReddit2Line,
  RiShareForwardLine,
  RiTwitterXLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import { getShareTargets } from "@/lib/share-report";

type ShareReportDialogProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  auditedUrl?: string;
};

const SHARE_ICONS: Record<string, RemixiconComponentType> = {
  x: RiTwitterXLine,
  facebook: RiFacebookFill,
  linkedin: RiLinkedinBoxFill,
  reddit: RiReddit2Line,
  email: RiMailLine,
};

function ShareNetworkIcon({ id }: { id: string }) {
  const Icon = SHARE_ICONS[id] ?? RiShareForwardLine;

  if (id === "whatsapp") {
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }

  if (id === "telegram") {
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    );
  }

  return <Icon size={20} aria-hidden />;
}

export function ShareReportDialog({
  open,
  onClose,
  shareUrl,
  auditedUrl,
}: ShareReportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const targets = getShareTargets(shareUrl, auditedUrl);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: "Klynt UX Report",
        text: auditedUrl ? `UX report for ${auditedUrl}` : "Klynt UX Report",
        url: shareUrl,
      });
      onClose();
    } catch {
      // User cancelled or share failed — keep dialog open
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(6,28,47,0.45)] backdrop-blur-[2px]"
        aria-label="Close share dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-report-title"
        className="relative z-10 w-full max-w-[480px] rounded-[28px] border border-[var(--stroke-light)] bg-white px-5 py-6 shadow-[0_24px_64px_rgba(6,28,47,0.18)] md:px-7 md:py-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="share-report-title"
              className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--ink-primary)] md:text-[24px]"
            >
              Share report
            </h2>
            <p className="mt-1 text-[14px] leading-6 text-[var(--ink-secondary)]">
              Send this link to your team or post it on social.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--stroke-light)] text-[var(--ink-secondary)] transition hover:bg-[#F8FBFF] hover:text-[var(--ink-primary)]"
            aria-label="Close"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="share-report-url"
            className="text-[13px] font-medium text-[var(--ink-secondary)]"
          >
            Report link
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="share-report-url"
              type="text"
              readOnly
              value={shareUrl}
              className={`${inputFieldClass({ withMargin: false })} h-[48px] min-w-0 flex-1 text-[14px]`}
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-[var(--stroke-light)] bg-white px-4 text-[14px] font-medium text-[var(--ink-primary)] transition hover:border-[rgba(20,168,232,0.25)] hover:bg-[#F8FBFF]"
            >
              <RiFileCopyLine size={18} />
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-[13px] font-medium text-[var(--ink-secondary)]">
          Share to
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {targets.map((target) => (
            <a
              key={target.id}
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--stroke-light)] bg-white px-2 py-3 text-center text-[11px] font-medium text-[var(--ink-primary)] transition hover:border-[rgba(20,168,232,0.25)] hover:bg-[#F8FBFF] sm:text-[12px]"
              aria-label={`Share on ${target.label}`}
            >
              <span className="text-[var(--ink-primary)]">
                <ShareNetworkIcon id={target.id} />
              </span>
              <span>{target.label}</span>
            </a>
          ))}
        </div>

        {canNativeShare && (
          <div className="mt-5">
            <Button
              type="button"
              variant="secondary"
              tone="light"
              fullWidth
              icon={<RiShareForwardLine size={18} />}
              onClick={() => void handleNativeShare()}
              className="!rounded-2xl"
            >
              More options…
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
