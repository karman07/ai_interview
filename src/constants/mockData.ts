// Static mock data for lazy loading fallbacks
import { Subject } from "@/contexts/SubjectsContext";
import { Lesson as LessonDetail, Quiz } from "@/contexts/LessonsContext";
import { InterviewQuestion } from "@/contexts/InterviewContext";
import { Result } from "@/types/results";

// Mock Subjects Data
export const mockSubjects: Subject[] = [
  {
    _id: "mock-1",
    title: "JavaScript Fundamentals",
    description: "Master the basics of JavaScript programming language",
    category: "Programming",
    level: "Beginner",
    estimatedTime: "4 hours",
    author: "Tech Expert",
    status: "published",
    thumbnailUrl: "/api/placeholder/300/200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lessons: [
      {
        _id: "mock-lesson-1",
        title: "Variables and Data Types",
        content: "Learn about JavaScript variables and data types",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "mock-lesson-2",
        title: "Functions and Scope",
        content: "Understanding functions and variable scope",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    _id: "mock-2",
    title: "React Development",
    description: "Build modern web applications with React",
    category: "Frontend",
    level: "Intermediate",
    estimatedTime: "8 hours",
    author: "React Master",
    status: "published",
    thumbnailUrl: "/api/placeholder/300/200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lessons: [
      {
        _id: "mock-lesson-3",
        title: "Components and JSX",
        content: "Understanding React components and JSX syntax",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "mock-lesson-4",
        title: "State and Props",
        content: "Managing component state and passing props",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    _id: "mock-3",
    title: "System Design Basics",
    description: "Learn fundamental concepts of system design",
    category: "System Design",
    level: "Advanced",
    estimatedTime: "12 hours",
    author: "Architecture Expert",
    status: "published",
    thumbnailUrl: "/api/placeholder/300/200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lessons: [
      {
        _id: "mock-lesson-5",
        title: "Scalability Principles",
        content: "Understanding how to design scalable systems",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

// Mock Lessons Detail Data
export const mockLessonsDetail: LessonDetail[] = [
  {
    _id: "mock-lesson-detail-1",
    subjectId: "mock-1",
    title: "JavaScript Variables and Data Types",
    description: "Comprehensive guide to JavaScript variables and data types",
    content: [
      {
        heading: "Introduction to Variables",
        points: [
          "Variables are containers for storing data values",
          "JavaScript uses var, let, and const keywords to declare variables",
          "Variables can store different types of data",
        ],
      },
      {
        heading: "Data Types",
        points: [
          "Primitive types: string, number, boolean, null, undefined",
          "Object types: arrays, objects, functions",
          "JavaScript is dynamically typed",
        ],
      },
    ],
    videoUrl: "https://example.com/video1",
    subLessons: [
      {
        _id: "mock-sublesson-1",
        title: "Variable Declaration",
        content: [
          {
            heading: "Using let and const",
            points: [
              "let allows reassignment",
              "const is for constants",
              "Block scope vs function scope",
            ],
          },
        ],
        order: 1,
      },
    ],
    order: 1,
  },
];

// Mock Quiz Data
export const mockQuizzes: Record<string, Quiz[]> = {
  "mock-lesson-detail-1": [
    {
      _id: "mock-quiz-1",
      lessonId: "mock-lesson-detail-1",
      question: "Which keyword is used to declare a constant in JavaScript?",
      options: ["var", "let", "const", "final"],
      correctAnswer: "const",
    },
    {
      _id: "mock-quiz-2",
      lessonId: "mock-lesson-detail-1",
      question: "What type of scope do let and const have?",
      options: ["Function scope", "Block scope", "Global scope", "No scope"],
      correctAnswer: "Block scope",
    },
  ],
};

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