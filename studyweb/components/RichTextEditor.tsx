"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Bold, Italic, Code, List, ListOrdered, Link as LinkIcon, 
  Heading, Eye, Edit3, Image as ImageIcon, Quote
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  minHeight = "200px" 
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && activeTab === "write") {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, parseInt(minHeight))}px`;
    }
  }, [value, activeTab, minHeight]);

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultText;
    
    const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);
    
    onChange(newText);
    
    // Focus and restore cursor position after render
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Keyboard shortcuts
    if ((e.ctrlKey || e.metaKey)) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertText('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*', 'italic text');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)', 'link text');
          break;
      }
    }
    
    // Auto-indent on Enter in lists (basic)
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const currentLine = textarea.value.substring(0, start).split('\n').pop() || '';
      
      const bulletMatch = currentLine.match(/^(\s*)([-*]|\d+\.)\s/);
      if (bulletMatch) {
        e.preventDefault();
        const prefix = bulletMatch[1] + bulletMatch[2] + ' ';
        
        // If line is just the bullet, remove it instead of adding a new one
        if (currentLine.trim() === bulletMatch[2]) {
          onChange(
            textarea.value.substring(0, start - currentLine.length) + 
            textarea.value.substring(start)
          );
        } else {
          // If numbered list, increment number
          let nextPrefix = prefix;
          if (bulletMatch[2].match(/\d+\./)) {
            const num = parseInt(bulletMatch[2]);
            nextPrefix = bulletMatch[1] + (num + 1) + '. ';
          }
          
          const newText = textarea.value.substring(0, start) + '\n' + nextPrefix + textarea.value.substring(start);
          onChange(newText);
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1 + nextPrefix.length;
          }, 0);
        }
      }
    }
  };

  const tools = [
    { icon: Bold, label: "Bold (Ctrl+B)", action: () => insertText('**', '**', 'bold text') },
    { icon: Italic, label: "Italic (Ctrl+I)", action: () => insertText('*', '*', 'italic text') },
    { divider: true },
    { icon: Heading, label: "Heading", action: () => insertText('### ', '', 'Heading') },
    { icon: Quote, label: "Quote", action: () => insertText('\n> ', '', 'quote') },
    { divider: true },
    { icon: Code, label: "Code", action: () => insertText('`', '`', 'code') },
    { icon: Code, label: "Code Block", action: () => insertText('\n```\n', '\n```\n', 'code block') },
    { divider: true },
    { icon: List, label: "Bullet List", action: () => insertText('\n- ', '', 'item') },
    { icon: ListOrdered, label: "Numbered List", action: () => insertText('\n1. ', '', 'item') },
    { divider: true },
    { icon: LinkIcon, label: "Link (Ctrl+K)", action: () => insertText('[', '](url)', 'link text') },
    { icon: ImageIcon, label: "Image", action: () => insertText('![', '](image-url)', 'alt text') },
  ];

  return (
    <div className="flex flex-col border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#C9984E] transition-colors bg-white shadow-sm">
      {/* Toolbar & Tabs */}
      <div className="flex flex-wrap items-center justify-between bg-gray-50 border-b border-gray-200 p-2 gap-2">
        
        {/* Formatting Tools */}
        <div className="flex items-center gap-1 flex-wrap">
          {activeTab === "write" && tools.map((tool, i) => {
            if (tool.divider) {
              return <div key={`div-${i}`} className="w-px h-6 bg-gray-300 mx-1" />;
            }
            const Icon = tool.icon;
            if (!Icon) return null;
            return (
              <button
                key={`tool-${i}`}
                type="button"
                onClick={tool.action}
                title={tool.label}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "write" 
                ? "bg-white text-[#B8873D] shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Edit3 size={16} /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "preview" 
                ? "bg-white text-[#B8873D] shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Eye size={16} /> Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      <div className="relative flex-1">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-4 resize-none outline-none text-gray-800 leading-relaxed font-sans min-h-[200px]"
            style={{ minHeight }}
          />
        ) : (
          <div 
            className="w-full p-6 overflow-y-auto bg-gray-50/30"
            style={{ minHeight }}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-gray-400 italic text-center mt-10">Nothing to preview yet</div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      {activeTab === "write" && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
          <span>Markdown is supported</span>
          <span>{value.length} characters</span>
        </div>
      )}
    </div>
  );
}
