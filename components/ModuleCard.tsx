import Link from "next/link";
import type { Module } from "@/lib/types";

interface ModuleCardProps {
  module: Module;
  completedLessons?: string[];
  completedModules?: string[];
}

/**
 * ModuleCard — A card component displaying a module summary.
 *
 * Shows the module number, title, lesson count, and a dynamic progress
 * indicator based on the user's actual completion data.
 * The entire card is wrapped in a Link pointing to `/course/{module.id}`.
 *
 * Progress states:
 *   - Not started (no lessons completed)
 *   - In progress (some lessons completed)
 *   - Completed (all lessons completed, assignment optionally submitted)
 */
export default function ModuleCard({
  module,
  completedLessons = [],
  completedModules = [],
}: ModuleCardProps) {
  // Count completed lessons for this module (lessonId = "moduleId/slug")
  const moduleDone = completedLessons.filter((id) =>
    id.startsWith(module.id + "/"),
  ).length;

  const total = module.lessonCount;
  const fraction = total > 0 ? moduleDone / total : 0;
  const assignmentSubmitted = completedModules.includes(module.id);

  // Determine status
  let statusLabel: string;
  let statusColor: string;
  let progressPercent: number;

  if (moduleDone >= total && total > 0) {
    statusLabel = assignmentSubmitted ? "✅ Завершён" : "🟢 Завершён";
    statusColor = "text-green-600 dark:text-green-400";
    progressPercent = 100;
  } else if (moduleDone > 0) {
    statusLabel = `🟡 ${moduleDone}/${total} уроков`;
    statusColor = "text-amber-600 dark:text-amber-400";
    progressPercent = Math.round(fraction * 100);
  } else {
    statusLabel = "🔴 Не начат";
    statusColor = "text-gray-400 dark:text-gray-500";
    progressPercent = 0;
  }

  return (
    <Link
      href={`/course/${module.id}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
    >
      {/* Number badge + assignment label */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-sm">
          {module.id}
        </span>

        <div className="flex items-center gap-2">
          {assignmentSubmitted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Сдано
            </span>
          )}
          {module.assignment && !assignmentSubmitted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Задание
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
        {module.title}
      </h3>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor:
                progressPercent === 100
                  ? "rgb(34 197 94)"
                  : progressPercent > 0
                    ? "rgb(251 191 36)"
                    : "rgb(156 163 175)",
            }}
          />
        </div>
      </div>

      {/* Status label */}
      <p className={`text-sm font-medium mb-3 ${statusColor}`}>
        {statusLabel}
      </p>

      {/* Lesson count */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span>
          {total === 1 ? "1 урок" : `${total} уроков`}
        </span>
      </div>
    </Link>
  );
}
