"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface EvaluationResult {
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

interface AssignmentFormProps {
  moduleId: string;
  assignmentTitle: string;
}

export default function AssignmentForm({
  moduleId,
  assignmentTitle,
}: AssignmentFormProps) {
  const { data: session, status } = useSession();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 500)}px`;
    }
  }, [answer]);

  async function handleSubmit() {
    if (!answer.trim() || loading) return;

    setLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      const res = await fetch("/api/assignment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          content: answer.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEvaluation(data.evaluation);
        setSubmitted(true);
      } else {
        setError(data.error || "Произошла ошибка при проверке");
      }
    } catch {
      setError("Ошибка соединения. Проверьте подключение к интернету.");
    } finally {
      setLoading(false);
    }
  }

  // If not authenticated, show login prompt
  if (status === "unauthenticated") {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Войдите, чтобы отправить задание на проверку
        </p>
        <a
          href="/login"
          className="inline-flex px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Войти
        </a>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        ✍️ Ваш ответ
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Напишите ответы на задания в Markdown. После отправки ИИ-ассистент
        проверит вашу работу и даст обратную связь.
      </p>

      {!submitted ? (
        <>
          {/* Answer textarea */}
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Напишите ответы на задания модуля ${moduleId}...

Пример структуры ответа:

### Задача 1. Классификация требований
1. Функциональное требование
2. Бизнес-требование
...`}
              rows={12}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y text-sm font-mono"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {answer.length} символов • Markdown формат
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || answer.trim().length < 10}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                ИИ проверяет работу...
              </span>
            ) : (
              "📤 Отправить на проверку"
            )}
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Results */}
          {evaluation && (
            <div className="space-y-6">
              {/* Overall score */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Результат проверки
                  </h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {evaluation.overallScore}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      /{evaluation.maxScore}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {evaluation.summary}
                </p>
              </div>

              {/* Criteria breakdown */}
              <div className="space-y-3">
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  Оценка по критериям
                </h3>
                {evaluation.criteria.map((criterion, idx) => {
                  const percentage =
                    criterion.maxScore > 0
                      ? (criterion.score / criterion.maxScore) * 100
                      : 0;
                  const colorClass =
                    percentage >= 80
                      ? "bg-green-500"
                      : percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500";

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {criterion.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {criterion.score}/{criterion.maxScore}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {criterion.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Strengths */}
              {evaluation.strengths.length > 0 && (
                <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                    ✅ Что получилось хорошо
                  </h4>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-green-600 dark:text-green-400 flex gap-2"
                      >
                        <span>•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {evaluation.improvements.length > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
                  <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                    🔧 Что можно улучшить
                  </h4>
                  <ul className="space-y-1">
                    {evaluation.improvements.map((imp, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-600 dark:text-amber-400 flex gap-2"
                      >
                        <span>•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resubmit button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEvaluation(null);
                    setAnswer("");
                  }}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  🔄 Отправить заново
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEvaluation(null);
                    // Keep the answer for editing
                  }}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  ✏️ Редактировать ответ
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
