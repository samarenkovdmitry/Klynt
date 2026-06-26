"use client";

import { useEffect } from "react";
import {
  RiCheckboxCircleFill,
  RiCloseLine,
  RiInformationLine,
  RiLock2Line,
} from "@remixicon/react";

import type { ProUpgradeTrigger } from "@/lib/freemium";

type FreemiumProModalProps = {
  open: boolean;
  onClose: () => void;
  reportId: string;
  trigger?: ProUpgradeTrigger;
  /** @deprecated kept for backward compat with waitlist flow; not called in payment flow */
  onJoined?: () => void;
};

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

function buildCheckoutUrl(reportId: string): string | null {
  const variantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID;
  if (!variantId || !reportId) return null;

  const redirectUrl = encodeURIComponent(
    `${window.location.origin}${window.location.pathname}?unlocked=true`
  );

  return (
    `https://klyntapp.lemonsqueezy.com/checkout/buy/${variantId}` +
    `?checkout[custom][report_id]=${reportId}` +
    `&checkout[redirect_url]=${redirectUrl}`
  );
}

export function FreemiumProModal({
  open,
  onClose,
  reportId,
  trigger,
}: FreemiumProModalProps) {
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

  if (!open) return null;

  const triggerHint = trigger ? TRIGGER_HINTS[trigger] : undefined;

  function handleCheckout() {
    const url = buildCheckoutUrl(reportId);
    if (url) {
      window.location.href = url;
    }
  }

  const checkoutReady = !!process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID && !!reportId;

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
        className="share-dialog-enter relative z-[1] w-full max-w-[400px] overflow-hidden rounded-[32px] bg-[#13122A] shadow-[0_16px_48px_rgba(20,18,60,0.7)]"
      >
        {/* Radial glow overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 33%, rgba(110,100,230,0.38) 0%, rgba(70,60,190,0.16) 45%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors hover:bg-white/15 hover:text-white/80"
          aria-label="Close"
        >
          <RiCloseLine size={18} aria-hidden />
        </button>

        <div className="relative px-8 pb-8 pt-10">
          {/* Header: logo + divider + PRO */}
          <div className="flex items-center justify-center gap-3">
            <img src="/klynt-logo-light-compact.svg" alt="Klynt" className="h-[25px] w-auto" />
            <span className="h-[30px] w-px bg-white/25" aria-hidden />
            <span className="text-[15px] font-semibold tracking-[0.06em] text-white">
              PRO
            </span>
          </div>

          {/* Title + subtitle */}
          <div className="mt-6 text-center">
            <h2
              id="pro-modal-title"
              className="text-[28px] font-semibold leading-[1.28] tracking-[-0.01em] text-white"
            >
              Go deeper
            </h2>
            <p className="mt-1 text-[15px] leading-[1.6] text-white/50">
              More fixes. More variations. More clarity.
            </p>
            {triggerHint ? (
              <p className="mt-3 text-[13px] font-medium text-white/40">{triggerHint}</p>
            ) : null}
          </div>

          {/* Features card */}
          <div className="mt-6 flex flex-col gap-3 rounded-[24px] bg-white/[0.07] p-5">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-[15px] leading-5 text-white">
                <RiCheckboxCircleFill size={18} className="shrink-0 text-white" aria-hidden />
                {feature}
              </div>
            ))}
          </div>

          {/* Checkout CTA */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!checkoutReady}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-[#061C2F] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <RiLock2Line size={16} aria-hidden />
              Unlock for $12
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-white/40">
              <RiInformationLine size={14} aria-hidden />
              One-time payment · Instant access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
