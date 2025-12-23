# Employer APIs - Schema and Response Changes

## Overview
Documentation of all employer-related API schemas, request/response structures, and recent changes including JD matcher integration.

## Job Management APIs

### 1. Create Job API
**Endpoint:** `POST /jobs`  
**Authentication:** JWT + EMPLOYER role required

#### Request Schema (CreateJobDto)
```typescript
{
  title: string;                    // Required - Job title
  description: string;              // Required - Job description text
  descriptionType?: JobDescriptionType; // Optional - 'text' | 'pdf' | 'markdown'
  descriptionFileUrl?: string;      // Optional - File URL (auto-generated)
  requirements: string[];           // Required - Array of job requirements
  salary: number;                   // Required - Salary amount
  location: string;                 // Required - Job location
}
```

#### Multipart Form Data Support
```typescript
{
  // Form fields
  title: string;
  description: string;
  requirements: string[]; // JSON array as string
  salary: number;
  location: string;
  
  // File upload
  descriptionFile?: File; // PDF/DOC job description file
}
```

#### Response Schema (Job)
```typescript
{
  _id: string;
  title: string;
  description: string;
  descriptionType: 'text' | 'pdf' | 'markdown';
  descriptionFileUrl?: string;
  requirements: string[];
  salary: number;
  salaryRange?: {
    min: number;
    max: number;
  };
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits: string[];
  companyInfo?: string;
  employerId: string;
  isActive: boolean;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Update Job API ⭐ NEW
**Endpoint:** `PATCH /jobs/:id`  
**Authentication:** JWT + EMPLOYER role required

#### Request Schema
```typescript
{
  title?: string;
  description?: string;
  descriptionType?: JobDescriptionType;
  requirements?: string[];
  salary?: number;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string[];
  benefits?: string[];
  companyInfo?: string;
}
```

#### Response Schema
Same as Create Job response with updated fields and `updatedAt` timestamp.

### 3. Delete Job API ⭐ NEW
**Endpoint:** `DELETE /jobs/:id`  
**Authentication:** JWT + EMPLOYER role required

#### Response Schema
```typescript
{
  message: string;
  success: boolean;
}
```

**Note:** Jobs are soft-deleted (`isActive: false`) and removed from JD matcher.

### 4. Get My Jobs API
**Endpoint:** `GET /jobs/my-jobs`  
**Authentication:** JWT + EMPLOYER role required

#### Response Schema
```typescript
Job[] // Array of jobs created by the employer
```

## Job Application Management APIs

### 1. Get Job Applications API
**Endpoint:** `GET /jobs/:id/applications`  
**Authentication:** JWT + EMPLOYER role required

#### Response Schema (JobApplication)
```typescript
{
  _id: string;
  jobId: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
    resumeUrl?: string;
  };
  employerId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'hired';
  
  // Resume and Cover Letter
  resumeUrl?: string;
  coverLetter?: string;
  
  // AI Matching Results ⭐ NEW
  aiMatchingScore?: {
    overallMatch: number;        // 0-100
    skillsMatch: number;         // 0-100
    experienceMatch: number;     // 0-100
    matchingKeywords: string[];
    missingSkills: string[];
    aiRecommendation?: string;
  };
  
  // Interview Performance ⭐ NEW
  interviewScores?: {
    overall: number;             // 0-10
    technical: number;           // 0-10
    behavioral: number;          // 0-10
    problemSolving: number;      // 0-10
    hr: number;                  // 0-10
    bestSessionId?: string;
    totalInterviews?: number;
    lastInterviewDate?: Date;
  };
  
  // Application Management
  employerNotes?: string;
  rejectionReason?: string;
  
  // Timeline
  appliedAt: Date;
  reviewedAt?: Date;
  interviewScheduledAt?: Date;
  statusUpdatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Update Application Status API
**Endpoint:** `PATCH /jobs/applications/:id/status/:status`  
**Authentication:** JWT + EMPLOYER role required

#### URL Parameters
- `id`: Application ID
- `status`: ApplicationStatus enum value

#### Response Schema
Updated JobApplication object with new status and `statusUpdatedAt` timestamp.

### 3. Get Best Candidates API ⭐ ENHANCED
**Endpoint:** `GET /jobs/:id/best-candidates`  
**Authentication:** JWT + EMPLOYER role required

#### Response Schema
```typescript
{
  matches: [
    {
      applicantId: string;
      name: string;
      email: string;
      resumeUrl?: string;
      matchScore: number;          // AI-generated match score
      skillsMatch: number;
      experienceMatch: number;
      matchingKeywords: string[];
      missingSkills: string[];
      aiRecommendation?: string;
      
      // Interview scores if available
      interviewScores?: {
        overall: number;
        technical: number;
        behavioral: number;
        problemSolving: number;
        hr: number;
      };
    }
  ];
  totalMatches: number;
  processingTime: number;
}
```

## Employer Request APIs

### 1. Create Employer Request API
**Endpoint:** `POST /jobs/request-employee`  
**Authentication:** JWT + EMPLOYER role required

#### Request Schema (CreateEmployerRequestDto)
```typescript
{
  jobId: string;        // Required - Job ID
  employeeId: string;   // Required - Target employee ID
  message?: string;     // Optional - Employer's message
}
```

#### Response Schema (EmployerRequest)
```typescript
{
  _id: string;
  jobId: string;
  employerId: string;
  employeeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  employeeResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Get My Requests API
**Endpoint:** `GET /jobs/my-requests`  
**Authentication:** JWT + EMPLOYER role required

#### Response Schema
```typescript
EmployerRequest[] // Array with populated jobId and employeeId
[
  {
    _id: string;
    jobId: {
      _id: string;
      title: string;
    };
    employerId: string;
    employeeId: {
      _id: string;
      name: string;
      email: string;
    };
    status: RequestStatus;
    message?: string;
    employeeResponse?: string;
    createdAt: Date;
    updatedAt: Date;
  }
]
```

## Schema Changes and Enhancements

### 1. Job Schema Enhancements
```typescript
// NEW FIELDS ADDED:
{
  descriptionType: JobDescriptionType;  // Support for different content types
  descriptionFileUrl?: string;          // File upload support
  salaryRange?: SalaryRange;           // Salary range instead of fixed salary
  jobType: string;                     // Job type classification
  experienceLevel: string;             // Experience level requirement
  skills: string[];                    // Required skills array
  benefits: string[];                  // Job benefits array
  companyInfo?: string;                // Company information
}
```

### 2. JobApplication Schema Enhancements
```typescript
// NEW FIELDS ADDED:
{
  aiMatchingScore?: AIMatchingScore;   // AI-powered matching results
  interviewScores?: InterviewScores;   // Interview performance tracking
  employerNotes?: string;              // Employer's private notes
  rejectionReason?: string;            // Reason for rejection
  reviewedAt?: Date;                   // Review timestamp
  interviewScheduledAt?: Date;         // Interview scheduling
  statusUpdatedAt?: Date;              // Status change tracking
  additionalData?: any;                // Flexible additional data
}
```

### 3. New Enums
```typescript
// Job Description Types
enum JobDescriptionType {
  TEXT = 'text',
  PDF = 'pdf',
  MARKDOWN = 'markdown'
}

// Application Status
enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HIRED = 'hired'
}

// Request Status
enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}
```

## JD Matcher Integration Changes ⭐ NEW

### 1. Automatic JD Upload
- **Create Job**: Automatically uploads job to JD matcher
- **Update Job**: Re-uploads updated job to JD matcher
- **Delete Job**: Removes job from JD matcher

### 2. Enhanced Candidate Matching
- AI-powered candidate scoring
- Skills matching analysis
- Experience level matching
- Keyword extraction and matching
- Missing skills identification

### 3. Error Handling
- Non-blocking JD matcher failures
- Fallback to basic scoring when AI is unavailable
- Comprehensive error logging

## Database Indexes

### Performance Optimizations
```typescript
// JobApplication indexes
{ jobId: 1, applicantId: 1 }              // Unique constraint
{ employerId: 1, status: 1 }              // Employer queries
{ 'aiMatchingScore.overallMatch': -1 }    // AI score sorting
{ 'interviewScores.overall': -1 }         // Interview score sorting
```

## Error Responses

### Common Error Formats
```typescript
// Not Found
{
  statusCode: 404,
  message: "Job not found",
  error: "Not Found"
}

// Unauthorized
{
  statusCode: 403,
  message: "Insufficient permissions",
  error: "Forbidden"
}

// Validation Error
{
  statusCode: 400,
  message: ["title should not be empty"],
  error: "Bad Request"
}

// JD Matcher Error (Non-blocking)
{
  statusCode: 200,
  data: { /* normal response */ },
  warnings: ["AI matching temporarily unavailable"]
}
```

## File Upload Specifications

### Supported File Types
- **Job Descriptions**: PDF, DOC, DOCX, TXT
- **Maximum Size**: 10MB
- **Storage Location**: `./uploads/job-descriptions/`
- **Naming Convention**: `timestamp-random.extension`

### File Processing
- Automatic file type detection
- Text extraction for AI processing
- Secure file storage with unique names
- URL generation for file access