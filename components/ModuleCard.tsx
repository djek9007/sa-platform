import Link from "next/link";
import type { Module } from "@/lib/types";

interface ModuleCardProps {
  module: Module;
}

/**
 * ModuleCard — A card component displaying a module summary.
 *
 * Shows the module number (with coloured badge), title, truncated description,
 * lesson count, and an assignment indicator if the module has one.
 * The entire card is wrapped in a Link pointing to `/course/{module.id}`.
 */
export default function ModuleCard({ module }: ModuleCardProps) {
  // Extract a short description (first ~80 chars of the full description)
  const shortDescription =
    module.description.length > 80
      ? module.description.slice(0, 80) + "…"
      : module.description;

  return (
    <Link
      href={`/course/${module.id}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
    >
      {/* Number badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-sm">
          {module.id}
        </span>

        {module.assignment && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Задание
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
        {module.title}
      </h3>

      {/* Description */}
      {module.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {shortDescription}
        </p>
      )}

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
          {module.lessonCount === 1
            ? "1 урок"
            : `${module.lessonCount} уроков`}
        </span>
      </div>
    </Link>
  );
}
