"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatWindowProps {
  initialMessage?: string;
  lessonContext?: string;
}

export default function ChatWindow({
  initialMessage,
  lessonContext,
}: ChatWindowProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessageType[]>(
    initialMessage
      ? [
          {
            id: "assistant-intro",
            role: "assistant",
            content: initialMessage,
            timestamp: new Date(),
          },
        ]
      : [
          {
            id: "assistant-intro",
            role: "assistant",
            content:
              "Привет! Я ИИ-ассистент курса «Системный и Бизнес-анализ». Задавай вопросы по материалу курса, и я помогу разобраться.",
            timestamp: new Date(),
          },
        ]
  );
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(content: string) {
    if (!session) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "assistant-intro")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          lessonContext,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: data.error || "Произошла ошибка",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Ошибка соединения. Попробуйте ещё раз.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Войдите, чтобы общаться с ИИ-ассистентом
          </p>
          <a
            href="/login"
            className="inline-flex px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Войти
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] max-h-[700px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 mb-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              🤖
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
