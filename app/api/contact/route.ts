import { NextResponse } from "next/server";
import {
  sendContactEmail,
  validateContactPayload,
} from "@/lib/send-contact-email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    const validated = validateContactPayload({
      name,
      email,
      message,
    });

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await sendContactEmail(validated.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

    console.error("[contact]", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
