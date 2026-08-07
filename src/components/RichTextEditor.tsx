'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  RotateCcw,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write product description...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlView, setIsHtmlView] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  // Sync internal editor content with initial/external value changes when not focused
  useEffect(() => {
    if (editorRef.current && !isHtmlView) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value);
  }, [value, isHtmlView]);

  const execCmd = (command: string, valueArg: string | undefined = undefined) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      setRawHtml(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setRawHtml(html);
    }
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    onChange(newHtml);
  };

  return (
    <div className="border border-input-border rounded-lg overflow-hidden bg-input-bg flex flex-col focus-within:border-accent transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-card-bg border-b border-card-border">
        <button
          type="button"
          onClick={() => execCmd('bold')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('italic')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('underline')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-card-border mx-1" />
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h2>')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('formatBlock', '<h3>')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-card-border mx-1" />
        <button
          type="button"
          onClick={() => execCmd('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCmd('insertOrderedList')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-card-border mx-1" />
        <button
          type="button"
          onClick={() => execCmd('removeFormat')}
          className="p-1.5 rounded hover:bg-card-border text-muted-text hover:text-white transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => setIsHtmlView(!isHtmlView)}
            className={`p-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              isHtmlView
                ? 'bg-accent text-black'
                : 'hover:bg-card-border text-muted-text hover:text-white'
            }`}
            title="Toggle HTML View"
          >
            <Code className="h-4 w-4" />
            <span className="text-[10px] uppercase">{isHtmlView ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isHtmlView ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          rows={6}
          className="w-full p-4 bg-transparent text-white font-mono text-xs outline-none resize-y min-h-[140px]"
          placeholder="<h1>HTML code...</h1>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="w-full p-4 min-h-[140px] max-h-[300px] overflow-y-auto text-white text-sm outline-none space-y-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-1 [&_b]:font-bold [&_strong]:font-bold focus:outline-none"
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
}
