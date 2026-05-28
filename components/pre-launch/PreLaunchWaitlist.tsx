"use client";

import { useMemo, useState } from "react";
import { RiProductHuntFill } from "@remixicon/react";

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
  onUnlock: () => void;
  overlay?: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PreLaunchWaitlistCard({
  onUnlock,
  overlay = false,
}: PreLaunchWaitlistCardProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const days = useMemo(() => getDaysUntilProductHuntLaunch(), []);
  const phMessage = useMemo(() => {
    if (days === 0) {
      return "Launching on Product Hunt today — join the waitlist to unlock the rest of this report.";
    }

    if (days === 1) {
      return "Launching on Product Hunt in 1 day — join the waitlist to unlock the rest of this report.";
    }

    return `Launching on Product Hunt in ${days} days — join the waitlist to unlock the rest of this report.`;
  }, [days]);

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
      <div
        className={[
          "rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-6 text-center md:px-8 md:py-8",
          overlay ? "shadow-[0_16px_48px_rgba(6,28,47,0.12)]" : "",
        ].join(" ")}
      >
        <p className="text-[18px] font-semibold tracking-[-0.02em] text-emerald-900 md:text-[20px]">
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
    <div
      className={[
        "rounded-[28px] border border-[var(--stroke-light)] bg-white px-5 py-6 md:px-8 md:py-8",
        overlay
          ? "shadow-[0_16px_48px_rgba(6,28,47,0.12)]"
          : "shadow-[0_10px_40px_rgba(0,0,0,0.03)]",
      ].join(" ")}
    >
      <h4 className="text-center text-[24px] font-semibold tracking-[-0.03em] text-[var(--ink-primary)] md:text-[28px]">
        Get the full UX analysis
      </h4>

      <p className="mx-auto mt-3 max-w-[520px] text-center text-[14px] leading-6 text-[var(--ink-secondary)] md:text-[15px]">
        {phMessage}
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-[420px]">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          aria-invalid={error ? true : undefined}
          className={`${inputFieldClass({ disabled: submitting, withMargin: false })} h-[54px] md:h-[58px]`}
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
          className="mt-4 h-[54px] min-h-[54px] w-full text-[16px]"
        >
          {submitting ? "Joining…" : "Unlock full report"}
        </Button>
      </form>
    </div>
  );
}
