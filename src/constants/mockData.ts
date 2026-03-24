// Static mock data for lazy loading fallbacks
import { Subject } from "@/contexts/SubjectsContext";
import { Lesson as LessonDetail, Quiz } from "@/contexts/LessonsContext";
import { InterviewQuestion } from "@/contexts/InterviewContext";
import { Result } from "@/types/results";

// Mock Subjects Data - Empty array to force API fetch
export const mockSubjects: Subject[] = [];
//
// Mock Lessons Detail Data - Empty array to force API fetch
export const mockLessonsDetail: LessonDetail[] = [];

// Mock Quiz Data - Empty object to force API fetch
export const mockQuizzes: Record<string, Quiz[]> = {};

// Mock Interview Questions
export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    question: "Explain the difference between let, const, and var in JavaScript.",
    answer: "let and const have block scope while var has function scope. const cannot be reassigned while let can be.",
  },
  {
    question: "What is the difference between == and === in JavaScript?",
    answer: "== performs type coercion while === performs strict equality comparison without type conversion.",
  },
  {
    question: "Explain event bubbling in JavaScript.",
    answer: "Event bubbling is when an event starts from the target element and bubbles up to parent elements.",
  },
  {
    question: "What is a closure in JavaScript?",
    answer: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
  },
  {
    question: "Explain the concept of hoisting in JavaScript.",
    answer: "Hoisting is JavaScript's behavior of moving variable and function declarations to the top of their scope during compilation.",
  },
];

// Mock Results Data
export const mockResults: Result[] = [
  {
    _id: "mock-result-1",
    owner: "mock-user-1",
    jobDescription: "Frontend Developer Position - JavaScript & React",
    questions: [
      "Explain the difference between let, const, and var",
      "What is event bubbling?",
      "How do React hooks work?"
    ],
    difficulty: "intermediate",
    items: [
      {
        question: "Explain the difference between let, const, and var",
        answer: "let and const have block scope while var has function scope",
        isCorrect: true,
        explanation: "Correct! Block scope is a key difference between modern and legacy variable declarations.",
        score: 10
      },
      {
        question: "What is event bubbling?",
        answer: "Events propagate from child to parent elements",
        isCorrect: true,
        explanation: "Perfect understanding of event propagation.",
        score: 10
      }
    ],
    overall: {
      summary: "Great understanding of JavaScript fundamentals. Consider improving async/await concepts.",
      overallScore: 85
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    _id: "mock-result-2",
    owner: "mock-user-1",
    jobDescription: "React Developer - Component Architecture",
    questions: [
      "Explain React component lifecycle",
      "What are React hooks?",
      "How does virtual DOM work?"
    ],
    difficulty: "advanced",
    items: [
      {
        question: "Explain React component lifecycle",
        answer: "Components mount, update, and unmount with specific lifecycle methods",
        isCorrect: true,
        explanation: "Excellent knowledge of React lifecycle.",
        score: 10
      }
    ],
    overall: {
      summary: "Excellent knowledge of React patterns. Well done!",
      overallScore: 92
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    _id: "mock-result-3",
    owner: "mock-user-1", 
    jobDescription: "Full Stack Developer - System Design Focus",
    questions: [
      "Design a scalable chat system",
      "Explain database sharding",
      "What is load balancing?"
    ],
    difficulty: "expert",
    items: [
      {
        question: "Design a scalable chat system",
        answer: "Use WebSockets, message queues, and horizontal scaling",
        isCorrect: true,
        explanation: "Good approach to system design.",
        score: 8
      }
    ],
    overall: {
      summary: "Good foundation in system design. Focus on scalability patterns.",
      overallScore: 78
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  },
];

// Loading states configuration
export const LOADING_CONFIG = {
  SHOW_STATIC_DATA_DELAY: 1000, // Show static data after 1 second of loading
  RETRY_DELAY: 3000, // Retry failed requests after 3 seconds
  MAX_RETRIES: 3, // Maximum number of retry attempts
};