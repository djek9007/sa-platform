"use client";

import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => {
    try {
      const file = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .processSync(content);

      return String(file);
    } catch {
      return "<p>Ошибка при обработке содержимого</p>";
    }
  }, [content]);

  return (
    <div
      className={`prose ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
