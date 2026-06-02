"use client";

import { useMemo, useState } from "react";
import { RiCheckLine, RiProductHuntFill } from "@remixicon/react";

import type { ReportWaitlistLockedSummary } from "@/lib/pre-launch";
import { Button } from "@/components/ui/Button";
import { inputFieldClass } from "@/components/ui/inputClasses";
import {
  getDaysUntilProductHuntLaunch,
  getProductHuntCountdownLabel,
  isPreLaunchEnabled,
} from "@/lib/pre-launch";

export function PreLaunchProductHuntBanner() {
  if (!isPreLaunchEnabled()) {
    return null;
  }

  const label = useMemo(() => getProductHuntCountdownLabel(), []);

  return (
    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] font-medium leading-none text-white/90 md:mb-8 md:px-5 md:text-[15px]">
      <RiProductHuntFill
        size={22}
        className="shrink-0 text-[#DA552F]"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

type PreLaunchWaitlistCardProps = {
  reportId: string;
  locked: ReportWaitlistLockedSummary;
  onUnlock: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildWaitlistHeadline({
  domain,
  remainingIssues,
  remainingSuggestions,
  remainingCopy,
}: ReportWaitlistLockedSummary) {
  const parts: string[] = [];

  if (remainingIssues > 0) {
    parts.push(
      `${remainingIssues} more UX issue${remainingIssues === 1 ? "" : "s"}`
    );
  }

  if (remainingSuggestions > 0) {
    parts.push(
      `${remainingSuggestions} prioritized fix${remainingSuggestions === 1 ? "" : "es"}`
    );
  }

  if (remainingCopy > 0) {
    parts.push(
      `${remainingCopy} copy rewrite${remainingCopy === 1 ? "" : "s"}`
    );
  }

  if (parts.length === 0) {
    return domain ? `Get the full report for ${domain}` : "Get the full UX report";
  }

  const summary =
    parts.length === 1
      ? parts[0]
      : parts.length === 2
        ? `${parts[0]} and ${parts[1]}`
        : `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;

  return domain ? `${summary} for ${domain}` : summary;
}

function buildLockedBullets({
  remainingIssues,
  remainingSuggestions,
  remainingCopy,
}: ReportWaitlistLockedSummary) {
  const bullets: string[] = [];

  if (remainingIssues > 0) {
    bullets.push(
      `${remainingIssues} UX issue${remainingIssues === 1 ? "" : "s"} with explanations`
    );
  }

  if (remainingSuggestions > 0) {
    bullets.push(
      `${remainingSuggestions} prioritized fix${remainingSuggestions === 1 ? "" : "es"} for this page`
    );
  }

  if (remainingCopy > 0) {
    bullets.push(
      `${remainingCopy} before/after copy rewrite${remainingCopy === 1 ? "" : "s"}`
    );
  }

  bullets.push("Shareable PDF export");

  return bullets;
}

export function PreLaunchWaitlistCard({
  reportId,
  locked,
  onUnlock,
}: PreLaunchWaitlistCardProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const headline = useMemo(() => buildWaitlistHeadline(locked), [locked]);
  const bullets = useMemo(() => buildLockedBullets(locked), [locked]);
  const phLabel = useMemo(() => getProductHuntCountdownLabel(), []);

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
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      onUnlock();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-[640px] rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-6 text-center md:px-8 md:py-7">
        <p className="text-[20px] font-semibold tracking-[-0.02em] text-emerald-900 md:text-[22px]">
          Full report unlocked
        </p>
        <p className="mt-2 text-[14px] leading-6 text-emerald-800 md:text-[15px]">
          Check your inbox for the report link, then scroll down for the rest
          of the analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] rounded-[20px] border border-[rgba(6,28,47,0.08)] bg-white px-5 py-6 md:px-8 md:py-7">
      <h4 className="text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-[var(--ink-primary)] md:text-[26px]">
        {headline}
      </h4>

      <p className="mt-3 text-[15px] leading-6 text-[rgba(6,28,47,0.55)]">
        We&apos;ll email you the full report link — no spam, one send.
      </p>

      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2.5 text-[14px] leading-5 text-[rgba(6,28,47,0.72)]"
          >
            <RiCheckLine
              size={16}
              className="mt-0.5 shrink-0 text-[#10B981]"
              aria-hidden
            />
            {bullet}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-6">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          aria-invalid={error ? true : undefined}
          className={`${inputFieldClass({ disabled: submitting, withMargin: false })} h-[52px] md:h-[54px]`}
        />

        {error && (
          <p className="mt-2 text-[13px] text-[#D14343]" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          disabled={submitting}
          className="mt-3 h-[52px] min-h-[52px] w-full text-[15px] md:mt-4"
        >
          {submitting ? "Sending…" : "Send me the full report"}
        </Button>
      </form>

      <p className="mt-4 flex items-center gap-2 text-[13px] text-[rgba(6,28,47,0.45)]">
        <RiProductHuntFill size={16} className="shrink-0 text-[#DA552F]" aria-hidden />
        {phLabel}
      </p>
    </div>
  );
}
