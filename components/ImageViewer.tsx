"use client";

import { useState } from "react";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export default function ImageViewer({ src, alt }: ImageViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain max-h-[400px] cursor-pointer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1.5 rounded-lg text-sm transition-opacity">
            🔍 Увеличить
          </span>
        </div>
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-4 py-1.5 rounded-full">
            {alt} — нажмите Esc или вне изображения, чтобы закрыть
          </p>
        </div>
      )}
    </>
  );
}
