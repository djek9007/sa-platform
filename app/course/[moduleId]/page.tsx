import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getCourseData } from "@/lib/course-parser";
import type { Lesson } from "@/lib/types";
import CourseSidebar from "@/components/CourseSidebar";
import ModuleMedia from "@/components/ModuleMedia";

/**
 * Module detail page — Server Component.
 *
 * Displays full module information including all lessons and the
 * assignment (if any). Uses CourseSidebar for module navigation.
 *
 * Route: /course/[moduleId]
 */
export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = await getModule(moduleId);

  // 404 if module not found
  if (!mod) {
    notFound();
  }

  // Fetch all modules for the sidebar
  const courseData = await getCourseData();
  const allModules = [...courseData.modules]
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      lessons: m.lessons.map((l: Lesson) => ({
        slug: l.slug,
        title: l.title,
      })),
      assignment: m.assignment
        ? { slug: m.assignment.slug, title: m.assignment.title }
        : undefined,
    }));

  // Sort lessons by order
  const sortedLessons = [...mod.lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb back link */}
      <Link
        href="/course"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Назад к программе курса
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <CourseSidebar
          modules={allModules}
          currentModuleId={moduleId}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Module header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-sm">
                {mod.id}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Модуль {mod.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {mod.title}
            </h1>
            {mod.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {mod.description}
              </p>
            )}
          </div>

          {/* Lessons list */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Уроки модуля
            </h2>

            {sortedLessons.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Уроки пока не добавлены.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedLessons.map((lesson, index) => (
                  <Link
                    key={lesson.slug}
                    href={`/course/${mod.id}/${lesson.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-200 group"
                  >
                    {/* Numbered badge */}
                    <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lesson.title}
                      </h3>
                    </div>

                    {/* Chevron */}
                    <svg
                      className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Assignment section */}
          {mod.assignment && (
            <section className="mt-10 p-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                  <svg
                    className="w-5 h-5"
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
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {mod.assignment.title}
                  </h2>
                  {mod.assignment.maxScore && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Максимальная оценка: {mod.assignment.maxScore} баллов
                    </p>
                  )}
                  <Link
                    href={`/course/${mod.id}/${mod.assignment.slug}`}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium text-sm hover:bg-amber-700 transition-colors"
                  >
                    Перейти к заданию
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Module Media */}
          {mod.media && mod.media.length > 0 && (
            <ModuleMedia media={mod.media} moduleId={mod.id} />
          )}
        </main>
      </div>
    </div>
  );
}
