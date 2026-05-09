"use client";
import React, { useMemo } from "react";

// A simple custom Markdown parser
export const parseMarkdown = (text: string) => {
  if (!text) return "";

  let parsed = text;

  // 1. Code blocks (```code```)
  parsed = parsed.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-800 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-4 border border-gray-700"><code>$1</code></pre>'
  );

  // 2. Inline code (`code`)
  parsed = parsed.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded-md text-sm font-mono">$1</code>'
  );

  // 3. Headings (# Heading)
  parsed = parsed.replace(
    /^### (.*$)/gim,
    '<h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h3>'
  );
  parsed = parsed.replace(
    /^## (.*$)/gim,
    '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-100 pb-2">$1</h2>'
  );
  parsed = parsed.replace(
    /^# (.*$)/gim,
    '<h1 class="text-3xl font-black text-gray-900 mt-10 mb-5">$1</h1>'
  );

  // 4. Bold (**text**)
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

  // 5. Italic (*text*)
  parsed = parsed.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // 6. Links ([text](url))
  parsed = parsed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 transition-colors">$1</a>'
  );

  // 7. Unordered Lists (- item or * item)
  // Convert bullet points to ul/li. Needs a bit of trickery for multiline.
  parsed = parsed.replace(/^[*-] (.*$)/gim, '<li class="ml-4 list-disc marker:text-amber-500 mb-1">$1</li>');
  // Group adjacent <li> tags into <ul>
  parsed = parsed.replace(/(<li.*?>.*?<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>');

  // 8. Numbered Lists (1. item)
  parsed = parsed.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal marker:text-amber-600 font-bold mb-1"><span class="font-normal">$1</span></li>');
  // Group adjacent <li> tags into <ol>
  parsed = parsed.replace(/(<li class="ml-4 list-decimal.*?>.*?<\/li>\n?)+/g, '<ol class="my-3 space-y-1">$&</ol>');

  // 9. Blockquotes (> text)
  parsed = parsed.replace(
    /^> (.*$)/gim,
    '<blockquote class="border-l-4 border-amber-400 bg-amber-50 pl-4 py-2 italic text-gray-700 my-4 rounded-r-lg">$1</blockquote>'
  );

  // 10. Paragraphs (Line breaks)
  // Replace double line breaks with paragraph tags
  parsed = parsed.split(/\n\n+/).map(p => {
    // Don't wrap elements that are already block-level
    if (p.trim().startsWith('<pre') || p.trim().startsWith('<h') || p.trim().startsWith('<ul') || p.trim().startsWith('<ol') || p.trim().startsWith('<blockquote')) {
      return p;
    }
    return `<p class="mb-4 leading-relaxed text-gray-700">${p}</p>`;
  }).join('');

  // Replace single line breaks with <br> (only outside of pre blocks)
  // This is tricky without a proper AST, so we'll do a simple split by <pre> and replace inside non-pre parts
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
