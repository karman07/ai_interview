# Learning Platform API Documentation

## Subjects API

### Schema
```typescript
ContentBlock {
  heading: string
  points: string[]
}

Subject {
  _id: string
  title: string
  description?: string
  category?: string
  level: string // default: 'Beginner'
  estimatedTime?: string
  thumbnailUrl?: string
  rating: number // default: 0
  status: string // default: 'draft'
  author?: string
  content: ContentBlock[]
  createdAt: Date
  updatedAt: Date
}
```

### Routes (User Access)
- **GET /subjects** - Get all subjects
- **GET /subjects/:id** - Get subject by ID

---

## Lessons API

### Schema
```typescript
ContentBlock {
  heading: string
  points: string[]
}

SubLesson {
  title: string
  content: ContentBlock[]
  videoUrl?: string
  order: number
}

Lesson {
  _id: string
  subjectId: ObjectId // ref: Subject
  title: string
  description: string
  content: ContentBlock[]
  videoUrl?: string
  subLessons: SubLesson[]
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Routes (User Access)å
- **GET /lessons/subject/:subjectId** - Get lessons by subject
- **GET /lessons/:id** - Get lesson by ID

---

## Quizzes API

### Schema
```typescript
Quiz {
  _id: string
  lessonId: ObjectId // ref: Lesson
  question: string
  options: string[]
  correctAnswer: string
  createdAt: Date
  updatedAt: Date
}
```

### Routes (User Access)
- **GET /quizzes/lesson/:lessonId** - Get quizzes for a lesson
- **GET /quizzes/:id** - Get quiz by ID
- **POST /quizzes/:id/check** - Check quiz answer
  - Body: `{ answer: string }`
  - Response: `{ correct: boolean, correctAnswer?: string }`

---

## Progress API

### Schema
```typescript
Progress {
  _id: string
  userId: ObjectId // ref: User
  lessonId: ObjectId // ref: Lesson
  status: 'not-started' | 'in-progress' | 'completed'
  progressPercent: number // 0-100
  score?: number
  timeSpent: number // minutes
  lastAccessed: Date
  badges: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Routes (User Access - Requires Auth)
- **GET /progress** - Get user's progress for all lessons
- **GET /progress/:lessonId** - Get user's progress for specific lesson
- **POST /progress** - Update lesson progress
  - Body: `UpdateLessonProgressDto`
- **DELETE /progress/:lessonId** - Reset lesson progress

---

## Common Response Patterns

### Success Response
```typescript
{
  data: T | T[]
  message?: string
}
```

### Error Response
```typescript
{
  statusCode: number
  message: string | string[]
  error: string
}
```

## Authentication
- Routes marked "Requires Auth" need JWT token in Authorization header
- Format: `Authorization: Bearer <token>`
- User info available via `@CurrentUser()` decorator in authenticated routeså