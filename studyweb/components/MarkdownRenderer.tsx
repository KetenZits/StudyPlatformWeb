"use client";
import React, { useMemo } from "react";

// A simple custom Markdown parser
export const parseMarkdown = (text: string) => {
  if (!text) return "";

  let parsed = text;

  // 1. Code blocks (```code```)
  parsed = parsed.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-700 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-4 border border-gray-600" style="box-shadow: inset 3px 3px 6px rgba(0,0,0,0.3), inset -3px -3px 6px rgba(255,255,255,0.05)"><code>$1</code></pre>'
  );

  // 2. Inline code (`code`)
  parsed = parsed.replace(
    /`([^`]+)`/g,
    '<code class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md text-sm font-mono">$1</code>'
  );

  // 3. Headings (# Heading)
  parsed = parsed.replace(
    /^### (.*$)/gim,
    '<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h3>'
  );
  parsed = parsed.replace(
    /^## (.*$)/gim,
    '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b border-gray-300/40 pb-2">$1</h2>'
  );
  parsed = parsed.replace(
    /^# (.*$)/gim,
    '<h1 class="text-3xl font-black text-gray-800 mt-10 mb-5">$1</h1>'
  );

  // 4. Bold (**text**)
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-800">$1</strong>');

  // 5. Italic (*text*)
  parsed = parsed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // 6. Links ([text](url))
  parsed = parsed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 underline decoration-purple-300 underline-offset-2 transition-colors">$1</a>'
  );

  // 7. Unordered Lists (- item or * item)
  parsed = parsed.replace(/^[*-] (.*$)/gim, '<li class="ml-4 list-disc marker:text-purple-500 mb-1">$1</li>');
  parsed = parsed.replace(/(<li.*?>.*?<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>');

  // 8. Numbered Lists (1. item)
  parsed = parsed.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal marker:text-purple-600 font-bold mb-1"><span class="font-normal">$1</span></li>');
  parsed = parsed.replace(/(<li class="ml-4 list-decimal.*?>.*?<\/li>\n?)+/g, '<ol class="my-3 space-y-1">$&</ol>');

  // 9. Blockquotes (> text)
  parsed = parsed.replace(
    /^> (.*$)/gim,
    '<blockquote class="border-l-4 border-purple-400 bg-purple-50/50 pl-4 py-2 italic text-gray-600 my-4 rounded-r-lg">$1</blockquote>'
  );

  // 10. Paragraphs (Line breaks)
  parsed = parsed.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<pre') || p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<ol') || p.trim().startsWith('<blockquote')) {
      return p;
    }
    return `<p class="mb-4 leading-relaxed text-gray-600">${p}</p>`;
  }).join('');

  const parts = parsed.split(/(<pre[\s\S]*?<\/pre>)/);
  parsed = parts.map(part => {
    if (part.startsWith('<pre')) return part;
    return part.replace(/\n/g, '<br />');
  }).join('');

  return parsed;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div 
      className={`prose prose-sm sm:prose-base max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
