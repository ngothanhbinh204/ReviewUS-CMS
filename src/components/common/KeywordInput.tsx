import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({
  keywords,
  onChange,
  placeholder = "Enter keywords and press Enter or Space",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      onChange([...keywords, trimmedKeyword]);
    }
    setInputValue('');
  };

  const removeKeyword = (indexToRemove: number) => {
    onChange(keywords.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = inputValue.trim();
    
    // Add keyword on Enter, Space, Tab, or Comma
    if (['Enter', ' ', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      if (value) {
        addKeyword(value);
      }
    }
    
    // Remove last keyword on Backspace when input is empty
    if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-add keyword when comma is typed
    if (value.includes(',')) {
      const parts = value.split(',');
      const newKeyword = parts[0].trim();
      if (newKeyword) {
        addKeyword(newKeyword);
      }
      setInputValue(parts.slice(1).join(','));
      return;
    }
    
    setInputValue(value);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`
        flex flex-wrap items-center gap-2 p-3 min-h-[42px] border border-gray-300 dark:border-gray-600 
        rounded-md bg-white dark:bg-gray-700 cursor-text focus-within:ring-2 focus-within:ring-blue-500 
        focus-within:border-blue-500 transition-all ${className}
      `}
    >
      {/* Keyword Tags */}
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-md"
        >
          {keyword}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeKeyword(index);
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={keywords.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
  );
};
