import React, { useState, useRef, useEffect } from 'react';

interface LanguageConfig {
    id: string;
    name: string;
    ext: string;
    compiler: string;
    version: string;
    template: string;
}

const LANGUAGES: LanguageConfig[] = [
    { id: 'python', name: 'Python', ext: 'py', compiler: 'python', version: '3.10.0', template: '# Write your solution here\n\ndef solution():\n    pass\n\n# Example usage\nif __name__ == "__main__":\n    solution()\n' },
    { id: 'cpp', name: 'C++', ext: 'cpp', compiler: 'gcc', version: '10.2.0', template: '#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}\n' },
    { id: 'java', name: 'Java', ext: 'java', compiler: 'java', version: '15.0.2', template: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello");\n    }\n}\n' },
    { id: 'javascript', name: 'JavaScript', ext: 'js', compiler: 'node', version: '18.15.0', template: '// Write your solution here\n\nfunction solution() {\n    return "Hello";\n}\n\n// Example usage\nconsole.log(solution());\n' },
    { id: 'typescript', name: 'TypeScript', ext: 'ts', compiler: 'typescript', version: '5.0.3', template: '// Write your solution here\n\nfunction solution(): void {\n    console.log("Hello");\n}\n\n// Example usage\nsolution();\n' },
    { id: 'go', name: 'Go', ext: 'go', compiler: 'go', version: '1.16.2', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("Hello")\n}\n' },
    { id: 'rust', name: 'Rust', ext: 'rs', compiler: 'rust', version: '1.68.2', template: 'fn main() {\n    // Write your solution here\n    println!("Hello");\n}\n' },
    { id: 'csharp', name: 'C#', ext: 'cs', compiler: 'mono', version: '6.12.0', template: 'using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main(string[] args) {\n        // Write your solution here\n        Console.WriteLine("Hello");\n    }\n}\n' },
    { id: 'ruby', name: 'Ruby', ext: 'rb', compiler: 'ruby', version: '3.0.1', template: '# Write your solution here\n\ndef solution\n  puts "Hello"\nend\n\n# Example usage\nsolution\n' },
];

interface WSCodeEditorProps {
    onSubmitCode?: (code: string, language: LanguageConfig) => void;
}

export const WSCodeEditor: React.FC<WSCodeEditorProps> = ({ onSubmitCode }) => {
    const [language, setLanguage] = useState<LanguageConfig>(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].template);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowLangDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLanguageChange = (lang: LanguageConfig) => {
        setLanguage(lang);
        setCode(lang.template);
        setOutput('');
        setShowOutput(false);
        setExecutionTime(null);
        setShowLangDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const { selectionStart, selectionEnd } = target;
            const newCode = code.substring(0, selectionStart) + '    ' + code.substring(selectionEnd);
            setCode(newCode);
            requestAnimationFrame(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 4;
                }
            });
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setShowOutput(true);
        setOutput('Compiling & running...\n');

        const startTime = performance.now();

        try {
            const response = await fetch('/piston/api/v2/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: language.compiler,
                    version: language.version,
                    files: [{ name: `main.${language.ext}`, content: code }],
                }),
            });

            const elapsed = Math.round(performance.now() - startTime);
            setExecutionTime(elapsed);

            if (!response.ok) {
                setOutput(`Error: API returned status ${response.status}\n\nTip: The code execution service may be temporarily unavailable.`);
            } else {
                const result = await response.json();
                const runOutput = result.run?.output || 'No output';
                const compileOutput = result.compile?.output || '';
                const stderr = result.run?.stderr || '';

                let fullOutput = '';
                if (compileOutput) fullOutput += `[Compile]\n${compileOutput}\n\n`;
                if (stderr && stderr !== runOutput) {
                    fullOutput += `[Stderr]\n${stderr}\n\n`;
                }
                fullOutput += `[Output]\n${runOutput}`;

                setOutput(fullOutput.trim());
            }
        } catch (err: unknown) {
            const elapsed = Math.round(performance.now() - startTime);
            setExecutionTime(elapsed);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setOutput(`Network Error: ${errorMessage}\n\nMake sure you have internet connectivity.`);
        } finally {
            setIsRunning(false);
        }
    };

    const lineCount = code.split('\n').length;

    return (
        <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">Code Editor</span>

                    {/* Language Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                            style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.15)' }}
                        >
                            {language.name}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showLangDropdown && (
                            <div className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[160px] max-h-[280px] overflow-y-auto bg-white border border-gray-200">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${lang.id === language.id ? 'text-blue-500 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setCode(language.template); setOutput(''); setShowOutput(false); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-white"
                        style={{
                            background: isRunning ? '#e5e7eb' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            color: isRunning ? '#9ca3af' : 'white',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>

                    <button
                        onClick={() => {
                            if (onSubmitCode) {
                                onSubmitCode(code, language);
                                setSubmitted(true);
                                setTimeout(() => setSubmitted(false), 2000);
                            }
                        }}
                        disabled={submitted || !code.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-white"
                        style={{
                            background: submitted ? 'rgba(34, 197, 94, 0.1)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: submitted ? '#22c55e' : 'white',
                            cursor: submitted ? 'default' : 'pointer',
                        }}
                    >
                        {submitted ? '✓ Sent!' : 'Submit to Interviewer'}
                    </button>
                </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 flex min-h-0">
                <div className="flex flex-1 min-h-0">
                    {/* Line Numbers */}
                    <div className="py-3 pl-3 pr-2 select-none overflow-hidden flex flex-col text-xs text-gray-400 bg-gray-50" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i} className="leading-[1.6]">{i + 1}</div>
                        ))}
                    </div>

                    {/* Code Input */}
                    <div className="flex-1 min-w-0 relative">
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full py-3 px-4 overflow-auto resize-none outline-none text-sm leading-[1.6] text-gray-800 bg-white"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                    </div>
                </div>

                {/* Output Panel */}
                {showOutput && (
                    <div className="w-2/5 flex flex-col border-l border-gray-200">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</span>
                            <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {output}
                        </pre>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">{language.name} • {lineCount} lines</span>
                    {executionTime !== null && <span className="text-xs text-gray-500">Executed in {executionTime}ms</span>}
                </div>
                {output && !showOutput && (
                    <button
                        onClick={() => setShowOutput(true)}
                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors font-medium uppercase tracking-wider"
                    >
                        View Output
                    </button>
                )}
            </div>
        </div>
    );
};
