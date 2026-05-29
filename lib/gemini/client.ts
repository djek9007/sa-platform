import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "your-gemini-api-key-here") {
  console.warn(
    "GEMINI_API_KEY not configured. Set it in .env for AI features to work."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export function getGeminiModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}
