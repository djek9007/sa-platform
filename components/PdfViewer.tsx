"use client";

import { useState } from "react";

interface PdfViewerProps {
  src: string;
  title: string;
}

export default function PdfViewer({ src, title }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          <span className="text-red-500">📄</span>
          {title}
        </div>
        <div className="flex gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Скачать
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {expanded ? "Свернуть" : "Просмотр"}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="h-[600px]">
          <iframe
            src={src}
            className="w-full h-full"
            title={title}
          />
        </div>
      )}
    </div>
  );
}
