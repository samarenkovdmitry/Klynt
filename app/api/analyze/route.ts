export const runtime = "edge";

import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// CORS for OPTIONS (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `Analyze UX of this website: ${url}`,
    });

    console.log("RAW RESPONSE:", JSON.stringify(response, null, 2));

    // --- Безопасный парсинг результата ---
    let result: string | undefined = response.output_text;

    if (!result && Array.isArray(response.output)) {
      for (const item of response.output) {
        // Ищем только элементы с текстовым контентом
        if (
          "content" in item &&
          Array.isArray((item as any).content) &&
          (item as any).content[0]?.text
        ) {
          result = (item as any).content[0].text;
          break;
        }
      }
    }

    if (!result) result = "No output";

    return new NextResponse(JSON.stringify({ result }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
