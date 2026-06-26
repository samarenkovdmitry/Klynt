"use client";

import { useEffect } from "react";
import { RiCheckboxCircleFill, RiCloseLine } from "@remixicon/react";
import type { ProUpgradeTrigger } from "@/lib/freemium";

type FreemiumProModalProps = {
  open: boolean;
  onClose: () => void;
  reportId: string;
  trigger?: ProUpgradeTrigger;
  /** @deprecated kept for backward compat with waitlist flow; not called in payment flow */
  onJoined?: () => void;
};

const FEATURES = [
  { label: "All findings", sub: "Every issue ranked by conversion impact" },
  { label: "Full Copy Studio", sub: "Before/after rewrites for headline, subheadline & CTA" },
  { label: "Visual fixes", sub: "Design improvements across 10 dimensions" },
  { label: "Export-ready report", sub: "Copy deck, designer brief & dev tasks" },
] as const;

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

  function handleCheckout() {
    const url = buildCheckoutUrl(reportId);
    if (url) window.location.href = url;
  }

  const checkoutReady = !!process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID && !!reportId;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="share-backdrop-enter absolute inset-0 bg-black/30"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-modal-title"
        className="share-dialog-enter relative z-[1] w-full max-w-[420px] overflow-hidden rounded-[24px] border border-v2-card-border bg-[#FAF9F4] shadow-[0_8px_40px_rgba(27,26,23,0.12)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-v2-card-inner text-v2-ink-muted transition-colors hover:bg-[#ECEAE2] hover:text-v2-ink"
          aria-label="Close"
        >
          <RiCloseLine size={18} aria-hidden />
        </button>

        <div className="px-8 pb-8 pt-10">
          <div className="flex justify-center">
            <img src="/klynt-logo-dark.svg" alt="Klynt" className="h-[22px] w-auto" />
          </div>

          <div className="mt-6 text-center">
            <h2
              id="unlock-modal-title"
              className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-v2-ink"
            >
              Unlock the full audit
            </h2>
            <p className="mt-2 text-[15px] leading-[1.6] text-v2-ink-muted">
              One-time payment. Instant access.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`flex items-start gap-3 px-5 py-4 ${i > 0 ? "border-t border-v2-card-divider" : ""}`}
              >
                <RiCheckboxCircleFill size={17} className="mt-0.5 shrink-0 text-v2-pass" aria-hidden />
                <div>
                  <p className="text-[14.5px] font-semibold leading-snug text-v2-ink">{f.label}</p>
                  <p className="mt-0.5 text-[13px] leading-[1.5] text-v2-ink-muted">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!checkoutReady}
            className="mt-5 flex h-[52px] w-full items-center justify-center rounded-full bg-v2-ink text-[16px] font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            Unlock for $12
          </button>
        </div>
      </div>
    </div>
  );
}
