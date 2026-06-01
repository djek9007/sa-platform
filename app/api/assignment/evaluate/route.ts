import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGeminiModel } from "@/lib/gemini/client";
import {
  buildEvaluationSystemPrompt,
  buildEvaluationPrompt,
  type EvaluationResult,
} from "@/lib/gemini/evaluate-prompt";
import { submitAssignment } from "@/lib/progress-service";
import { getModule } from "@/lib/course-parser";

export const maxDuration = 60; // Evaluation may take longer

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { moduleId, content } = await request.json();

    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json(
        { error: "moduleId обязателен" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Ответ должен содержать минимум 10 символов" },
        { status: 400 }
      );
    }

    // Get the assignment content from the course files
    const mod = await getModule(moduleId);
    if (!mod || !mod.assignment) {
      return NextResponse.json(
        { error: "Задание не найдено" },
        { status: 404 }
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

    // Build evaluation prompt
    const systemPrompt = buildEvaluationSystemPrompt();
    const evaluationPrompt = buildEvaluationPrompt(
      mod.assignment.title,
      mod.assignment.content,
      content
    );

    // Send to Gemini
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Ты — эксперт-преподаватель курса. Ниже инструкция.\n\nИНСТРУКЦИЯ:\n${systemPrompt}\n\nОтветь "Готов оценить" если понял инструкцию.`,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Готов оценить" }],
        },
      ],
    });

    const result = await chat.sendMessage(evaluationPrompt);
    const responseText = result.response.text();

    // Parse the JSON response from Gemini
    let evaluation: EvaluationResult;
    try {
      // Strip any markdown code fences if present
      const cleanJson = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      evaluation = JSON.parse(cleanJson);
    } catch {
      // If JSON parsing fails, return raw response as error
      return NextResponse.json(
        {
          error: "Не удалось распарсить оценку. Попробуйте ещё раз.",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    // Validate evaluation structure
    if (typeof evaluation.overallScore !== "number") {
      return NextResponse.json(
        {
          error: "Некорректный формат оценки от ИИ",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    // Save submission with evaluation
    const feedbackJson = JSON.stringify({
      criteria: evaluation.criteria,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    });

    await submitAssignment(
      session.user.id,
      moduleId,
      content,
      feedbackJson,
      evaluation.overallScore
    );

    return NextResponse.json({
      evaluation,
      submittedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Assignment evaluation error:", errMsg);

    if (
      errMsg.includes("API_KEY_INVALID") ||
      errMsg.includes("API key not valid")
    ) {
      return NextResponse.json(
        {
          error:
            "API-ключ Gemini недействителен. Пожалуйста, получите новый ключ на https://aistudio.google.com и обновите GEMINI_API_KEY в .env",
        },
        { status: 500 }
      );
    }

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
      { error: "Ошибка при оценке задания. Попробуйте позже." },
      { status: 500 }
    );
  }
}
