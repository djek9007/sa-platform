import { getModule, getLesson } from "@/lib/course-parser";

export interface LessonContext {
  moduleTitle: string;
  lessonTitle: string;
  lessonSummary: string;
}

/**
 * Builds a context string for Gemini from the current lesson.
 * Extracts key concepts and content summary from the lesson markdown.
 */
export async function buildLessonContext(
  moduleId: string,
  lessonSlug: string
): Promise<string | null> {
  try {
    const [mod, lesson] = await Promise.all([
      getModule(moduleId),
      getLesson(moduleId, lessonSlug),
    ]);

    if (!mod || !lesson) return null;

    // Extract first meaningful paragraph from lesson content
    const lines = lesson.content.split("\n");
    const summaryLines: string[] = [];
    let inContent = false;

    for (const line of lines) {
      if (line.startsWith("## ")) break;
      if (inContent && line.trim() && !line.startsWith("#")) {
        summaryLines.push(line.trim());
        if (summaryLines.length >= 5) break;
      }
      if (line.startsWith("# ")) inContent = true;
    }

    return `Модуль ${moduleId}: ${mod.title}
Урок: ${lesson.title}

Краткое содержание:
${summaryLines.join(" ") || "Изучите урок для полного содержания."}

Всего в модуле ${mod.lessons.length} уроков.`;
  } catch {
    return null;
  }
}
