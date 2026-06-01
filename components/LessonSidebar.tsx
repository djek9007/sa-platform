"use client";

import { useState } from "react";
import Link from "next/link";
import type { Module } from "@/lib/types";

interface LessonSidebarProps {
  /** The current module with its lessons */
  module: Module;
  /** Slug of the currently active lesson (highlighted in the list) */
  currentLessonSlug: string;
}

/**
 * LessonSidebar — Collapsible sidebar for lesson navigation within a module.
 *
 * Displays all lessons of the current module with numbered badges. The active
 * lesson is highlighted using the `.sidebar-link.active` CSS class.
 * On mobile the sidebar is hidden behind a toggle button with overlay.
 * Module header shows a back-link and the assignment link at the bottom
 * (if the module has one).
 *
 * Uses the global `.sidebar-link` CSS class from globals.css.
 */
export default function LessonSidebar({
  module,
  currentLessonSlug,
}: LessonSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button — fixed top-left, hidden on desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? "Закрыть навигацию" : "Открыть навигацию"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isOpen ? (
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
      </button>

      {/* Mobile overlay — hidden on desktop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[280px] flex-shrink-0
          bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
          overflow-y-auto z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          pt-16 lg:pt-6
        `}
      >
        {/* Module header with back-link */}
        <div className="px-4 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
          <Link
            href={`/course/${module.id}`}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            &larr; Модуль {module.id}
          </Link>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 leading-snug">
            {module.title}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {module.lessonCount}{" "}
            {module.lessonCount === 1
              ? "урок"
              : module.lessonCount < 5
                ? "урока"
                : "уроков"}
          </p>
        </div>

        {/* Lesson list */}
        <nav className="px-2">
          <ul className="space-y-0.5">
            {module.lessons.map((lesson) => {
              const isActive = lesson.slug === currentLessonSlug;
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/course/${module.id}/${lesson.slug}`}
                    className={`sidebar-link flex items-center gap-3 ${isActive ? "active" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {lesson.order}
                    </span>
                    <span className="text-sm leading-snug">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Assignment link (if present) */}
        {module.assignment && (
          <div className="px-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Link
              href={`/course/${module.id}/assignment`}
              className={`sidebar-link flex items-center gap-3 text-sm ${
                currentLessonSlug === "assignment" ? "active" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
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
              </span>
              <span>Задание</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
