"use client";

import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiLockLine,
  RiShieldCheckLine,
} from "@remixicon/react";

import type { ProUpgradeTrigger } from "@/lib/freemium";

const PRO_MODAL_EMAIL_INPUT_CLASS =
  "w-full rounded-[10px] border border-black/[0.13] bg-[#F5F5F3] px-[14px] py-[11px] text-[14px] text-[#111] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#C0C0BC] focus:border-[#1D9E75] focus:shadow-[0_0_0_3px_rgba(29,158,117,0.1)] disabled:cursor-not-allowed disabled:opacity-60";

type FreemiumProModalProps = {
  open: boolean;
  onClose: () => void;
  reportId: string;
  trigger?: ProUpgradeTrigger;
  onJoined: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const PRO_BULLETS = [
  "All copy variants — headline, CTA, subheadline",
  "Export deck, designer brief, dev tasks, Notion",
  "PDF export for your team",
  "Score potential with fix-by-fix estimates",
] as const;

const TRIGGER_HINTS: Partial<Record<ProUpgradeTrigger, string>> = {
  "copy-variant": "You tried to copy a Pro variant.",
  "score-breakdown": "Score breakdown is part of Pro.",
  "meta-copy": "Meta copy export is part of Pro.",
  "export-pdf": "PDF export is part of Pro.",
  "export-copy-deck": "Copy deck export is part of Pro.",
  "export-designer-brief": "Designer brief export is part of Pro.",
  "export-dev-tasks": "Dev tasks export is part of Pro.",
  "export-notion-slack": "Notion / Slack export is part of Pro.",
};

export function FreemiumProModal({
  open,
  onClose,
  reportId,
  trigger,
  onJoined,
}: FreemiumProModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
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

  useEffect(() => {
    if (!open) {
      setError(null);
      setSubmitting(false);
      setSubmitted(false);
      setEmail("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reportId,
          reportUrl: window.location.href,
          source: "pro",
          trigger,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      onJoined();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const triggerHint = trigger ? TRIGGER_HINTS[trigger] : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="share-backdrop-enter absolute inset-0 bg-black/45"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-modal-title"
        className="share-dialog-enter relative z-[1] w-full max-w-[480px] overflow-hidden rounded-[20px] border border-black/[0.13] bg-white shadow-[0_2px_24px_rgba(0,0,0,0.08)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-[10px] text-[#999] transition-colors hover:bg-black/[0.05] hover:text-[#111]"
          aria-label="Close"
        >
          <RiCloseLine size={20} aria-hidden />
        </button>

        {submitted ? (
          <div className="px-6 py-10 text-center sm:px-8">
            <RiCheckboxCircleLine size={32} className="mx-auto text-[#1D9E75]" aria-hidden />
            <p className="mt-3 font-sans text-[16px] font-semibold tracking-[-0.02em] text-[#111]">
              You&apos;re on the list
            </p>
            <p className="mt-2 text-[13px] leading-[1.65] text-[#555]">
              We&apos;ll email you when Pro launches with early access pricing. Close this window
              to continue reading your report.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[10px] bg-[#111] px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            >
              Back to report
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-black/[0.07] bg-[#F5F5F3] px-5 py-5 pr-12 sm:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.13] bg-white">
                <RiLockLine size={17} className="text-[#555]" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
                  Klynt Pro
                </p>
                <h2
                  id="pro-modal-title"
                  className="font-sans text-[17px] font-semibold tracking-[-0.03em] text-[#111]"
                >
                  Unlock the full improvement kit
                </h2>
              </div>
            </div>

            <div className="border-b border-black/[0.07] px-5 py-5 sm:px-6">
              {triggerHint ? (
                <p className="mb-3 text-[13px] font-medium text-[#555]">{triggerHint}</p>
              ) : null}
              <p className="text-[14px] leading-[1.65] text-[#555]">
                Checklist and verdict are free. Pro unlocks everything your team ships — copy,
                exports, and score breakdown.
              </p>
              <ul className="mt-[18px] flex flex-col gap-2">
                {PRO_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5 text-[13px] text-[#111]">
                    <RiCheckLine size={16} className="shrink-0 text-[#1D9E75]" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
              <label
                htmlFor="pro-modal-email"
                className="mb-[7px] block text-[12px] font-medium text-[#999]"
              >
                Your email
              </label>
              <input
                id="pro-modal-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
                className={[
                  PRO_MODAL_EMAIL_INPUT_CLASS,
                  error ? "border-[#FFD9D6] bg-[#FFF4F3] focus:border-[#FFD9D6] focus:shadow-none" : "",
                ].join(" ")}
              />

              {error ? (
                <p className="mt-2 text-[13px] text-[#D14343]" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2.5 flex h-12 w-full items-center justify-center rounded-[10px] bg-[#111] font-sans text-[14px] font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
              >
                {submitting ? "Joining…" : "Join Pro waitlist →"}
              </button>

              <p className="mt-2.5 flex items-center justify-center gap-1 text-[12px] text-[#C0C0BC]">
                <RiShieldCheckLine size={13} aria-hidden />
                No payment yet · early access when Pro launches
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
