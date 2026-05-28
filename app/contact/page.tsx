"use client";

import { useState } from "react";
import { RiArrowRightLine } from "@remixicon/react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormLabel } from "@/components/ui/FormLabel";
import { BrandPill } from "@/components/ui/BrandPill";
import { inputFieldClass } from "@/components/ui/inputClasses";

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

  return (
    <>
      <AppHeader />

      <main className="min-h-[calc(100dvh-68px)] bg-[#F5F7FA] px-4 py-5 md:px-6 md:py-8">
        <div className="mx-auto max-w-[920px]">
          <div
            className="
              rounded-[28px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              px-5
              py-6
              shadow-[0_10px_40px_rgba(0,0,0,0.03)]
              md:rounded-[36px]
              md:px-10
              md:py-10
            "
          >
            <div className="mx-auto max-w-[700px] text-center">
              <BrandPill>Contact</BrandPill>

              <h1
                className="
                  mt-4
                  text-[30px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.05em]
                  text-[#061C2F]
                  sm:text-[36px]
                  md:text-[44px]
                "
              >
                Get in touch
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[520px]
                  text-[15px]
                  leading-7
                  text-[#6B7280]
                  md:text-[17px]
                "
              >
                Questions, feedback, or partnership ideas — we read every
                message and reply to{" "}
                <a
                  href="mailto:hello@klynt.one"
                  className="font-medium text-[#2563EB] hover:underline"
                >
                  hello@klynt.one
                </a>
                .
              </p>
            </div>

            {sent ? (
              <div
                className="
                  mt-8
                  rounded-[24px]
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-5
                  py-6
                  text-center
                  md:mt-10
                "
              >
                <p className="text-[16px] font-semibold text-emerald-800">
                  Message sent
                </p>
                <p className="mt-2 text-[14px] leading-6 text-emerald-700">
                  Thanks for reaching out. We&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 text-[14px] font-medium text-[#2563EB] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 md:mt-10"
                noValidate
              >
                <div>
                  <FormLabel>Name</FormLabel>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={submitting}
                    autoComplete="name"
                    className={`${inputFieldClass({ disabled: submitting })} h-[54px] md:h-[58px]`}
                  />
                </div>

                <div className="mt-6">
                  <FormLabel>Email</FormLabel>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={submitting}
                    autoComplete="email"
                    className={`${inputFieldClass({ disabled: submitting })} h-[54px] md:h-[58px]`}
                  />
                </div>

                <div className="mt-6">
                  <FormLabel>Message</FormLabel>
                  <textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    disabled={submitting}
                    rows={5}
                    className={`${inputFieldClass({ disabled: submitting })} min-h-[140px] resize-y py-4 leading-relaxed`}
                  />
                </div>

                {error && (
                  <p
                    className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-8 md:mt-10">
                  <Button
                    type="submit"
                    variant="accent"
                    disabled={submitting || !canSubmit}
                    icon={<RiArrowRightLine size={18} />}
                    className="h-[58px] min-h-[58px] w-full text-[17px]"
                  >
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
