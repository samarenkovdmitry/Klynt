const CONTACT_TO = "hello@klynt.one";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateContactPayload(payload: ContactPayload) {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (name.length < 1) {
    return { ok: false as const, error: "Please enter your name." };
  }

  if (!isValidEmail(email)) {
    return { ok: false as const, error: "Please enter a valid email address." };
  }

  if (message.length < 10) {
    return {
      ok: false as const,
      error: "Message should be at least 10 characters.",
    };
  }

  return {
    ok: true as const,
    data: { name, email, message },
  };
}

export async function sendContactEmail(payload: ContactPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Email is not configured. Set RESEND_API_KEY in the environment."
    );
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || CONTACT_TO;
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Klynt Contact <onboarding@resend.dev>";

  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Klynt contact — ${payload.name}`,
      text,
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to send message. Please try again.");
  }
}
