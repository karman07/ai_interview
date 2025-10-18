import React, { useState } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  placeholder = '// Write your code here...',
  readOnly = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
    };
    return labels[lang] || lang;
  };

  const getPlaceholderByLanguage = (lang: string) => {
    const placeholders: Record<string, string> = {
      javascript: '// Write your JavaScript code here...',
      python: '# Write your Python code here...',
      java: '// Write your Java code here...',
      cpp: '// Write your C++ code here...',
    };
    return placeholders[lang] || placeholder;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getLanguageLabel(language)}</span>
          <span className="text-xs text-gray-400">({language})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className={`relative border-2 ${isFocused ? 'border-blue-500' : 'border-gray-300'} rounded-b-lg overflow-hidden`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={getPlaceholderByLanguage(language)}
          readOnly={readOnly}
          className="w-full h-96 p-4 pl-12 font-mono text-sm bg-gray-50 focus:bg-white focus:outline-none resize-none"
          spellCheck={false}
        />
        
        {/* Line numbers (optional enhancement) */}
        <div className="absolute top-0 left-0 p-4 text-gray-400 font-mono text-sm select-none pointer-events-none">
          {value.split('\n').map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
