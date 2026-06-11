"use client";

import { useState } from "react";
import {
  RiChat1Line,
  RiCheckboxCircleLine,
  RiLockLine,
} from "@remixicon/react";

import { ContactOtherLinks } from "@/components/contact/ContactOtherLinks";
import { LandingTestFooter } from "@/components/landing-test/LandingTestFooter";
import {
  LANDING_CONTAINER,
  LANDING_DARK,
  LANDING_DISPLAY_H1,
  LANDING_DIVIDER,
} from "@/components/landing-test/landingPageStyles";
import { ServiceDarkHeader } from "@/components/service/ServiceDarkHeader";

const REASONS = [
  "Feedback",
  "Bug report",
  "Feature request",
  "Partnership",
  "Other",
] as const;

type Reason = (typeof REASONS)[number];

const fieldClass =
  "w-full rounded-[10px] border border-white/[0.08] bg-[#1C1C19] px-[14px] py-[11px] text-[14px] text-[#F2F2EF] outline-none transition-[border-color,box-shadow] placeholder:text-[#7A7A74] focus:border-[#1D9E75]/50 focus:shadow-[0_0_0_3px_rgba(29,158,117,0.08)] disabled:opacity-60";

export function ContactPageView() {
  const [reason, setReason] = useState<Reason>("Feedback");
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
    form.append("message", `[${reason}]\n\n${message.trim()}`);

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

  return (
    <div className="flex min-h-dvh flex-col text-[#F2F2EF]" style={{ backgroundColor: LANDING_DARK }}>
      <ServiceDarkHeader />

      <main
        className={`${LANDING_CONTAINER} flex-1 px-4 pb-16 pt-[calc(52px+env(safe-area-inset-top,0px)+5rem)] md:px-8 md:pb-24`}
      >
        <div className="mx-auto grid max-w-[960px] grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-20">
          <div className="order-1 md:col-start-1 md:row-start-1">
            <p className="mb-5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.09em] text-[#1D9E75]">
              <RiChat1Line size={14} aria-hidden />
              Get in touch
            </p>
            <h1 className={`max-w-[360px] ${LANDING_DISPLAY_H1}`}>
              We&apos;d love
              <br />
              to hear from you
            </h1>
            <p className="mt-4 max-w-[360px] text-[15px] leading-[1.75] text-[#9A9A93]">
              Questions about the product, feedback, partnership ideas — drop a message and
              we&apos;ll get back to you.
            </p>
            <ContactOtherLinks className="mt-10 hidden md:block" />
          </div>

          <div className="order-2 md:col-start-2 md:row-span-2 md:row-start-1">
            <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#141412]">
              <div className="border-b border-white/[0.08] bg-[#1C1C19] px-[22px] py-[18px]">
                <h2 className="font-sans text-[16px] font-semibold tracking-[-0.02em] text-[#F2F2EF]">
                  Send a message
                </h2>
                <p className="mt-0.5 text-[12px] text-[#7A7A74]">Usually reply within 24 hours</p>
              </div>

              {sent ? (
                <div className="px-6 py-12 text-center sm:px-8">
                  <RiCheckboxCircleLine
                    size={36}
                    className="mx-auto text-[#1D9E75]"
                    aria-hidden
                  />
                  <p className="mt-4 font-sans text-[20px] font-semibold tracking-[-0.03em] text-[#F2F2EF]">
                    Message sent
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.65] text-[#9A9A93]">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-6 text-[13px] font-medium text-[#9A9A93] transition-colors hover:text-[#F2F2EF]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4 px-[22px] py-[22px]">
                    <div>
                      <span className="mb-1.5 block text-[12px] font-medium text-[#7A7A74]">
                        What&apos;s this about?
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {REASONS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setReason(item)}
                            className={[
                              "rounded-full border px-3 py-[5px] text-[12px] transition-all duration-[120ms]",
                              reason === item
                                ? "border-[rgba(29,158,117,0.3)] bg-[rgba(29,158,117,0.1)] text-[#1D9E75]"
                                : "border-white/[0.08] bg-[#1C1C19] text-[#7A7A74] hover:border-white/[0.14] hover:text-[#F2F2EF]",
                            ].join(" ")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="mb-1.5 block text-[12px] font-medium text-[#7A7A74]">
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
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="mb-1.5 block text-[12px] font-medium text-[#7A7A74]">
                          Email
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          disabled={submitting}
                          autoComplete="email"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="mb-1.5 block text-[12px] font-medium text-[#7A7A74]">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        disabled={submitting}
                        rows={5}
                        className={`${fieldClass} min-h-[120px] resize-y leading-[1.6]`}
                      />
                    </div>

                    {error ? (
                      <p className="text-[13px] text-[#E8A83A]" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/[0.08] px-[22px] py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1 text-[12px] text-[#7A7A74]">
                      <RiLockLine size={13} aria-hidden />
                      Your info is never shared
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !canSubmit}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-[9px] bg-[#F2F2EF] px-[22px] font-sans text-[14px] font-semibold tracking-[-0.02em] text-[#0E0E0C] transition-opacity hover:opacity-88 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {submitting ? "Sending…" : "Send message →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <ContactOtherLinks className="order-3 md:col-start-1 md:row-start-2 md:hidden" showHeading />
        </div>
      </main>

      <div className={LANDING_CONTAINER}>
        <div className={LANDING_DIVIDER} aria-hidden />
      </div>
      <LandingTestFooter />
    </div>
  );
}
