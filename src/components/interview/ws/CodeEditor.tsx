import React, { useState, useRef, useEffect } from 'react';
import {
    Code2,
    ChevronDown,
    RotateCcw,
    Play,
    Send,
    Terminal,
    X,
    Cpu,
    CheckCircle2,
    Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    { id: 'cpp', name: 'C++', ext: 'cpp', compiler: 'c++', version: '10.2.0', template: '#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}\n' },
    { id: 'java', name: 'Java', ext: 'java', compiler: 'java', version: '15.0.2', template: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello");\n    }\n}\n' },
    { id: 'javascript', name: 'JavaScript', ext: 'js', compiler: 'javascript', version: '18.15.0', template: '// Write your solution here\n\nfunction solution() {\n    return "Hello";\n}\n\n// Example usage\nconsole.log(solution());\n' },
    { id: 'typescript', name: 'TypeScript', ext: 'ts', compiler: 'typescript', version: '5.0.3', template: '// Write your solution here\n\nfunction solution(): void {\n    console.log("Hello");\n}\n\n// Example usage\nsolution();\n' },
    { id: 'go', name: 'Go', ext: 'go', compiler: 'go', version: '1.16.2', template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("Hello")\n}\n' },
    { id: 'rust', name: 'Rust', ext: 'rs', compiler: 'rust', version: '1.68.2', template: 'fn main() {\n    // Write your solution here\n    println!("Hello");\n}\n' },
    { id: 'c', name: 'C', ext: 'c', compiler: 'gcc', version: '10.2.0', template: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf("Hello\\n");\n    return 0;\n}\n' },
];

interface WSCodeEditorProps {
    onSubmitCode?: (code: string, language: LanguageConfig) => void;
    onKeyPress?: () => void;
}

export const WSCodeEditor: React.FC<WSCodeEditorProps> = ({ onSubmitCode, onKeyPress }) => {
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
        if (onKeyPress) onKeyPress();
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
            const apiBase = import.meta.env.VITE_AI_INTERVIEW_API || 'http://localhost:8001';
            const response = await fetch(`${apiBase}/api/v1/code/execute`, {
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
                setOutput(`Error: Execution failed (HTTP ${response.status})\n\nCheck your syntax and try again.`);
            } else {
                const result = await response.json();
                const runOutput = result.run?.output || 'No output collected.';
                const compileOutput = result.compile?.output || '';
                const stderr = result.run?.stderr || '';

                let fullOutput = '';
                if (compileOutput) fullOutput += `❯ COMPILATION\n${compileOutput}\n\n`;
                if (stderr && stderr !== runOutput) {
                    fullOutput += `❯ STDERR\n${stderr}\n\n`;
                }
                fullOutput += `❯ RESULT\n${runOutput}`;

                setOutput(fullOutput.trim());
            }
        } catch (err: unknown) {
            const elapsed = Math.round(performance.now() - startTime);
            setExecutionTime(elapsed);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setOutput(`Network failure: ${errorMessage}\n\nPlease check your connection.`);
        } finally {
            setIsRunning(false);
        }
    };

    const lineCount = code.split('\n').length;

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-8 py-6 bg-slate-900 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white tracking-widest uppercase">Editor</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language.name} 3.x</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-800" />

                    {/* Language Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-100 text-[11px] font-black uppercase tracking-wider transition-all border border-slate-700 hover:border-blue-500/50"
                        >
                            {language.name}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <AnimatePresence>
                            {showLangDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 mt-3 py-2 rounded-2xl shadow-2xl z-[100] min-w-[180px] bg-slate-900 border border-slate-800 backdrop-blur-3xl"
                                >
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.id}
                                            onClick={() => handleLanguageChange(lang)}
                                            className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-all ${lang.id === language.id ? 'text-blue-400 bg-blue-400/5' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCode(language.template); setOutput(''); setShowOutput(false); }}
                        className="p-3 rounded-xl text-slate-500 hover:text-white transition-all bg-slate-800/50 border border-transparent hover:border-slate-700"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all ${isRunning
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
                            }`}
                    >
                        {isRunning ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isRunning ? 'Executing...' : 'Run Lab'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (onSubmitCode) {
                                onSubmitCode(code, language);
                                setSubmitted(true);
                                setTimeout(() => setSubmitted(false), 2000);
                            }
                        }}
                        disabled={submitted || !code.trim()}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all ${submitted
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
                            }`}
                        title="Submit code and explain via voice"
                    >
                        {submitted ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        {submitted ? 'Verified!' : 'Submit'}
                    </motion.button>
                </div>
            </div>

            {/* Editing Surface */}
            <div className="flex-1 flex min-h-0 relative">
                <div className="flex-1 min-h-0 flex">
                    {/* Gutters */}
                    <div className="py-6 pl-6 pr-4 select-none overflow-hidden flex flex-col text-[11px] font-mono text-slate-700 bg-slate-950/50 border-r border-slate-900 text-right min-w-[60px]">
                        {Array.from({ length: 1 + Math.max(lineCount, 50) }, (_, i) => (
                            <div key={i} className="leading-[1.8] h-[1.8em]">{i + 1}</div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 bg-slate-950 relative">
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full py-6 px-6 resize-none outline-none text-[13px] leading-[1.8] text-slate-300 bg-transparent font-mono selection:bg-blue-500/30 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
                            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                    </div>
                </div>

                {/* Intelligent Output Panel */}
                <AnimatePresence>
                    {showOutput && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-[38%] h-full bg-slate-900 border-l border-slate-800 shadow-[-20px_0_40px_rgba(0,0,0,0.4)] z-50 flex flex-col"
                        >
                            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-blue-400" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Compiler Output</span>
                                </div>
                                <button
                                    onClick={() => setShowOutput(false)}
                                    className="p-2 text-slate-500 hover:text-white transition-all hover:bg-slate-800 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-6">
                                <pre className="text-xs font-mono leading-relaxed text-slate-400 whitespace-pre-wrap selection:bg-blue-500/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    {output}
                                </pre>
                            </div>
                            {executionTime !== null && (
                                <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Processed {lineCount} lines in {executionTime}ms
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="px-8 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Command className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{language.compiler} mode</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">UTF-8 • LN {lineCount}</span>
                </div>

                {!showOutput && output && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowOutput(true)}
                        className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        Re-open Console
                    </motion.button>
                )}
            </div>
        </div>
    );
};
