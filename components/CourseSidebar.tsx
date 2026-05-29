"use client";

import Link from "next/link";
import { useState } from "react";

interface SidebarModule {
  id: string;
  title: string;
  slug: string;
  lessons?: { slug: string; title: string }[];
}

interface CourseSidebarProps {
  modules: SidebarModule[];
  currentModuleId?: string;
  currentLessonSlug?: string;
}

/**
 * CourseSidebar — Collapsible sidebar navigation for the course.
 *
 * Displays all 9 modules. The current module is highlighted with the `.active`
 * CSS class. When clicking a module, its lessons are expanded/inlined below
 * the module link. On mobile the sidebar is hidden behind a toggle button.
 *
 * Uses the global `.sidebar-link` CSS class from globals.css.
 */
export default function CourseSidebar({
  modules,
  currentModuleId,
  currentLessonSlug,
}: CourseSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(
    currentModuleId ?? null,
  );

  const toggleModule = (id: string) => {
    setExpandedModule((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label={isMobileOpen ? "Закрыть навигацию" : "Открыть навигацию"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
        {isMobileOpen ? "Закрыть" : "Модули"}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-full lg:w-64 flex-shrink-0
          ${isMobileOpen ? "block" : "hidden lg:block"}
        `}
      >
        <nav className="space-y-1">
          {modules.map((mod) => {
            const isCurrent = mod.id === currentModuleId;
            const isExpanded = expandedModule === mod.id;
            const hasLessons =
              Array.isArray(mod.lessons) && mod.lessons.length > 0;

            return (
              <div key={mod.id}>
                {/* Module link (clickable for navigation + expand) */}
                <div className="flex items-center">
                  <Link
                    href={`/course/${mod.id}`}
                    className={`sidebar-link flex-1 ${
                      isCurrent ? "active" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="font-medium">{mod.id}.</span>{" "}
                    {mod.title}
                  </Link>

                  {/* Expand/collapse button */}
                  {hasLessons && (
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="p-2 mr-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label={
                        isExpanded
                          ? "Свернуть уроки"
                          : "Развернуть уроки"
                      }
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
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
                    </button>
                  )}
                </div>

                {/* Expanded lessons */}
                {isExpanded && hasLessons && (
                  <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-3 space-y-0.5 mt-0.5 mb-1">
                    {mod.lessons!.map((lesson) => (
                      <Link
                        key={lesson.slug}
                        href={`/course/${mod.id}/${lesson.slug}`}
                        className={`sidebar-link text-sm ${
                          currentModuleId === mod.id &&
                          currentLessonSlug === lesson.slug
                            ? "active"
                            : ""
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {lesson.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
