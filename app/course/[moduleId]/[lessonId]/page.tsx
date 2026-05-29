import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule } from "@/lib/course-parser";
import { getLessonNavigation } from "@/lib/lesson-utils";
import type { Lesson } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import LessonSidebar from "@/components/LessonSidebar";
import ModuleMedia from "@/components/ModuleMedia";

/**
 * Lesson viewer page — Server Component.
 *
 * Route: /course/[moduleId]/[lessonId]
 *
 * Fetches the module and lesson from the course file system, then renders
 * a two-column layout:
 *   - Left sidebar with all lessons in the module (LessonSidebar)
 *   - Main content area with breadcrumb, title, markdown content, and
 *     prev/next navigation
 *
 * If the module is not found → 404 (notFound).
 * If the lesson is not found → inline error with a link back to the module.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;

  const mod = await getModule(moduleId);
  if (!mod) {
    notFound();
  }

  const lesson = mod.lessons.find((l: Lesson) => l.slug === lessonId);
  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Урок не найден
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Запрошенный урок не существует в этом модуле.
          </p>
          <Link
            href={`/course/${moduleId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
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
            К списку уроков
          </Link>
        </div>
      </div>
    );
  }

  const { prev, next } = getLessonNavigation(mod, lessonId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar — lesson navigation */}
      <LessonSidebar module={mod} currentLessonSlug={lessonId} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href={`/course/${moduleId}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            Модуль {module.id}: {mod.title} &rarr;
          </Link>
        </nav>

        {/* Lesson header */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Урок {lesson.order} из {mod.lessonCount}
          </p>
        </header>

        {/* Lesson content rendered as styled markdown */}
        <article className="mb-12">
          <MarkdownRenderer content={lesson.content} />
        </article>

        {/* Bottom navigation: prev / next / back to list */}
        <nav className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex justify-between items-center mb-6">
            {prev ? (
              <Link
                href={`/course/${moduleId}/${prev.slug}`}
                className="group flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors max-w-[45%]"
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
                <span className="truncate">{prev.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/course/${moduleId}/${next.slug}`}
                className="group flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors max-w-[45%] text-right"
              >
                <span className="truncate">{next.title}</span>
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
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
            ) : (
              <div />
            )}
          </div>

          <div className="text-center">
            <Link
              href={`/course/${moduleId}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
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
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
              К списку уроков
            </Link>
          </div>
        </nav>

        {/* Module Media */}
        {mod.media && mod.media.length > 0 && (
          <ModuleMedia media={mod.media} moduleId={mod.id} />
        )}
      </main>
    </div>
  );
}
