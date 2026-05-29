import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">О курсе</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Полный учебный курс по системному и бизнес-анализу для ИТ-специалистов. 9 модулей с практическими заданиями и ИИ-ассистентом.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/course" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Все модули
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Чат с ИИ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Прогресс
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600 dark:text-gray-400">
                Открытый курс для всех желающих
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Работает на Next.js + Gemini AI
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>© {currentYear} Курс «Системный и Бизнес-анализ»</p>
        </div>
      </div>
    </footer>
  );
}
