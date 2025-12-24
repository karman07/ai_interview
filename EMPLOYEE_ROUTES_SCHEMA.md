# Employee Frontend - Routes & Schema

## 🛣️ Routes

### Main Routes
```javascript
/employee/dashboard                   // Dashboard with stats
/employee/jobs                      // Browse available jobs
/employee/jobs/:jobId               // Job details
/employee/applications              // My applications
/employee/applications/:applicationId // Application details
/employee/interviews                // Interview sessions
/employee/interviews/:sessionId     // Specific interview
/employee/messages                  // Chat interface
/employee/messages/:chatId          // Specific chat
/employee/invitations               // Employer invitations
/employee/profile                   // Employee profile
/employee/resume                    // Resume management
```

### API Routes
```javascript
// Job Browsing
GET    /api/jobs                           // Browse all jobs
GET    /api/jobs/:jobId                    // Job details
POST   /api/jobs/:jobId/apply              // Apply to job

// Applications
GET    /api/jobs/applications/my           // My applications
GET    /api/jobs/applications/:applicationId // Application details
PUT    /api/jobs/applications/:applicationId // Update application

// AI Job Matching
POST   /api/ai-matcher/best-jobs-for-resume // Get recommended jobs
POST   /api/ai-matcher/upload-resume        // Upload resume for AI

// Interviews
GET    /api/interview-rounds/sessions/my   // My interview sessions
POST   /api/interview-rounds/start         // Start new interview
GET    /api/interview-rounds/analytics/:userId // Interview analytics

// Chat
GET    /api/chat/my-chats                  // My chats
GET    /api/chat/:chatId                   // Specific chat
POST   /api/chat/:chatId/message           // Send message
PATCH  /api/chat/:chatId/read              // Mark as read
GET    /api/chat/unread/count              // Unread count

// Employer Requests
GET    /api/jobs/employer-requests/received // Received invitations
PATCH  /api/jobs/employer-requests/:requestId/respond // Respond to invitation

// Profile & Resume
GET    /api/users/profile                  // User profile
PUT    /api/users/profile                  // Update profile
POST   /api/users/upload-resume            // Upload resume
```

---

## 📋 Schema Definitions

### User Profile Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: 'employee',
  company: String,
  industry: String,
  jobDescription: String,
  resumeUrl: String,
  profileImageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Schema (Employee View)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  requirements: [String],
  salaryRange: {
    min: Number,
    max: Number
  },
  location: String,
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship',
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive',
  skills: [String],
  benefits: [String],
  companyInfo: String,
  employerId: {
    _id: ObjectId,
    name: String,
    company: String
  },
  isActive: Boolean,
  postedAt: Date,
  applicationCount: Number,
  hasApplied: Boolean
}
```

### My Applications Schema
```javascript
{
  _id: ObjectId,
  jobId: {
    _id: ObjectId,
    title: String,
    company: String,
    location: String
  },
  employerId: {
    _id: ObjectId,
    name: String,
    company: String
  },
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired',
  coverLetter: String,
  aiMatchingScore: {
    overallMatch: Number,
    skillsMatch: Number,
    experienceMatch: Number,
    matchingKeywords: [String],
    missingSkills: [String],
    aiRecommendation: String
  },
  interviewScores: {
    overall: Number,
    technical: Number,
    behavioral: Number,
    problemSolving: Number,
    hr: Number,
    totalInterviews: Number,
    lastInterviewDate: Date
  },
  employerNotes: String,
  rejectionReason: String,
  appliedAt: Date,
  statusUpdatedAt: Date
}
```

### Interview Session Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'technical' | 'behavioral' | 'hr' | 'problem-solving',
  status: 'in-progress' | 'completed' | 'abandoned',
  questions: [{
    questionId: ObjectId,
    question: String,
    answer: String,
    score: Number,
    feedback: String,
    timeSpent: Number
  }],
  overallScore: Number,
  feedback: String,
  duration: Number,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}
```

### Interview Analytics Schema
```javascript
{
  userId: ObjectId,
  overall: {
    totalInterviews: Number,
    averageScore: Number,
    bestOverallScore: Number,
    bestSessionId: String,
    lastInterviewDate: Date,
    improvementTrend: Number
  },
  technical: {
    totalInterviews: Number,
    averageScore: Number,
    bestScore: Number,
    strengths: [String],
    weaknesses: [String]
  },
  behavioral: {
    totalInterviews: Number,
    averageScore: Number,
    bestScore: Number,
    strengths: [String],
    weaknesses: [String]
  },
  problemSolving: {
    totalInterviews: Number,
    averageScore: Number,
    bestScore: Number,
    strengths: [String],
    weaknesses: [String]
  },
  hr: {
    totalInterviews: Number,
    averageScore: Number,
    bestScore: Number,
    strengths: [String],
    weaknesses: [String]
  }
}
```

### AI Job Recommendations Schema
```javascript
{
  success: Boolean,
  recommendations: [{
    jobId: String,
    matchScore: Number,        // 0-100
    skillsMatch: Number,       // 0-100
    experienceMatch: Number,   // 0-100
    salaryMatch: Number,       // 0-100
    locationMatch: Number,     // 0-100
    matchingKeywords: [String],
    missingSkills: [String],
    jobDetails: {
      title: String,
      company: String,
      location: String,
      salary: String,
      jobType: String,
      description: String
    },
    reasons: [String],
    hasApplied: Boolean
  }],
  totalJobs: Number
}
```

### Employer Invitation Schema
```javascript
{
  _id: ObjectId,
  jobId: {
    _id: ObjectId,
    title: String,
    company: String,
    location: String,
    salaryRange: {
      min: Number,
      max: Number
    }
  },
  employerId: {
    _id: ObjectId,
    name: String,
    company: String
  },
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
  message: String,
  employeeResponse: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Schema (Employee View)
```javascript
{
  _id: ObjectId,
  employerId: {
    _id: ObjectId,
    name: String,
    company: String
  },
  jobId: {
    _id: ObjectId,
    title: String
  },
  messages: [{
    senderId: ObjectId,
    content: String,
    type: 'text' | 'file' | 'system',
    fileUrl: String,
    timestamp: Date,
    isRead: Boolean
  }],
  lastMessageAt: Date,
  unreadCount: Number,
  isActive: Boolean
}
```

### Employee Dashboard Stats Schema
```javascript
{
  totalApplications: Number,
  pendingApplications: Number,
  interviewsScheduled: Number,
  totalInterviews: Number,
  averageInterviewScore: Number,
  bestInterviewScore: Number,
  jobRecommendations: Number,
  unreadMessages: Number,
  recentApplications: [{
    _id: String,
    jobTitle: String,
    company: String,
    status: String,
    appliedAt: Date
  }],
  upcomingInterviews: [{
    _id: String,
    type: String,
    scheduledAt: Date
  }]
}
```

### Job Application Request Schema
```javascript
{
  coverLetter: String
}
```

### Resume Upload Schema
```javascript
{
  resumeFile: File,
  resumeText: String
}
```

### Interview Start Request Schema
```javascript
{
  type: 'technical' | 'behavioral' | 'hr' | 'problem-solving',
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### Invitation Response Schema
```javascript
{
  status: 'accepted' | 'rejected',
  employeeResponse: String
}
```

### Profile Update Schema
```javascript
{
  name: String,
  company: String,
  industry: String,
  jobDescription: String,
  profileImageUrl: String
}
```