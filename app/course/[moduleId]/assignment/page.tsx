import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getCourseData } from "@/lib/course-parser";
import type { Lesson } from "@/lib/types";
import CourseSidebar from "@/components/CourseSidebar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ModuleMedia from "@/components/ModuleMedia";
import AssignmentForm from "@/components/AssignmentForm";

/**
 * Assignment page — Server Component.
 *
 * Renders the assignment for a given module. Available at /course/[moduleId]/assignment.
 * Uses the same layout as the lesson page for visual consistency.
 *
 * Route: /course/[moduleId]/assignment
 */
export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = await getModule(moduleId);

  if (!mod || !mod.assignment) {
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

  const assignment = mod.assignment;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/course/${moduleId}`}
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
        Модуль {moduleId}: {mod.title}
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <CourseSidebar
          modules={allModules}
          currentModuleId={moduleId}
          currentLessonSlug="assignment"
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {/* Assignment header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-sm">
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
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Задание к модулю {moduleId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {assignment.title}
            </h1>

            {assignment.maxScore && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400">
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
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
                Максимальная оценка: {assignment.maxScore} баллов
              </p>
            )}
          </header>

          {/* Assignment content rendered as styled markdown */}
          <article className="mb-12">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-6">
              <MarkdownRenderer content={assignment.content} />
            </div>
          </article>

          {/* Assignment Form — student answer + AI evaluation */}
          <AssignmentForm
            moduleId={moduleId}
            assignmentTitle={assignment.title}
          />

          {/* Navigation back to module */}
          <nav className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-8">
            <div className="flex justify-between items-center">
              <Link
                href={`/course/${moduleId}`}
                className="group flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-1"
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
                <span>К списку уроков модуля</span>
              </Link>

              <Link
                href="/course"
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Все модули &rarr;
              </Link>
            </div>
          </nav>

          {/* Module Media */}
          {mod.media && mod.media.length > 0 && (
            <ModuleMedia media={mod.media} moduleId={mod.id} />
          )}
        </main>
      </div>
    </div>
  );
}
