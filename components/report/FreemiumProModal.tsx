"use client";

import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiMailLine,
  RiShieldCheckLine,
} from "@remixicon/react";

import type { ProUpgradeTrigger } from "@/lib/freemium";

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

const PRO_FEATURES = [
  "Full Copy Studio",
  "Visual improvement ideas",
  "Export-ready reports",
] as const;

const TRIGGER_HINTS: Partial<Record<ProUpgradeTrigger, string>> = {
  "copy-variant": "Copy variants are part of Pro.",
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
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
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

  if (!open) return null;

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
        className="share-backdrop-enter absolute inset-0 bg-black/55"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-modal-title"
        className="share-dialog-enter relative z-[1] w-full max-w-[365px] overflow-hidden rounded-[32px] bg-[#18181B] shadow-[0_10px_40px_rgba(32,29,148,0.5)]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,rgba(99,102,241,0.3),rgba(79,70,229,0.14)_38%,rgba(79,70,229,0.05)_58%,transparent_74%)]"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[2] flex h-8 w-8 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Close"
        >
          <RiCloseLine size={20} aria-hidden />
        </button>

        {submitted ? (
          <div className="relative px-6 py-10 text-center sm:px-8">
            <RiCheckboxCircleLine size={32} className="mx-auto text-[#A7F3D0]" aria-hidden />
            <p className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-white">
              You&apos;re on the list
            </p>
            <p className="mt-2 text-[14px] leading-6 text-white/50">
              We&apos;ll email you when Pro launches. Close this window to keep reading your report.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-[52px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#061C2F] transition-opacity hover:opacity-90"
            >
              Back to report
            </button>
          </div>
        ) : (
          <div className="relative px-6 pb-6 pt-10 sm:px-6">
            <div className="flex items-center justify-center gap-2.5">
              <img src="/klynt-logo-light-compact.svg" alt="Klynt" className="h-[25px] w-auto" />
              <span className="h-[25px] w-px bg-white/10" aria-hidden />
              <span className="inline-flex h-6 items-center rounded-2xl px-2 text-[14px] font-medium tracking-[0.04em] text-[#CDCDFE]">
                PRO
              </span>
            </div>

            <div className="mt-6 text-center">
              <h2
                id="pro-modal-title"
                className="text-[28px] font-semibold leading-[36px] tracking-[-0.01em] text-white"
              >
                Go deeper
              </h2>
              <p className="mt-1 text-[15px] leading-[23px] text-white/50">
                More fixes. More variations. More clarity.
              </p>
              {triggerHint ? (
                <p className="mt-3 text-[13px] font-medium text-white/40">{triggerHint}</p>
              ) : null}
            </div>

            <div className="mt-6 rounded-[24px] bg-white/[0.05] px-4 py-3">
              {PRO_FEATURES.map((feature, index) => (
                <div
                  key={feature}
                  className={[
                    "flex items-center gap-2.5 py-1.5 text-[14px] leading-5 text-white",
                    index > 0 ? "border-t border-white/[0.06]" : "",
                  ].join(" ")}
                >
                  <RiCheckLine size={16} className="shrink-0 text-white/80" aria-hidden />
                  {feature}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="relative">
                <RiMailLine
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  aria-hidden
                />
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
                    "h-[52px] w-full rounded-[16px] border bg-white/[0.08] pl-11 pr-4 text-[15px] text-white outline-none transition-[border-color] placeholder:text-white/40 focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60",
                    error ? "border-[#F87171]/60" : "border-white/[0.08]",
                  ].join(" ")}
                />
              </div>

              {error ? (
                <p className="mt-2 text-[13px] text-[#FCA5A5]" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex h-[52px] w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#061C2F] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Joining…" : "Upgrade to PRO"}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-white/45">
                <RiShieldCheckLine size={14} aria-hidden />
                No payment yet · We&apos;ll email when Pro launches
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
