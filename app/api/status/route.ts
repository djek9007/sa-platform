import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = getGeminiModel();

  return NextResponse.json({
    apiKeyConfigured: !!apiKey && apiKey !== "your-gemini-api-key-here",
    geminiModelAvailable: !!model,
    keyPrefix: apiKey ? apiKey.substring(0, 12) + "..." : "none",
  });
}
