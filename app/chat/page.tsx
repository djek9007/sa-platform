import type { Metadata } from "next";
import ChatWindow from "@/components/ChatWindow";

export const metadata: Metadata = {
  title: "Чат с ИИ — Курс «Системный и Бизнес-анализ»",
  description: "Задавайте вопросы ИИ-ассистенту по материалам курса системного анализа.",
};

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Чат с ИИ-ассистентом
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Задавайте вопросы по материалам курса. ИИ-ассистент поможет разобраться в сложных темах.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
