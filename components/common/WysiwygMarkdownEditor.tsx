import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';

interface WysiwygMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  minHeight?: string;
  onToggleChecklist?: (lineIndex: number, newCheckedState: boolean) => void;
}

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const WysiwygMarkdownEditor: React.FC<WysiwygMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  onBlur,
  onFocus,
  autoFocus = false,
  minHeight = '100px',
  onToggleChecklist,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastValueRef = useRef(value);

  // Sync with external value changes
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setEditValue(value);
    }
  }, [value]);

  // Handle auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Position cursor at the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const newValue = editValue.trim();
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      onChange(newValue);
    }
    onBlur?.();
  }, [editValue, onChange, onBlur]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(value); // Revert to original value
      setIsEditing(false);
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  }, [value]);

  const handleClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  const renderMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    try {
      return marked.parse(markdown) as string;
    } catch (error) {
      return markdown; // Fallback to plain text if parsing fails
    }
  };

  return (
    <div className="relative">
      {/* View mode - shows formatted markdown */}
      {!isEditing && (
        <div
          className={`cursor-text transition-colors rounded-md p-3 -m-3 hover:bg-gray-100/70 ${className}`}
          style={{ 
            minHeight,
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          onClick={handleClick}
        >
          {value ? (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      )}

      {/* Edit mode - shows textarea */}
      {isEditing && (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full resize-none cursor-text transition-colors rounded-md p-3 -m-3 outline-none bg-blue-50/50 ring-1 ring-blue-200 ${className}`}
            style={{ 
              minHeight,
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
            }}
          />
          

        </div>
      )}
    </div>
  );
}; 