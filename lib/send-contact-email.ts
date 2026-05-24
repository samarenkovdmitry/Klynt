const CONTACT_TO = "hello@klynt.one";
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  screenshot?: File | null;
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

  const screenshot = payload.screenshot;
  if (screenshot && screenshot.size > 0) {
    if (!screenshot.type.startsWith("image/")) {
      return {
        ok: false as const,
        error: "Screenshot must be a PNG or JPG image.",
      };
    }

    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      return {
        ok: false as const,
        error: "Screenshot must be 20 MB or smaller.",
      };
    }
  }

  return {
    ok: true as const,
    data: { name, email, message, screenshot },
  };
}

export async function sendContactEmail(payload: {
  name: string;
  email: string;
  message: string;
  screenshot?: File | null;
}) {
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

  const attachments: { filename: string; content: string }[] = [];
  const screenshot = payload.screenshot;

  if (screenshot && screenshot.size > 0) {
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    attachments.push({
      filename: screenshot.name || "screenshot.jpg",
      content: buffer.toString("base64"),
    });
  }

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
      ...(attachments.length > 0 ? { attachments } : {}),
    }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!res.ok) {
    throw new Error(json?.message || "Failed to send message. Please try again.");
  }
}
