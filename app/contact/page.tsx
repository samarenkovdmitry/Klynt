"use client";

import { useState } from "react";
import { RiArrowRightLine, RiMailLine, RiTimeLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { FormLabel } from "@/components/ui/FormLabel";
import { inputFieldClass } from "@/components/ui/inputClasses";
import {
  REPORT_HERO_RADIUS_CLASS,
  REPORT_PAGE_CONTAINER_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

const CONTACT_POINTS = [
  {
    icon: RiMailLine,
    label: "Email us directly",
    value: "hello@klynt.one",
    href: "mailto:hello@klynt.one",
  },
  {
    icon: RiTimeLine,
    label: "Response time",
    value: "Usually within 1–2 business days",
  },
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || sent) return;

    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("message", message);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: form,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error || "Failed to send message. Please try again.");
        return;
      }

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length >= 10;

  const cardClassName = [
    REPORT_HERO_RADIUS_CLASS,
    REPORT_SURFACE_BORDER_CLASS,
    REPORT_SURFACE_SHADOW_CLASS,
    "bg-white p-6 md:p-8",
  ].join(" ");

  return (
    <>
      <main className="min-h-[calc(100dvh-68px)] bg-white px-4 pb-12 pt-6 text-[var(--ink-primary)] md:px-6 md:pt-10">
        <div className={REPORT_PAGE_CONTAINER_CLASS}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-12">
            <header className="lg:pt-2">
              <p className="text-[15px] font-normal leading-5 text-[#8E99A2]">
                Contact
              </p>
              <h1 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[40px] md:leading-[1.05]">
                Get in touch
              </h1>
              <p className="mt-3 max-w-[440px] text-[16px] leading-[25px] text-[rgba(6,28,47,0.5)]">
                Questions, feedback, or partnership ideas — we read every message
                and reply personally.
              </p>

              <ul className="mt-8 space-y-4">
                {CONTACT_POINTS.map((point) => {
                  const Icon = point.icon;

                  return (
                  <li key={point.label}>
                    <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#8F99A2]">
                      {point.label}
                    </p>
                    {"href" in point ? (
                      <a
                        href={point.href}
                        className="mt-1 inline-flex items-center gap-2 text-[16px] font-medium text-[var(--ink-primary)] transition hover:text-[#2563EB]"
                      >
                        <Icon size={18} className="shrink-0 text-[#2563EB]" aria-hidden />
                        {point.value}
                      </a>
                    ) : (
                      <p className="mt-1 flex items-center gap-2 text-[16px] font-medium text-[var(--ink-primary)]">
                        <Icon size={18} className="shrink-0 text-[#2563EB]" aria-hidden />
                        {point.value}
                      </p>
                    )}
                  </li>
                  );
                })}
              </ul>
            </header>

            <div className={cardClassName}>
              {sent ? (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <RiMailLine size={22} aria-hidden />
                  </div>
                  <p className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                    Message sent
                  </p>
                  <p className="mt-2 text-[15px] leading-6 text-[rgba(6,28,47,0.5)]">
                    Thanks for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 text-[14px] font-medium text-[#2563EB] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <p className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
                    Send a message
                  </p>
                  <p className="mt-1 text-[14px] leading-5 text-[rgba(6,28,47,0.5)]">
                    Tell us what you need — product feedback, support, or a partnership idea.
                  </p>

                  <div className="mt-6">
                    <FormLabel>Name</FormLabel>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={submitting}
                      autoComplete="name"
                      className={`${inputFieldClass({ disabled: submitting })} mt-2 h-[52px] bg-[#FAFBFC] md:h-[54px]`}
                    />
                  </div>

                  <div className="mt-5">
                    <FormLabel>Email</FormLabel>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      disabled={submitting}
                      autoComplete="email"
                      className={`${inputFieldClass({ disabled: submitting })} mt-2 h-[52px] bg-[#FAFBFC] md:h-[54px]`}
                    />
                  </div>

                  <div className="mt-5">
                    <FormLabel>Message</FormLabel>
                    <textarea
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      disabled={submitting}
                      rows={5}
                      className={`${inputFieldClass({ disabled: submitting })} mt-2 min-h-[140px] resize-y bg-[#FAFBFC] py-4 leading-relaxed`}
                    />
                  </div>

                  {error && (
                    <p
                      className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="accent"
                      disabled={submitting || !canSubmit}
                      icon={<RiArrowRightLine size={18} aria-hidden />}
                      className="!h-[52px] !min-h-[52px] !rounded-full !text-[15px]"
                    >
                      {submitting ? "Sending…" : "Send message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
