"use client";

import { useMemo, useState } from "react";
import { RiCheckLine, RiLock2Line } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import type { FreemiumLockedSummary } from "@/lib/freemium";

type FreemiumUpgradeGateProps = {
  reportId: string;
  locked: FreemiumLockedSummary;
  onJoined: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildHeadline({ domain }: FreemiumLockedSummary) {
  return domain ? `Unlock Pro for ${domain}` : "Upgrade to Pro";
}

const PRO_BULLETS = [
  "All copy variants — headline, CTA, subheadline",
  "Export deck, designer brief, dev tasks, Notion",
  "PDF export for your team",
  "Score potential breakdown with fix-by-fix deltas",
] as const;

export function FreemiumUpgradeGate({
  reportId,
  locked,
  onJoined,
}: FreemiumUpgradeGateProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const headline = useMemo(() => buildHeadline(locked), [locked]);

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

  if (submitted) {
    return (
      <section id="pro-upgrade-gate" className="scroll-mt-24">
        <div className="mx-auto max-w-[640px] rounded-[16px] border border-[rgba(29,158,117,0.2)] bg-[#E8F7F2] px-5 py-6 text-center md:px-8 md:py-7">
          <p className="text-[20px] font-semibold tracking-[-0.03em] text-[#0F6E56] md:text-[22px]">
            You&apos;re on the Pro waitlist
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[#0F6E56]/80 md:text-[15px]">
            We&apos;ll email you when Pro launches. Your checklist and first copy variant stay
            free — nothing lost.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="pro-upgrade-gate" className="scroll-mt-24">
      <div className="mx-auto max-w-[640px] overflow-hidden rounded-[16px] border border-black/[0.08] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
        <div className="border-b border-black/[0.06] bg-[#F9F9F9] px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-black/[0.08] bg-white text-[#555]">
              <RiLock2Line size={16} aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
                Klynt Pro
              </p>
              <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111] md:text-[20px]">
                {headline}
              </h3>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 md:px-8 md:py-6">
          <p className="text-[14px] leading-6 text-[#666]">
            Checklist and verdict are free. Pro unlocks the full improvement kit — copy, exports,
            and score breakdown.
          </p>

          <ul className="mt-4 space-y-2">
            {PRO_BULLETS.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[13px] leading-5 text-[#444]"
              >
                <RiCheckLine size={15} className="mt-0.5 shrink-0 text-[#1D9E75]" aria-hidden />
                {bullet}
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="mt-5">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              className={`${inputFieldClass({ disabled: submitting, withMargin: false })} h-[48px]`}
            />

            {error ? (
              <p className="mt-2 text-[13px] text-[#D14343]" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="accent"
              disabled={submitting}
              className="mt-3 h-[48px] min-h-[48px] w-full text-[14px]"
            >
              {submitting ? "Joining…" : "Join Pro waitlist"}
            </Button>
          </form>

          <p className="mt-3 text-center text-[12px] text-[#999]">
            No payment yet · early access when Pro launches
          </p>
        </div>
      </div>
    </section>
  );
}
