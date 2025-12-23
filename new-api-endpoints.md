# New API Endpoints & Changes Summary

## Overview of Changes Made

### 1. Enhanced Jobs Module
- Added AI-powered job matching integration
- Added employer request system for direct employee outreach
- Added flexible job description formats (text, PDF, markdown)
- Added file upload support for job descriptions

### 2. AI Integration
- Created `AiMatcherService` for external AI API communication
- Automatic resume upload to AI matcher when users upload resumes
- Automatic job upload to AI matcher when employers create jobs
- AI-powered candidate and job recommendations

### 3. New Schemas Added
- `EmployerRequest` schema for employer-to-employee requests
- Enhanced `Job` schema with description types and file URLs

---

## New API Endpoints

### Jobs Module - Enhanced Routes

#### **POST /jobs** (Enhanced)
Create job with AI integration and file upload support
- **Auth**: Employer only
- **Content-Type**: `multipart/form-data`
- **Body**: 
  ```typescript
  {
    title: string
    description: string
    descriptionType?: 'text' | 'pdf' | 'markdown'
    requirements: string[]
    salary: number
    location: string
    descriptionFile?: File // PDF or markdown file
  }
  ```
- **New Features**:
  - File upload for job descriptions
  - Automatic upload to AI matcher service
  - Support for PDF/markdown job descriptions

#### **GET /jobs/:id/best-candidates** (Enhanced)
Get AI-powered best candidates for a job
- **Auth**: Employer only (job owner)
- **Response**: AI-matched candidates with scores
- **Fallback**: Basic scoring if AI service unavailable

#### **GET /jobs/recommendations** (New)
Get personalized job recommendations for user
- **Auth**: Employee only
- **Query**: `?limit=10` (optional, default: 10)
- **Requirements**: User must have uploaded resume
- **Response**: 
  ```typescript
  {
    matches: [{
      job_id: string
      job_title: string
      match_score: number
      missing_keywords: string[]
      suggestions: string[]
      job_content: string
    }]
    total: number
    showing: number
  }
  ```

### Employer Request System (All New)

#### **POST /jobs/request-employee**
Employer requests specific employee for a job
- **Auth**: Employer only
- **Body**:
  ```typescript
  {
    jobId: string
    employeeId: string
    message?: string
  }
  ```
- **Response**: Created `EmployerRequest` object

#### **GET /jobs/my-requests**
Get employer's sent requests
- **Auth**: Employer only
- **Response**: Array of `EmployerRequest` with populated job and employee data

#### **GET /jobs/requests-for-me**
Get requests sent to current employee
- **Auth**: Employee only
- **Response**: Array of `EmployerRequest` with populated job and employer data

#### **PATCH /jobs/requests/:id/respond**
Employee responds to employer request
- **Auth**: Employee only
- **Body**:
  ```typescript
  {
    status: 'accepted' | 'rejected'
    employeeResponse?: string
  }
  ```
- **Response**: Updated `EmployerRequest` object

---

## Enhanced Existing Routes

### Resume Upload Integration
#### **POST /resume/upload** (Enhanced)
- **New Feature**: Automatic upload to AI matcher service
- **Process**: 
  1. Existing CV evaluation
  2. AI matcher service upload (with user ID)
  3. Database save
- **Error Handling**: AI service failure doesn't break main flow

---

## New Schemas

### EmployerRequest Schema
```typescript
enum RequestStatus {
  PENDING = 'pending'
  ACCEPTED = 'accepted'
  REJECTED = 'rejected'
  WITHDRAWN = 'withdrawn'
}

EmployerRequest {
  _id: string
  jobId: ObjectId // ref: Job
  employerId: ObjectId // ref: User
  employeeId: ObjectId // ref: User
  status: RequestStatus
  message?: string // employer's message
  employeeResponse?: string // employee's response
  createdAt: Date
  updatedAt: Date
}
```

### Enhanced Job Schema
```typescript
enum JobDescriptionType {
  TEXT = 'text'
  PDF = 'pdf'
  MARKDOWN = 'markdown'
}

Job {
  // ... existing fields
  descriptionType: JobDescriptionType // NEW
  descriptionFileUrl?: string // NEW - for PDF/markdown files
}
```

---

## AI Integration Details

### External AI Service Integration
- **Base URL**: `http://localhost:8000` (configurable via `AI_MATCHER_BASE_URL`)
- **Resume Upload**: `/upload-resume` endpoint
- **Job Upload**: `/upload-job` endpoint
- **Best Jobs**: `/best-job-for-resume` endpoint
- **Best Resumes**: `/best-resume-for-job` endpoint

### Automatic Sync Process
1. **Resume Upload**: User uploads → CV evaluation → AI matcher upload → DB save
2. **Job Creation**: Employer creates → AI matcher upload → DB save
3. **Recommendations**: AI service provides intelligent matching

---

## File Upload Support

### Job Descriptions
- **Directory**: `./uploads/job-descriptions/`
- **Supported Formats**: PDF, Markdown, Text
- **Field Name**: `descriptionFile`
- **Auto URL Generation**: `/uploads/job-descriptions/{filename}`

---

## Error Handling & Fallbacks

### AI Service Failures
- **Resume Upload**: Continues without AI sync (logged as warning)
- **Job Creation**: Continues without AI sync (logged as warning)
- **Best Candidates**: Falls back to basic scoring algorithm
- **Job Recommendations**: Returns error (requires AI service)

### Graceful Degradation
- Main functionality remains intact if AI service is unavailable
- Comprehensive error logging for debugging
- User experience not disrupted by AI service issues

---

## Configuration Required

### Environment Variables
```env
# Add to .env
AI_MATCHER_BASE_URL=http://localhost:8000
```

### Directory Structure
```
uploads/
├── job-descriptions/    # NEW - for job description files
├── resumes/            # existing
└── ...
```

---

## Benefits of New Features

1. **Intelligent Matching**: AI-powered job-resume compatibility
2. **Proactive Recruitment**: Employers can reach ideal candidates directly
3. **Better UX**: Personalized job recommendations for users
4. **Flexible Content**: Support for rich job description formats
5. **Scalable Architecture**: Microservice-based AI integration
6. **Robust Error Handling**: Graceful fallbacks ensure system reliability