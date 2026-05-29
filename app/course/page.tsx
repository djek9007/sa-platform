import { getCourseData } from "@/lib/course-parser";
import ModuleCard from "@/components/ModuleCard";

/**
 * Course overview page — Server Component.
 *
 * Fetches all modules via getCourseData() and renders them in a responsive
 * card grid. Each card links to /course/{module.id}.
 *
 * Route: /course
 */
export default async function CoursePage() {
  const courseData = await getCourseData();

  // Sort modules by their natural order (01, 02, …, 09)
  const modules = [...courseData.modules].sort(
    (a, b) => a.order - b.order,
  );

  // Derive subtitle text from actual data
  const totalModules = courseData.totalModules;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Программа курса
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
          {totalModules} модуль
          {totalModules === 1 ? "" : "ей"} по системному и бизнес-анализу
        </p>
      </div>

      {/* Module grid */}
      {modules.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">
            Модули пока не загружены. Проверьте структуру курса.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      )}
    </div>
  );
}
