"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Progress {
  completedLessons: string[];
  completedModules: string[];
  totalCompleted: number;
  totalSubmissions: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [fetchError, setFetchError] = useState(false);

  // Loading is derived from session status — no synchronous setState in effects
  const isLoading = status === "loading" || (status === "authenticated" && !progress && !fetchError);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/progress")
        .then((res) => res.json())
        .then((data) => setProgress(data))
        .catch(() => setFetchError(true));
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Войдите в аккаунт
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Чтобы отслеживать прогресс, необходимо авторизоваться
        </p>
        <Link
          href="/login"
          className="inline-flex px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Мой прогресс
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {session.user?.name || session.user?.email}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {progress?.totalCompleted ?? 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Уроков пройдено
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {progress?.totalSubmissions ?? 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Заданий отправлено
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {progress?.completedModules.length ?? 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Модулей завершено
          </p>
        </div>
      </div>

      <Link
        href="/course"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        ← Продолжить обучение
      </Link>
    </div>
  );
}
