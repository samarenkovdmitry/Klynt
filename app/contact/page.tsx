"use client";

import { useState } from "react";
import { RiArrowRightLine, RiCheckLine, RiMailLine, RiTimeLine } from "@remixicon/react";

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
      const res = await fetch("/api/contact", { method: "POST", body: form });
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

  const fieldClass = (disabled: boolean) =>
    [
      "w-full rounded-[14px] border border-[#DCD8CD] bg-[#FAFAF7] px-5 py-3 text-[15px] text-v2-dark placeholder:text-[#B5B0A6] transition-colors",
      "focus:outline-none focus:border-v2-accent focus:bg-white",
      disabled && "cursor-not-allowed opacity-60",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="min-h-screen bg-lv2-cream font-sans text-v2-dark antialiased">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:pt-20">
        {/* Header */}
        <div className="mb-14 max-w-[540px]">
          <span className="mb-4 inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-faint">
            GET IN TOUCH
          </span>
          <h1 className="mb-4 text-[38px] font-bold leading-[1.08] tracking-[-0.03em] md:text-[48px]">
            We read every message.
          </h1>
          <p className="text-[17px] leading-[1.6] text-[#57544C]">
            Questions, feedback, or partnership ideas — we reply personally.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-16">
          {/* Left: info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-lv2-card border border-[#DCD8CD]">
                <RiMailLine size={18} className="text-v2-accent" aria-hidden />
              </span>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[.08em] text-v2-ink-faint">EMAIL</p>
                <a
                  href="mailto:hello@klynt.one"
                  className="text-[16px] font-medium text-v2-dark transition-colors hover:text-v2-accent"
                >
                  hello@klynt.one
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-lv2-card border border-[#DCD8CD]">
                <RiTimeLine size={18} className="text-v2-accent" aria-hidden />
              </span>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[.08em] text-v2-ink-faint">RESPONSE TIME</p>
                <p className="text-[16px] font-medium text-v2-dark">Usually within 1–2 business days</p>
              </div>
            </div>
          </div>

          {/* Right: form card */}
          <div className="rounded-[24px] border border-[#DCD8CD] bg-lv2-card p-8 shadow-[0_4px_24px_rgba(27,26,23,0.06)]">
            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-v2-pass-bg text-v2-pass">
                  <RiCheckLine size={26} aria-hidden />
                </span>
                <p className="mb-2 text-[20px] font-bold tracking-[-0.02em]">Message sent</p>
                <p className="mb-7 text-[15px] leading-[1.6] text-[#57544C]">
                  Thanks for reaching out — we&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-[14px] font-medium text-v2-accent hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <p className="mb-[2px] font-mono text-[11px] tracking-[.08em] text-v2-ink-faint">SEND A MESSAGE</p>
                  <p className="text-[14px] leading-[1.5] text-[#57544C]">
                    Product feedback, support, or a partnership idea — all welcome.
                  </p>
                </div>

                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-[13px] font-semibold text-v2-dark">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={submitting}
                    autoComplete="name"
                    className={`${fieldClass(submitting)} h-[50px]`}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-[13px] font-semibold text-v2-dark">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={submitting}
                    autoComplete="email"
                    className={`${fieldClass(submitting)} h-[50px]`}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-[13px] font-semibold text-v2-dark">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    disabled={submitting}
                    rows={5}
                    className={`${fieldClass(submitting)} min-h-[140px] resize-y py-4 leading-relaxed`}
                  />
                </div>

                {error && (
                  <p
                    className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-v2-dark px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Sending…" : "Send message"}
                  {!submitting && <RiArrowRightLine size={17} aria-hidden />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
