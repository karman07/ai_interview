import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDSAQuestions } from '@/contexts/DSAQuestionsContext';
import { useDSAProgress } from '@/contexts/DSAProgressContext';
import { useCodeExecution } from '@/contexts/CodeExecutionContext';
import CodeEditor from '@/components/dsa/CodeEditor';

const DSAQuestionSolvePage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { currentQuestion, fetchQuestionById, likeQuestion, dislikeQuestion } = useDSAQuestions();
  const {
    currentProgress,
    fetchQuestionProgress,
    submitCode,
    bookmarkQuestion,
    addNotes,
    rateQuestion,
    recordHint,
    likeQuestion: likeQuestionProgress,
    dislikeQuestion: dislikeQuestionProgress,
  } = useDSAProgress();
  const { 
    runCode, 
    validateCode, 
    currentExecution, 
    isRunning, 
    error: executionError,
    clearError: clearExecutionError,
  } = useCodeExecution();

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'results'>('description');
  const [submitting, setSubmitting] = useState(false);
  const [showExecutionResults, setShowExecutionResults] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (questionId) {
      fetchQuestionById(questionId);
      fetchQuestionProgress(questionId).catch(() => {
        // Progress might not exist yet, which is fine
      });
    }
  }, [questionId]);

  useEffect(() => {
    if (currentProgress) {
      setNotes(currentProgress.userNotes || '');
      setRating(currentProgress.userRating || 0);
    }
  }, [currentProgress]);

  // Generate starter code based on language
  const getStarterCode = (lang: string, question: any) => {
    const signature = question?.functionSignatures?.find(
      (sig: any) => sig.language === lang
    );
    
    if (signature) {
      return signature.code || signature.signature || '';
    }

    // Default templates if no signature found
    const title = question?.title || 'solution';
    const functionName = title.toLowerCase().replace(/\s+/g, '');
    
    switch (lang) {
      case 'javascript':
        return `/**\n * @param {type} param\n * @return {type}\n */\nfunction ${functionName}(param) {\n    // Your code here\n    \n}\n`;
      case 'python':
        return `def ${functionName}(param):\n    """\n    Your code here\n    """\n    pass\n`;
      case 'java':
        return `class Solution {\n    public ReturnType ${functionName}(ParamType param) {\n        // Your code here\n        \n    }\n}\n`;
      case 'cpp':
        return `class Solution {\npublic:\n    ReturnType ${functionName}(ParamType param) {\n        // Your code here\n        \n    }\n};\n`;
      default:
        return '// Write your code here\n';
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      const starterCode = getStarterCode(language, currentQuestion);
      if (starterCode) {
        setCode(starterCode);
      }
    }
  }, [currentQuestion, language]);

  // Automatic code validation with debounce
  useEffect(() => {
    if (!questionId || !code.trim() || code.length < 10) {
      setValidationStatus(null);
      setValidationErrors([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setValidationStatus('checking');
      try {
        const result = await validateCode(questionId, {
          language,
          code,
        });

        if (result) {
          if (result.isValid) {
            setValidationStatus('valid');
            setValidationErrors([]);
          } else {
            // Only show validation errors if there are specific, meaningful error messages
            const errors = result.errors?.filter((err: string) => err && err.trim() !== '' && err !== 'Unknown syntax error') || [];
            if (errors.length > 0) {
              setValidationStatus('invalid');
              setValidationErrors(errors);
            } else {
              // If no specific errors but marked as invalid, don't show validation status
              // This prevents showing "Unknown syntax error" for valid code
              setValidationStatus(null);
              setValidationErrors([]);
            }
          }
        } else {
          setValidationStatus(null);
          setValidationErrors([]);
        }
      } catch (error) {
        console.error('Validation error:', error);
        // Don't show validation errors for API failures
        setValidationStatus(null);
        setValidationErrors([]);
      }
    }, 1500); // Validate 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [code, language, questionId]);

  const handleRunCode = async () => {
    if (!questionId || !code.trim()) {
      alert('Please write some code before running');
      return;
    }

    console.log('🚀 Running code...', { questionId, language, codeLength: code.length });
    clearExecutionError();
    
    const result = await runCode(questionId, {
      language,
      code,
      includeHiddenTests: false,
      analyzeComplexity: true,
    });

    console.log('📊 Execution result:', result);

    if (result) {
      setShowExecutionResults(true);
      setActiveTab('results');
      console.log('✅ Results tab activated');
      
      // Show notification
      const passed = result.passedTestCases || 0;
      const total = result.totalTestCases || 0;
      if (passed === total) {
        console.log(`✅ Success: ${passed}/${total} tests passed!`);
      } else {
        console.log(`⚠️ ${passed}/${total} tests passed`);
      }
    } else {
      console.error('❌ No result returned from runCode');
      alert('Failed to run code. Check console for errors.');
    }
  };

  const handleSubmit = async () => {
    if (!questionId || !code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setSubmitting(true);
    try {
      // Run code with all test cases (including hidden ones)
      clearExecutionError();
      const result = await runCode(questionId, {
        language,
        code,
        includeHiddenTests: true,
        analyzeComplexity: true,
      });

      if (result) {
        setShowExecutionResults(true);
        setActiveTab('results');

        // Determine status based on results
        const status = result.passedTestCases === result.totalTestCases ? 'Solved' : 
                      result.passedTestCases > 0 ? 'Attempted' : 'Failed';

        // Submit to progress tracking
        await submitCode(questionId, {
          language,
          code,
          status,
          testCasesPassed: result.passedTestCases,
          totalTestCases: result.totalTestCases,
          executionTime: result.averageExecutionTime,
          memoryUsed: result.peakMemoryUsage,
          timeSpent: Math.floor(Math.random() * 1800) + 300, // TODO: Track actual time spent
          errorMessage: result.error,
        });

        // Show success/failure message
        if (status === 'Solved') {
          alert('✅ Congratulations! All test cases passed!');
        } else {
          alert(`❌ ${result.passedTestCases}/${result.totalTestCases} test cases passed`);
        }

        // Refresh progress
        fetchQuestionProgress(questionId);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealHint = async (index: number) => {
    if (!questionId || !currentQuestion?.hints?.[index]) return;

    setRevealedHints([...revealedHints, index]);
    const hint = currentQuestion.hints[index];
    const hintContent = hint.text || hint.content || '';
    
    await recordHint(questionId, {
      hintContent,
    });
  };

  const handleSaveNotes = async () => {
    if (!questionId) return;
    await addNotes(questionId, notes);
    alert('Notes saved!');
  };

  const handleRatingChange = async (newRating: number) => {
    if (!questionId) return;
    setRating(newRating);
    await rateQuestion(questionId, newRating);
  };

  const handleLike = async () => {
    if (!questionId) return;
    await likeQuestion(questionId);
    await likeQuestionProgress(questionId);
  };

  const handleDislike = async () => {
    if (!questionId) return;
    await dislikeQuestion(questionId);
    await dislikeQuestionProgress(questionId);
  };

  const handleBookmark = async () => {
    if (!questionId) return;
    await bookmarkQuestion(questionId, !currentProgress?.isBookmarked);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dsa/questions')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Questions
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentQuestion.title}
              </h1>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    currentQuestion.difficulty
                  )}`}
                >
                  {currentQuestion.difficulty}
                </span>
                {currentProgress?.status && (
                  <span className="text-sm text-gray-600">
                    Status: <strong>{currentProgress.status}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Like"
              >
                👍 {currentQuestion.likes || 0}
              </button>
              <button
                onClick={handleDislike}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Dislike"
              >
                👎 {currentQuestion.dislikes || 0}
              </button>
              <button
                onClick={handleBookmark}
                className={`px-3 py-2 border rounded-lg ${
                  currentProgress?.isBookmarked
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                title="Bookmark"
              >
                {currentProgress?.isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4 border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 px-1 ${
                    activeTab === 'description'
                      ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`pb-2 px-1 ${
                    activeTab === 'submissions'
                      ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  My Submissions ({currentProgress?.attempts || 0})
                </button>
                {(showExecutionResults || currentExecution) && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`pb-2 px-1 relative ${
                      activeTab === 'results'
                        ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    Test Results
                    {currentExecution && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'results' ? (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {currentExecution ? (
                  <div className="space-y-4">
                    {/* Overall Result Banner */}
                    <div className={`rounded-lg p-4 ${
                      currentExecution.allTestsPassed || currentExecution.passedTestCases === currentExecution.totalTestCases
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-red-50 border-2 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-xl font-bold ${
                            currentExecution.allTestsPassed || currentExecution.passedTestCases === currentExecution.totalTestCases
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}>
                            {currentExecution.allTestsPassed || currentExecution.passedTestCases === currentExecution.totalTestCases
                              ? '✓ All Tests Passed!'
                              : `✗ ${currentExecution.failedTestCases || (currentExecution.totalTestCases - currentExecution.passedTestCases)} Test(s) Failed`
                            }
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {currentExecution.passedTestCases} of {currentExecution.totalTestCases} test cases passed
                          </p>
                        </div>
                        <div className={`text-4xl ${
                          currentExecution.allTestsPassed || currentExecution.passedTestCases === currentExecution.totalTestCases
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {currentExecution.allTestsPassed || currentExecution.passedTestCases === currentExecution.totalTestCases ? '🎉' : '😞'}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Execution Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-semibold ${
                            currentExecution.status === 'completed' || currentExecution.status === 'Completed'
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {(currentExecution.status || 'Unknown').toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Test Cases</p>
                          <p className="font-semibold text-blue-600">
                            {currentExecution.passedTestCases}/{currentExecution.totalTestCases}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Time</p>
                          <p className="font-semibold text-purple-600">
                            {currentExecution.totalExecutionTime || currentExecution.averageExecutionTime}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Max Memory</p>
                          <p className="font-semibold text-orange-600">
                            {(() => {
                              const memory = currentExecution.maxMemoryUsed || currentExecution.peakMemoryUsage;
                              return memory ? `${memory.toFixed(2)}MB` : 'N/A';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Complexity Analysis */}
                    {currentExecution.complexityAnalysis && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Complexity Analysis</h3>
                        <p className="text-sm mb-1">
                          <strong>Time:</strong> {currentExecution.complexityAnalysis.timeComplexity}
                        </p>
                        <p className="text-sm mb-1">
                          <strong>Space:</strong> {currentExecution.complexityAnalysis.spaceComplexity}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {currentExecution.complexityAnalysis.explanation}
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {currentExecution.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                        <pre className="text-sm text-red-700 whitespace-pre-wrap">
                          {currentExecution.error}
                        </pre>
                      </div>
                    )}

                    {/* Test Results */}
                    <div>
                      <h3 className="font-semibold mb-3">Test Case Results</h3>
                      <div className="space-y-3">
                        {currentExecution.testResults && currentExecution.testResults.length > 0 ? (
                          currentExecution.testResults.map((result, index) => (
                            <div
                              key={result.testCaseIndex || index}
                              className={`border rounded-lg p-4 ${
                                result.passed 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  Test Case {result.testCaseIndex !== undefined ? result.testCaseIndex + 1 : index + 1}
                                </span>
                                <span className={`font-semibold ${
                                  result.passed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {result.passed ? '✓ PASSED' : '✗ FAILED'}
                                </span>
                              </div>
                              <div className="text-sm space-y-1">
                                <p><strong>Input:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">{result.input}</code></p>
                                <p><strong>Expected:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">{result.expectedOutput}</code></p>
                                <p><strong>Actual:</strong> <code className={`px-2 py-0.5 rounded ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>{result.actualOutput}</code></p>
                                <p className="text-gray-600">
                                  <strong>Time:</strong> {result.executionTime}ms
                                  {result.memoryUsed !== undefined && result.memoryUsed > 0 && ` | Memory: ${result.memoryUsed.toFixed(2)}MB`}
                                </p>
                                {result.errorMessage && (
                                  <p className="text-red-600 bg-red-100 p-2 rounded mt-2">
                                    <strong>Error:</strong> {result.errorMessage}
                                  </p>
                                )}
                                {result.error && (
                                  <p className="text-red-600 bg-red-100 p-2 rounded mt-2">
                                    <strong>Error:</strong> {result.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No test results available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No test results yet. Run your code to see results.
                  </p>
                )}
              </div>
            ) : activeTab === 'description' ? (
              <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Problem Statement</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentQuestion.description}
                  </p>
                </div>

                {/* Test Cases Examples */}
                {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Examples</h2>
                    {currentQuestion.testCases
                      .filter(tc => !tc.isHidden)
                      .map((testCase, index) => (
                        <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="font-semibold mb-3 text-gray-800">Example {index + 1}:</p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Input:</span>
                              <code className="ml-2 bg-white px-2 py-1 rounded text-sm border border-gray-300">
                                {testCase.input}
                              </code>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Output:</span>
                              <code className="ml-2 bg-white px-2 py-1 rounded text-sm border border-gray-300">
                                {testCase.expectedOutput}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Additional Examples (if provided separately) */}
                {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">More Examples</h2>
                    {currentQuestion.examples.map((example, index) => {
                      // Handle string format like "Input: [2,7,11,15], 9 → Output: [0,1]"
                      if (typeof example === 'string') {
                        const parts = example.split('→');
                        const input = parts[0]?.replace('Input:', '').trim();
                        const output = parts[1]?.replace('Output:', '').trim();
                        
                        return (
                          <div key={index} className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="text-sm">
                              <span className="font-medium text-blue-900">Input:</span>
                              <code className="ml-2 bg-white px-2 py-0.5 rounded text-sm">{input}</code>
                              <span className="mx-2 text-blue-600">→</span>
                              <span className="font-medium text-blue-900">Output:</span>
                              <code className="ml-2 bg-white px-2 py-0.5 rounded text-sm">{output}</code>
                            </div>
                          </div>
                        );
                      }
                      
                      // Handle object format
                      return (
                        <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold mb-2">Example {index + 1}:</p>
                          <p className="text-sm mb-1">
                            <strong>Input:</strong> {example.input}
                          </p>
                          <p className="text-sm mb-1">
                            <strong>Output:</strong> {example.output}
                          </p>
                          {example.explanation && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Explanation:</strong> {example.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Constraints */}
                {currentQuestion.constraints && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Constraints</h2>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <ul className="space-y-2 text-gray-700">
                        {currentQuestion.constraints.timeComplexity && (
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">⏱️</span>
                            <span><strong>Time Complexity:</strong> {currentQuestion.constraints.timeComplexity}</span>
                          </li>
                        )}
                        {currentQuestion.constraints.spaceComplexity && (
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">💾</span>
                            <span><strong>Space Complexity:</strong> {currentQuestion.constraints.spaceComplexity}</span>
                          </li>
                        )}
                        {currentQuestion.constraints.timeLimit && (
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">⏰</span>
                            <span><strong>Time Limit:</strong> {currentQuestion.constraints.timeLimit}ms</span>
                          </li>
                        )}
                        {currentQuestion.constraints.memoryLimit && (
                          <li className="flex items-start">
                            <span className="text-purple-600 mr-2">🗄️</span>
                            <span><strong>Memory Limit:</strong> {currentQuestion.constraints.memoryLimit}MB</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Hints */}
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold">Hints 💡</h2>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showHints ? '🔒 Hide Hints' : '🔓 Show Hints'}
                      </button>
                    </div>
                    {showHints && (
                      <div className="space-y-2">
                        {currentQuestion.hints.map((hint, index) => (
                          <div key={hint.order || index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            {revealedHints.includes(index) ? (
                              <div>
                                <p className="text-xs text-yellow-700 font-semibold mb-1">Hint {hint.order || index + 1}</p>
                                <p className="text-sm text-gray-800">{hint.text || hint.content}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRevealHint(index)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                              >
                                💡 Click to reveal Hint {hint.order || index + 1}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Categories & Tags */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Topics</h2>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.categories?.map((cat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {currentProgress?.submissions && currentProgress.submissions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{currentProgress.submissions.length}</div>
                          <div className="text-xs text-gray-600">Total Submissions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {currentProgress.submissions.filter(s => s.isAccepted).length}
                          </div>
                          <div className="text-xs text-gray-600">Accepted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {currentProgress.bestExecutionTime?.toFixed(2) || 'N/A'}ms
                          </div>
                          <div className="text-xs text-gray-600">Best Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.floor((currentProgress.totalTimeSpent || 0) / 60)}m
                          </div>
                          <div className="text-xs text-gray-600">Time Spent</div>
                        </div>
                      </div>
                    </div>

                    {/* Submissions List */}
                    {[...currentProgress.submissions].reverse().map((submission, index) => {
                      const [showCode, setShowCode] = React.useState(false);
                      const isAccepted = submission.isAccepted;
                      const isBestTime = submission.executionTime === currentProgress.bestExecutionTime;
                      
                      return (
                        <div
                          key={index}
                          className={`border-2 rounded-lg p-4 transition-all ${
                            isAccepted
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isAccepted
                                    ? 'bg-green-600 text-white'
                                    : 'bg-red-600 text-white'
                                }`}
                              >
                                {isAccepted ? '✓ Accepted' : '✗ Failed'}
                              </span>
                              {isBestTime && (
                                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold">
                                  ⚡ Best Time
                                </span>
                              )}
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium capitalize">
                                {submission.language}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="text-xs text-gray-500">Test Cases</div>
                              <div className={`text-lg font-bold ${
                                submission.testCasesPassed === submission.totalTestCases
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {submission.testCasesPassed}/{submission.totalTestCases}
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="text-xs text-gray-500">Runtime</div>
                              <div className="text-lg font-bold text-blue-600">
                                {submission.executionTime?.toFixed(2) || 'N/A'}ms
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="text-xs text-gray-500">Memory</div>
                              <div className="text-lg font-bold text-purple-600">
                                {submission.memoryUsed ? `${submission.memoryUsed}MB` : 'N/A'}
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="text-xs text-gray-500">Status</div>
                              <div className={`text-sm font-semibold ${
                                isAccepted ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {submission.status}
                              </div>
                            </div>
                          </div>

                          {/* Error Message */}
                          {submission.errorMessage && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">⚠</span>
                                <div className="flex-1">
                                  <div className="font-semibold text-red-800 text-sm mb-1">Error</div>
                                  <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                                    {submission.errorMessage}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Code Toggle */}
                          <button
                            onClick={() => setShowCode(!showCode)}
                            className="w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                          >
                            <span>{showCode ? '▼' : '▶'}</span>
                            <span>{showCode ? 'Hide' : 'Show'} Code</span>
                          </button>

                          {/* Code Display */}
                          {showCode && (
                            <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <pre className="text-xs text-green-400 font-mono whitespace-pre">
                                {submission.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-500 text-lg font-medium">No submissions yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Submit your solution to see it here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Code Editor</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <CodeEditor value={code} onChange={setCode} language={language} />

              <div className="space-y-2">
                {/* Automatic Validation Status */}
                {validationStatus && (
                  <div className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                    validationStatus === 'valid'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : validationStatus === 'invalid'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {validationStatus === 'checking' && (
                      <>
                        <span className="animate-spin">⚙️</span>
                        <span>Checking syntax...</span>
                      </>
                    )}
                    {validationStatus === 'valid' && (
                      <>
                        <span>✓</span>
                        <span>Code syntax is valid</span>
                      </>
                    )}
                    {validationStatus === 'invalid' && validationErrors.length > 0 && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>✗</span>
                          <span className="font-medium">
                            {language === 'python' && validationErrors.some(e => e.toLowerCase().includes('indent'))
                              ? 'Indentation errors found:'
                              : 'Syntax errors found:'}
                          </span>
                        </div>
                        <ul className="ml-4 list-disc text-xs space-y-1">
                          {(validationErrors || []).map((error, i) => (
                            <li key={i} className="text-red-600">
                              {error}
                              {language === 'python' && error.toLowerCase().includes('indent') && (
                                <span className="block text-gray-600 text-xs mt-1">
                                  💡 Python requires consistent indentation (use 4 spaces)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Results indicator */}
                {currentExecution && (
                  <div className={`text-sm p-2 rounded-lg ${
                    currentExecution.passedTestCases === currentExecution.totalTestCases
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    Latest Run: {currentExecution.passedTestCases}/{currentExecution.totalTestCases} tests passed
                    <button
                      onClick={() => setActiveTab('results')}
                      className="ml-2 underline hover:no-underline"
                    >
                      View Results →
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || submitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {isRunning ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚙️</span> Running...
                      </span>
                    ) : (
                      '▶ Run Code'
                    )}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || isRunning}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚙️</span> Submitting...
                      </span>
                    ) : (
                      '✓ Submit Solution'
                    )}
                  </button>
                </div>
              </div>

              {executionError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Execution Error:</p>
                  <p className="text-sm mt-1">{executionError}</p>
                </div>
              )}
            </div>

            {/* Notes & Rating */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-3">My Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Save Notes
              </button>

              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Rate This Question</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star * 20)}
                      className={`text-2xl ${
                        rating >= star * 20 ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAQuestionSolvePage;
