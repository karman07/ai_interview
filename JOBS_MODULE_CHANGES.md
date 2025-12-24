# Jobs Module - Complete Changes & Schema Documentation

## Overview
This document outlines all changes, enhancements, and schema modifications made to the Jobs module in the AI Interview Backend system.

## 📋 Table of Contents
- [Schema Changes](#schema-changes)
- [New Services & Controllers](#new-services--controllers)
- [DTOs & Validation](#dtos--validation)
- [Module Dependencies](#module-dependencies)
- [API Endpoints](#api-endpoints)
- [Key Features](#key-features)
- [Database Indexes](#database-indexes)

---

## 🗄️ Schema Changes

### 1. Job Schema (`job.schema.ts`)
**Enhanced with comprehensive job management features:**

```typescript
export class Job {
  title: string;                    // Job title
  description: string;              // Job description
  descriptionType: JobDescriptionType; // TEXT | PDF | MARKDOWN
  descriptionFileUrl?: string;      // PDF file URL support
  requirements: string[];           // Job requirements array
  salary: number;                   // Base salary (legacy)
  salaryRange?: SalaryRange;        // Min/max salary range
  location: string;                 // Job location
  jobType: string;                  // full-time | part-time | contract | internship
  experienceLevel: string;          // entry | mid | senior | executive
  skills: string[];                 // Required skills array
  benefits: string[];               // Job benefits array
  companyInfo?: string;             // Company information
  employerId: Types.ObjectId;       // Reference to employer
  isActive: boolean;                // Job status
  postedAt: Date;                   // Posted timestamp
}
```

**New Features:**
- ✅ Multiple job description formats (text, PDF, markdown)
- ✅ Salary range support with min/max values
- ✅ Comprehensive job categorization
- ✅ Skills and benefits arrays
- ✅ Company information field

### 2. Job Application Schema (`job-application.schema.ts`)
**Complete application tracking system:**

```typescript
export class JobApplication {
  jobId: Types.ObjectId;            // Reference to job
  applicantId: Types.ObjectId;      // Reference to applicant
  employerId: Types.ObjectId;       // Reference to employer
  status: ApplicationStatus;        // Application status enum
  resumeUrl?: string;               // Resume file URL
  coverLetter?: string;             // Cover letter text
  aiMatchingScore?: AIMatchingScore; // AI matching results
  interviewScores?: InterviewScores; // Interview performance
  employerNotes?: string;           // Employer's notes
  rejectionReason?: string;         // Rejection reason
  appliedAt: Date;                  // Application timestamp
  reviewedAt?: Date;                // Review timestamp
  interviewScheduledAt?: Date;      // Interview schedule
  statusUpdatedAt?: Date;           // Status update timestamp
  additionalData?: any;             // Flexible additional data
}
```

**Application Status Enum:**
```typescript
export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HIRED = 'hired'
}
```

**AI Matching Score Schema:**
```typescript
export class AIMatchingScore {
  overallMatch: number;             // 0-100 overall match score
  skillsMatch: number;              // 0-100 skills match
  experienceMatch: number;          // 0-100 experience match
  matchingKeywords: string[];       // Matching keywords array
  missingSkills: string[];          // Missing skills array
  aiRecommendation?: string;        // AI recommendation text
}
```

**Interview Scores Schema:**
```typescript
export class InterviewScores {
  overall: number;                  // 0-10 overall score
  technical: number;                // 0-10 technical score
  behavioral: number;               // 0-10 behavioral score
  problemSolving: number;           // 0-10 problem solving score
  hr: number;                       // 0-10 HR score
  bestSessionId?: string;           // Best interview session ID
  totalInterviews?: number;         // Total interviews count
  lastInterviewDate?: Date;         // Last interview date
}
```

### 3. Employer Request Schema (`employer-request.schema.ts`)
**Direct employer-to-candidate communication:**

```typescript
export class EmployerRequest {
  jobId: Types.ObjectId;            // Reference to job
  employerId: Types.ObjectId;       // Reference to employer
  employeeId: Types.ObjectId;       // Reference to employee
  status: RequestStatus;            // Request status
  message?: string;                 // Employer's message
  employeeResponse?: string;        // Employee's response
}
```

**Request Status Enum:**
```typescript
export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}
```

---

## 🚀 New Services & Controllers

### 1. Enhanced Job Service (`enhanced-job.service.ts`)
**Advanced job management with AI integration:**

**Key Methods:**
- `createJob()` - Create job with AI matcher integration
- `updateJob()` - Update job and sync with AI matcher
- `deleteJob()` - Delete job with validation checks
- `getEmployerJobs()` - Get employer's jobs with filters
- `getJobApplications()` - Get applications with AI scores
- `updateApplicationStatus()` - Update application status
- `getTopCandidates()` - Get ranked candidates
- `generateJobDescriptionPDF()` - Generate PDF from job data

**AI Integration Features:**
- ✅ Automatic PDF generation for job descriptions
- ✅ AI matcher service integration
- ✅ Real-time candidate scoring
- ✅ Interview performance tracking

### 2. Enhanced Job Controller (`enhanced-job.controller.ts`)
**RESTful API endpoints for job management:**

**Endpoints:**
- `POST /jobs/enhanced` - Create new job
- `PUT /jobs/enhanced/:id` - Update job
- `DELETE /jobs/enhanced/:id` - Delete job
- `GET /jobs/enhanced/employer` - Get employer jobs
- `GET /jobs/enhanced/:id/applications` - Get job applications
- `PATCH /jobs/enhanced/applications/:id/status` - Update application status
- `GET /jobs/enhanced/:id/top-candidates` - Get top candidates

---

## 📝 DTOs & Validation

### 1. Create Job DTO (`create-job.dto.ts`)
```typescript
export class CreateJobDto {
  title: string;                    // Required job title
  description: string;              // Required description
  descriptionType?: JobDescriptionType; // Optional format type
  descriptionFileUrl?: string;      // Optional PDF URL
  requirements: string[];           // Required skills array
  salary: number;                   // Required salary
  location: string;                 // Required location
}
```

### 2. Apply Job DTO (`apply-job.dto.ts`)
```typescript
export class ApplyJobDto {
  coverLetter?: string;             // Optional cover letter
}
```

### 3. Employer Request DTOs (`employer-request.dto.ts`)
```typescript
export class CreateEmployerRequestDto {
  jobId: string;                    // Required job ID
  employeeId: string;               // Required employee ID
  message?: string;                 // Optional message
}

export class RespondToRequestDto {
  status: RequestStatus.ACCEPTED | RequestStatus.REJECTED;
  employeeResponse?: string;        // Optional response message
}
```

---

## 🔧 Module Dependencies

### Updated Jobs Module (`jobs.module.ts`)
**Integrated dependencies:**

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: EmployerRequest.name, schema: EmployerRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: InterviewSession.name, schema: InterviewSessionSchema },
      { name: UserInterviewAnalytics.name, schema: UserInterviewAnalyticsSchema },
    ]),
    HttpModule,
  ],
  controllers: [JobsController, EnhancedJobController],
  providers: [JobsService, EnhancedJobService, AiMatcherService, EnhancedInterviewService],
  exports: [JobsService, EnhancedJobService],
})
```

**New Dependencies:**
- ✅ AI Matcher Service integration
- ✅ Enhanced Interview Service integration
- ✅ Interview analytics schemas
- ✅ HTTP module for external API calls

---

## 🌐 API Endpoints

### Job Management Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/jobs/enhanced` | Create new job | Employer |
| PUT | `/jobs/enhanced/:id` | Update existing job | Employer |
| DELETE | `/jobs/enhanced/:id` | Delete job | Employer |
| GET | `/jobs/enhanced/employer` | Get employer's jobs | Employer |

### Application Management Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/jobs/enhanced/:id/applications` | Get job applications | Employer |
| PATCH | `/jobs/enhanced/applications/:id/status` | Update application status | Employer |
| GET | `/jobs/enhanced/:id/top-candidates` | Get ranked candidates | Employer |

### Employer Request Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/jobs/employer-requests` | Send request to candidate | Employer |
| GET | `/jobs/employer-requests/sent` | Get sent requests | Employer |
| GET | `/jobs/employer-requests/received` | Get received requests | Employee |
| PATCH | `/jobs/employer-requests/:id/respond` | Respond to request | Employee |

---

## ⭐ Key Features

### 1. AI-Powered Candidate Matching
- ✅ Automatic resume-job description matching
- ✅ Skills gap analysis
- ✅ Experience level matching
- ✅ Keyword extraction and matching
- ✅ AI-generated recommendations

### 2. Interview Integration
- ✅ Real-time interview score tracking
- ✅ Multi-category scoring (technical, behavioral, etc.)
- ✅ Best performance tracking
- ✅ Interview analytics integration

### 3. Advanced Application Management
- ✅ Status-based application workflow
- ✅ Employer notes and feedback
- ✅ Rejection reason tracking
- ✅ Timeline management

### 4. Direct Employer-Candidate Communication
- ✅ Direct job invitations
- ✅ Message exchange system
- ✅ Response tracking
- ✅ Status management

### 5. Enhanced Job Creation
- ✅ Multiple description formats
- ✅ Comprehensive job categorization
- ✅ Salary range support
- ✅ Skills and benefits management

---

## 🗂️ Database Indexes

### Job Application Indexes
```typescript
// Unique constraint on job-applicant combination
JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

// Performance indexes for common queries
JobApplicationSchema.index({ employerId: 1, status: 1 });
JobApplicationSchema.index({ 'aiMatchingScore.overallMatch': -1 });
JobApplicationSchema.index({ 'interviewScores.overall': -1 });
```

**Benefits:**
- ✅ Prevents duplicate applications
- ✅ Fast employer dashboard queries
- ✅ Efficient candidate ranking
- ✅ Optimized sorting by scores

---

## 📊 Data Flow

### 1. Job Creation Flow
```
Employer creates job → Generate PDF → Upload to AI Matcher → Store in DB
```

### 2. Application Flow
```
Candidate applies → AI matching → Interview scores → Employer review → Status update
```

### 3. Candidate Ranking Flow
```
Applications → AI scores + Interview scores → Sorted ranking → Top candidates
```

---

## 🔒 Security & Validation

### 1. Authorization
- ✅ Employer-only job management
- ✅ Application ownership validation
- ✅ Request permission checks

### 2. Data Validation
- ✅ DTO validation with class-validator
- ✅ Schema-level constraints
- ✅ Business logic validation

### 3. Error Handling
- ✅ Comprehensive error messages
- ✅ Graceful AI service failures
- ✅ Validation error responses

---

## 📈 Performance Optimizations

### 1. Database Optimizations
- ✅ Strategic indexing
- ✅ Efficient query patterns
- ✅ Population optimization

### 2. AI Service Integration
- ✅ Async processing
- ✅ Error resilience
- ✅ Caching strategies

### 3. File Management
- ✅ PDF generation optimization
- ✅ File cleanup procedures
- ✅ Storage management

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Bulk application processing
- [ ] Advanced filtering options
- [ ] Email notification system
- [ ] Application analytics dashboard
- [ ] Interview scheduling integration
- [ ] Multi-language support

---

## 📝 Migration Notes

### Database Migrations Required
1. **Job Schema Updates**: Add new fields for enhanced job management
2. **Application Schema**: Complete restructure with AI and interview integration
3. **Indexes**: Add performance indexes for efficient querying
4. **Employer Requests**: New collection for direct communication

### API Changes
- **Breaking Changes**: Enhanced endpoints replace basic job management
- **New Endpoints**: Comprehensive application and request management
- **Authentication**: Enhanced role-based access control

---

*Last Updated: December 2024*
*Version: 2.0.0*