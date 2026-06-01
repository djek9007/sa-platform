/**
 * Builds an evaluation prompt for Gemini to assess student assignment submissions.
 *
 * The prompt includes the assignment content (with criteria) and the student's
 * answers, and instructs Gemini to return structured JSON with scores and feedback.
 */

export interface EvaluationCriterion {
  name: string;
  maxScore: number;
}

export interface EvaluationResult {
  overallScore: number;
  maxScore: number;
  criteria: Array<{
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  summary: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Parses a markdown criteria table into structured criteria objects.
 * Handles tables with formats:
 *   | Критерий | Баллы |
 *   | Задача X | Критерий | Баллы |
 */
export function parseCriteriaFromMarkdown(content: string): EvaluationCriterion[] {
  const criteria: EvaluationCriterion[] = [];
  const lines = content.split("\n");
  let inTable = false;
  let headerCols = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect table start
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        // Count columns
        headerCols = trimmed.split("|").filter((c) => c.trim()).length;
        continue; // skip header
      }

      // Skip separator line (contains only ---, :--:, etc.)
      if (/^[\s|:\-]+$/.test(trimmed)) continue;

      // Parse data row
      const cells = trimmed.split("|").filter((c) => c.trim());
      if (cells.length < 2) continue;

      // Try to extract criterion name and score
      // Format 1: | Criterion | Score |
      // Format 2: | Task X | Criterion | Score |
      const lastCell = cells[cells.length - 1].trim();
      const score = parseFloat(lastCell);

      if (isNaN(score)) continue;

      // If 3+ cols and contains "Критерий" or "Баллы" in header — skip header row
      const firstCell = cells[0].trim().toLowerCase();
      if (firstCell.includes("критерий") || firstCell.includes("задача") && firstCell.includes("баллы")) {
        // This might be a sub-header
        continue;
      }

      // The criterion name is the cell before the last one (in 2-col) or second-to-last (in 3-col)
      const nameIndex = headerCols >= 3 ? cells.length - 2 : 0;
      const name = cells[nameIndex]?.trim() || `Критерий ${criteria.length + 1}`;

      // Skip total/maximum rows
      if (name.toLowerCase().includes("максимум") || name.toLowerCase().includes("итого")) {
        continue;
      }

      criteria.push({ name, maxScore: score });
    } else {
      if (inTable) inTable = false;
    }
  }

  // If criteria table detection fails, return a default
  if (criteria.length === 0) {
    criteria.push({ name: "Общая оценка", maxScore: 10 });
  }

  return criteria;
}

/**
 * Builds a system prompt for Gemini to evaluate an assignment.
 */
export function buildEvaluationSystemPrompt(): string {
  return `Ты — эксперт-преподаватель курса «Системный и Бизнес-анализ». Твоя задача — оценивать ответы студентов на практические задания.

## Правила оценки:
1. Оценивай строго по критериям, указанным в задании.
2. Будь объективным и конструктивным.
3. Указывай конкретно, что правильно, а что можно улучшить.
4. За неправильный ответ — снижай баллы, но объясняй почему.
5. За частично правильный ответ — давай частичные баллы с пояснением.
6. Отвечай на русском языке.
7. Возвращай ТОЛЬКО валидный JSON без дополнительного текста.

## Формат ответа (строгий JSON):
{
  "overallScore": <число>,
  "maxScore": <число>,
  "criteria": [
    {
      "name": "<название критерия>",
      "score": <число>,
      "maxScore": <число>,
      "feedback": "<развёрнутая обратная связь по критерию>"
    }
  ],
  "summary": "<краткое резюме по работе (2-3 предложения)>",
  "strengths": ["<сильная сторона 1>", "<сильная сторона 2>"],
  "improvements": ["<что улучшить 1>", "<что улучшить 2>"]
}`;
}

/**
 * Builds the full evaluation prompt with assignment context and student answer.
 */
export function buildEvaluationPrompt(
  assignmentTitle: string,
  assignmentContent: string,
  studentAnswer: string
): string {
  return `## Задание
${assignmentTitle}

## Условие задания
${assignmentContent}

## Ответ студента
${studentAnswer}

---
Оцени ответ студента по критериям из таблицы в задании. Верни JSON строго по формату, указанному в инструкции.`;
}
