# Employer Frontend - Routes & Schema

## 🛣️ Routes

### Main Routes
```javascript
/employer/dashboard                    // Dashboard with stats
/employer/jobs                        // Job list
/employer/jobs/create                 // Create new job
/employer/jobs/:jobId                 // Job details
/employer/jobs/:jobId/edit            // Edit job
/employer/jobs/:jobId/applications    // Job applications
/employer/jobs/:jobId/recommendations // AI recommendations
/employer/applications                // All applications
/employer/messages                    // Chat interface
/employer/messages/:chatId            // Specific chat
/employer/profile                     // Employer profile
```

### API Routes
```javascript
// Job Management
GET    /api/jobs/enhanced/employer
POST   /api/jobs/enhanced
PUT    /api/jobs/enhanced/:jobId
DELETE /api/jobs/enhanced/:jobId
GET    /api/jobs/enhanced/dashboard-stats

// Applications
GET    /api/jobs/enhanced/:jobId/applications
PATCH  /api/jobs/enhanced/applications/:applicationId/status
GET    /api/jobs/enhanced/:jobId/top-candidates

// AI Recommendations
GET    /api/jobs/enhanced/:jobId/recommended-employees
POST   /api/jobs/enhanced/:jobId/invite-candidate

// Chat
GET    /api/chat/my-chats
GET    /api/chat/:chatId
POST   /api/chat/:chatId/message
PATCH  /api/chat/:chatId/read
GET    /api/chat/unread/count
POST   /api/chat/create

// Employer Requests
GET    /api/jobs/employer-requests/sent
GET    /api/jobs/employer-requests/received
PATCH  /api/jobs/employer-requests/:requestId/respond
```

---

## 📋 Schema Definitions

### Job Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  descriptionType: 'text' | 'pdf' | 'markdown',
  descriptionFileUrl: String,
  requirements: [String],
  salary: Number,
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
  employerId: ObjectId,
  isActive: Boolean,
  postedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Application Schema
```javascript
{
  _id: ObjectId,
  jobId: ObjectId,
  applicantId: ObjectId,
  employerId: ObjectId,
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired',
  resumeUrl: String,
  coverLetter: String,
  aiMatchingScore: {
    overallMatch: Number,      // 0-100
    skillsMatch: Number,       // 0-100
    experienceMatch: Number,   // 0-100
    matchingKeywords: [String],
    missingSkills: [String],
    aiRecommendation: String
  },
  interviewScores: {
    overall: Number,           // 0-10
    technical: Number,         // 0-10
    behavioral: Number,        // 0-10
    problemSolving: Number,    // 0-10
    hr: Number,               // 0-10
    bestSessionId: String,
    totalInterviews: Number,
    lastInterviewDate: Date
  },
  employerNotes: String,
  rejectionReason: String,
  appliedAt: Date,
  reviewedAt: Date,
  interviewScheduledAt: Date,
  statusUpdatedAt: Date,
  additionalData: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Schema
```javascript
{
  _id: ObjectId,
  employerId: ObjectId,
  employeeId: ObjectId,
  jobId: ObjectId,
  requestId: ObjectId,
  messages: [{
    senderId: ObjectId,
    content: String,
    type: 'text' | 'file' | 'system',
    fileUrl: String,
    timestamp: Date,
    isRead: Boolean
  }],
  lastMessageAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Employer Request Schema
```javascript
{
  _id: ObjectId,
  jobId: ObjectId,
  employerId: ObjectId,
  employeeId: ObjectId,
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
  message: String,
  employeeResponse: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AI Recommendation Response Schema
```javascript
{
  success: Boolean,
  recommendations: [{
    userId: String,
    matchScore: Number,        // 0-100
    skillsMatch: Number,       // 0-100
    experienceMatch: Number,   // 0-100
    matchingKeywords: [String],
    missingSkills: [String],
    suggestions: [String],
    candidateProfile: {
      name: String,
      email: String,
      profile: {
        company: String,
        industry: String,
        jobDescription: String,
        resumeUrl: String
      }
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
    hasApplied: Boolean,
    inviteSent: Boolean
  }],
  totalCandidates: Number
}
```

### Dashboard Stats Schema
```javascript
{
  totalJobs: Number,
  activeJobs: Number,
  totalApplications: Number,
  pendingApplications: Number,
  aiMatches: Number,
  highQualityMatches: Number,
  recentJobs: [{
    id: String,
    title: String,
    location: String,
    postedAt: Date,
    isActive: Boolean,
    applicationCount: Number
  }]
}
```

### Chat Message Schema
```javascript
{
  senderId: ObjectId,
  content: String,
  type: 'text' | 'file' | 'system',
  fileUrl: String,
  timestamp: Date,
  isRead: Boolean
}
```

### Application Status Update Schema
```javascript
{
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired',
  notes: String,
  rejectionReason: String
}
```

### Invite Candidate Schema
```javascript
{
  candidateId: String,
  message: String,
  autoApply: Boolean
}
```