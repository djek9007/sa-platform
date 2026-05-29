import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGeminiModel } from "@/lib/gemini/client";
import { buildSystemPrompt } from "@/lib/gemini/prompts";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { message, lessonContext, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Сообщение обязательно" },
        { status: 400 }
      );
    }

    const model = getGeminiModel();
    if (!model) {
      return NextResponse.json(
        {
          error:
            "ИИ-ассистент временно недоступен. Убедитесь, что GEMINI_API_KEY настроен в .env",
        },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt(lessonContext || undefined);

    // Build history with system prompt as first message
    const chatHistory = [
      {
        role: "user",
        parts: [
          {
            text: `Ты — ИИ-ассистент учебного курса «Системный и Бизнес-анализ». Ниже приведена инструкция, которой ты должен следовать при ответах.\n\nИНСТРУКЦИЯ:\n${systemPrompt}\n\nОтветь "Привет! Я ИИ-ассистент курса. Чем могу помочь?" если понял инструкцию.`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Привет! Я ИИ-ассистент курса «Системный и Бизнес-анализ». Чем могу помочь?",
          },
        ],
      },
      ...(history || []).map(
        (msg: { role: string; content: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })
      ),
    ];

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    // Save to database
    await prisma.chatMessage.createMany({
      data: [
        {
          userId: session.user.id,
          role: "user",
          content: message,
          lessonContext: lessonContext || null,
        },
        {
          userId: session.user.id,
          role: "assistant",
          content: response,
          lessonContext: lessonContext || null,
        },
      ],
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Chat error:", errMsg);

    // Определяем тип ошибки
    if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
      return NextResponse.json(
        {
          error:
            "API-ключ Gemini недействителен. Пожалуйста, получите новый ключ на https://aistudio.google.com и обновите GEMINI_API_KEY в .env",
        },
        { status: 500 }
      );
    }

    if (errMsg.includes("system_instruction") || errMsg.includes("safety")) {
      return NextResponse.json(
        { error: "Ошибка формата запроса к Gemini. Попробуйте переформулировать вопрос." },
        { status: 500 }
      );
    }

    // Ошибка квоты (RESOURCE_EXHAUSTED / 429)
    if (
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("quota") ||
      errMsg.includes("Quota") ||
      errMsg.includes("429")
    ) {
      return NextResponse.json(
        {
          error:
            "Квота Gemini API исчерпана. Попробуйте позже или получите новый ключ на https://aistudio.google.com/app/apikey",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Ошибка при обработке запроса. Попробуйте позже." },
      { status: 500 }
    );
  }
}
