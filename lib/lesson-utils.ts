/**
 * Lesson navigation utilities.
 *
 * Provides helpers for computing prev/next lesson navigation within a module,
 * enabling the lesson viewer page to render pagination controls.
 *
 * @module lesson-utils
 */

import type { Module, Lesson } from "./types";

/**
 * Given a module and the current lesson slug, returns the previous and next
 * lesson objects along with the current lesson's index within the module's
 * lesson array.
 *
 * @param mod         - The module containing lessons to navigate.
 * @param currentSlug - The slug of the currently viewed lesson.
 * @returns An object with `prev` and `next` lessons (or `null` at boundaries)
 *          and the `currentIndex` of the current lesson (-1 if not found).
 */
export function getLessonNavigation(
  mod: Module,
  currentSlug: string,
): {
  prev: Lesson | null;
  next: Lesson | null;
  currentIndex: number;
} {
  const currentIndex = mod.lessons.findIndex((l) => l.slug === currentSlug);

  return {
    prev: currentIndex > 0 ? mod.lessons[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < mod.lessons.length - 1
        ? mod.lessons[currentIndex + 1]
        : null,
    currentIndex,
  };
}
