# Job Management System - Complete Documentation

## Overview
Complete documentation of all job-related schema changes, API endpoints, and enhancements made to the AI Interview and Job Management system.

---

## 📋 Table of Contents
1. [Schema Changes](#schema-changes)
2. [New API Endpoints](#new-api-endpoints)
3. [Enhanced Existing Endpoints](#enhanced-existing-endpoints)
4. [Module Registration](#module-registration)
5. [Integration Points](#integration-points)

---

## 1. Schema Changes

### 1.1 Job Schema Enhancements
**File**: `backend/src/jobs/schemas/job.schema.ts`

#### New Fields Added:
```typescript
@Schema({ timestamps: true })
export class Job {
  // NEW FIELDS
  @Prop({ type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], required: true })
  jobType: string;

  @Prop({ type: String, enum: ['entry', 'mid', 'senior', 'executive'], required: true })
  experienceLevel: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  benefits: string[];

  @Prop({ type: String })
  companyInfo?: string;

  @Prop({
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    }
  })
  salaryRange?: { min: number; max: number };

  @Prop({ type: Date, default: Date.now })
  postedAt: Date;

  // Existing fields remain unchanged
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop()
  salary: number;

  @Prop({ required: true })
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}
```

### 1.2 Job Application Schema Enhancements
**File**: `backend/src/jobs/schemas/job-application.schema.ts`

#### New Fields Added:
```typescript
@Schema({ timestamps: true })
export class JobApplication {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  applicantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employerId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(ApplicationStatus), 
    default: ApplicationStatus.PENDING 
  })
  status: ApplicationStatus;

  // NEW: AI Matching Scores
  @Prop({
    type: {
      overallMatch: { type: Number, min: 0, max: 100 },
      skillsMatch: { type: Number, min: 0, max: 100 },
      experienceMatch: { type: Number, min: 0, max: 100 },
      matchingKeywords: [String],
      missingSkills: [String],
      aiRecommendation: String
    }
  })
  aiMatchingScore?: {
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    matchingKeywords: string[];
    missingSkills: string[];
    aiRecommendation: string;
  };

  // NEW: Interview Performance Tracking
  @Prop({
    type: {
      overall: { type: Number, min: 0, max: 10 },
      technical: { type: Number, min: 0, max: 10 },
      behavioral: { type: Number, min: 0, max: 10 },
      problemSolving: { type: Number, min: 0, max: 10 },
      hr: { type: Number, min: 0, max: 10 },
      bestSessionId: String,
      totalInterviews: Number,
      lastInterviewDate: Date
    }
  })
  interviewScores?: {
    overall: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    hr: number;
    bestSessionId?: string;
    totalInterviews: number;
    lastInterviewDate?: Date;
  };

  // Application Data
  @Prop()
  resumeUrl?: string;

  @Prop()
  coverLetter?: string;

  @Prop()
  employerNotes?: string;

  @Prop()
  rejectionReason?: string;

  // Timeline Tracking
  @Prop({ type: Date, default: Date.now })
  appliedAt: Date;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: Date })
  interviewScheduledAt?: Date;

  @Prop({ type: Date })
  statusUpdatedAt?: Date;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HIRED = 'hired'
}
```

### 1.3 User Schema Enhancement
**File**: `backend/src/users/schemas/user.schema.ts`

#### Added Timestamp Fields:
```typescript
@Schema({ timestamps: true })
export class User {
  // Existing fields...
  
  // NEW: Automatic timestamp fields
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. New API Endpoints

### 2.1 Enhanced Job Management Endpoints
**Base Path**: `/jobs/enhanced`

#### POST `/jobs/enhanced`
Create a new job with enhanced fields.

**Request Body**:
```typescript
{
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salaryRange?: { min: number; max: number };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits?: string[];
  companyInfo?: string;
}
```

**Response**: Created job object with all fields

**Auth**: Requires JWT + Employer role

---

#### GET `/jobs/enhanced/my-jobs`
Get all jobs posted by the employer with optional filters.

**Query Parameters**:
- `isActive` (optional): Filter by active status
- `jobType` (optional): Filter by job type
- `experienceLevel` (optional): Filter by experience level

**Response**: Array of job objects

**Auth**: Requires JWT + Employer role

---

#### GET `/jobs/enhanced/dashboard-stats`
Get employer dashboard statistics.

**Response**:
```typescript
{
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  recentJobs: Array<{
    id: string;
    title: string;
    location: string;
    postedAt: string;
    isActive: boolean;
  }>;
}
```

**Auth**: Requires JWT + Employer role

---

#### PUT `/jobs/enhanced/:jobId`
Update an existing job.

**Request Body**: Partial job object with fields to update

**Response**: Updated job object

**Auth**: Requires JWT + Employer role

---

#### DELETE `/jobs/enhanced/:jobId`
Delete a job (only if no active applications).

**Response**: Success message

**Auth**: Requires JWT + Employer role

---

#### GET `/jobs/enhanced/:jobId/applications`
Get all applications for a specific job with AI scores and interview performance.

**Response**: Array of enhanced job applications with:
- Complete applicant profile
- AI matching scores
- Interview performance metrics
- Application timeline

**Auth**: Requires JWT + Employer role

---

#### GET `/jobs/enhanced/:jobId/top-candidates`
Get top candidates sorted by AI match and interview scores.

**Query Parameters**:
- `limit` (optional, default: 10): Number of candidates to return

**Response**: Array of top candidates

**Auth**: Requires JWT + Employer role

---

#### GET `/jobs/enhanced/:jobId/analytics`
Get comprehensive analytics for a job.

**Response**:
```typescript
{
  totalApplications: number;
  statusBreakdown: {
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  };
  averageAIMatch: number;
  averageInterviewScore: number;
  topSkills: Array<{ skill: string; count: number }>;
  applicationTrend: Array<{ date: string; count: number }>;
}
```

**Auth**: Requires JWT + Employer role

---

#### PUT `/jobs/enhanced/applications/:applicationId/status`
Update application status with notes.

**Request Body**:
```typescript
{
  status: ApplicationStatus;
  notes?: string;
  rejectionReason?: string;
}
```

**Response**: Updated application object

**Auth**: Requires JWT + Employer role

---

#### POST `/jobs/enhanced/bulk-update-status`
Bulk update multiple application statuses.

**Request Body**:
```typescript
{
  applicationIds: string[];
  status: ApplicationStatus;
  notes?: string;
  rejectionReason?: string;
}
```

**Response**:
```typescript
{
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    applicationId: string;
    success: boolean;
    application?: object;
    error?: string;
  }>;
}
```

**Auth**: Requires JWT + Employer role

---

#### POST `/jobs/enhanced/:jobId/toggle-status`
Toggle job active/inactive status.

**Response**: Updated job object

**Auth**: Requires JWT + Employer role

---

## 3. Enhanced Existing Endpoints

### 3.1 GET `/jobs/:jobId/best-candidates`
**File**: `backend/src/jobs/jobs.service.ts`

#### Enhanced Response Structure:
```typescript
interface EnhancedCandidate {
  // AI Matcher Data
  userId: string;
  resumeId: string;
  resumeFilename: string;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  
  // Complete User Profile
  userProfile: {
    id: string;
    name: string;
    email: string;
    role: 'employee' | 'employer';
    company?: string;
    industry?: string;
    jobDescription?: string;
    profileImageUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  
  // Resume Details
  resumeDetails: {
    resumeId: string;
    resumeFilename: string;
    resumeUrl?: string;
    uploadedAt: string;
  };
  
  // Interview Performance
  interviewScores: {
    overall: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    hr: number;
    totalInterviews: number;
    lastInterviewDate?: string;
    currentStreak: number;
    averageScore: number;
    completedInterviews: number;
    totalTimeSpent: number;
  };
  
  // Application Status
  applicationStatus?: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    employerNotes?: string;
  };
  
  // Computed Fields
  hasApplied: boolean;
  overallRating: number; // Weighted: 60% AI match + 40% interview
  fetchedAt: string;
}
```

**Changes Made**:
- Added complete user profile data
- Added interview performance metrics from analytics
- Added application status if user has applied
- Added computed overall rating
- Graceful fallback when AI service unavailable

---

## 4. Module Registration

### 4.1 Jobs Module
**File**: `backend/src/jobs/jobs.module.ts`

#### Updated Configuration:
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
  controllers: [JobsController, EnhancedJobController], // Added EnhancedJobController
  providers: [JobsService, EnhancedJobService, AiMatcherService, EnhancedInterviewService], // Added EnhancedJobService
  exports: [JobsService, EnhancedJobService], // Added EnhancedJobService
})
export class JobsModule {}
```

---

## 5. Integration Points

### 5.1 AI Matcher Service Integration
**File**: `backend/src/common/services/ai-matcher.service.ts`

#### New Methods:
```typescript
// Get real-time match score for a candidate
async getMatchScore(userId: string, jobDescription: string): Promise<any>

// Upload job description to AI matcher
async uploadJobDescription(jobId: string, filePath: string): Promise<any>
```

### 5.2 Enhanced Interview Service Integration
**File**: `backend/src/interview_rounds/services/enhanced-interview.service.ts`

#### Used Methods:
```typescript
// Get user analytics for interview performance
async getUserAnalytics(userId: string): Promise<UserInterviewAnalytics>

// Get dashboard statistics
async getDashboardStats(userId: string): Promise<DashboardStats>
```

---

## 6. Key Features

### 6.1 Automatic Job Description Processing
- Jobs are automatically converted to text format
- Uploaded to AI matcher service for candidate matching
- PDF generation for job descriptions

### 6.2 Real-time Candidate Scoring
- AI matching scores calculated on-demand
- Interview performance integrated from analytics
- Weighted overall rating (60% AI + 40% interview)

### 6.3 Comprehensive Application Tracking
- Full application lifecycle management
- Timeline tracking (applied, reviewed, scheduled, etc.)
- Employer notes and rejection reasons
- Bulk operations support

### 6.4 Analytics & Insights
- Application status breakdown
- Skill distribution analysis
- Application trends over time
- Average scores and metrics

### 6.5 Error Handling
- Graceful fallbacks when AI service unavailable
- Validation for active applications before job deletion
- Authorization checks for all employer operations

---

## 7. Authentication & Authorization

### All Enhanced Endpoints Require:
1. **JWT Authentication**: Valid access token
2. **Role-Based Access**: Employer role for job management
3. **Ownership Verification**: Employers can only access their own jobs

### Auth Decorators Used:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
```

---

## 8. Database Indexes (Recommended)

For optimal performance, add these indexes:

```typescript
// Job collection
{ employerId: 1, isActive: 1 }
{ jobType: 1, experienceLevel: 1 }
{ postedAt: -1 }

// JobApplication collection
{ jobId: 1, status: 1 }
{ applicantId: 1, status: 1 }
{ 'aiMatchingScore.overallMatch': -1 }
{ 'interviewScores.overall': -1 }
{ appliedAt: -1 }
```

---

## 9. Frontend Integration Notes

### TypeScript Interfaces
All response types are documented in `FRONTEND_INTEGRATION_GUIDE.md`

### Key Points:
1. All dates are returned as ISO strings
2. Scores are normalized (AI: 0-100, Interview: 0-10)
3. Enums should match exactly (ApplicationStatus, jobType, etc.)
4. Optional fields may be undefined or null
5. Pagination not yet implemented (consider for large datasets)

---

## 10. Migration Notes

### For Existing Jobs:
- Add default values for new fields
- Run migration script to populate `postedAt` from `createdAt`
- Set default `jobType` and `experienceLevel`

### For Existing Applications:
- AI scores will be calculated on first access
- Interview scores will be fetched from analytics
- Timeline fields will use `createdAt` as fallback

---

## 11. Future Enhancements

### Planned Features:
1. Email notifications for application status changes
2. Scheduled job posting and expiration
3. Application filtering and search
4. Export applications to CSV/PDF
5. Interview scheduling integration
6. Candidate messaging system
7. Job templates for employers
8. Application form customization

---

## 12. Testing Checklist

### Job Management:
- [ ] Create job with all fields
- [ ] Update job fields
- [ ] Delete job (with/without applications)
- [ ] Filter jobs by status, type, level
- [ ] Toggle job active status

### Application Management:
- [ ] View all applications for a job
- [ ] Update application status
- [ ] Bulk update statuses
- [ ] View top candidates
- [ ] Check AI scores calculation
- [ ] Verify interview scores integration

### Analytics:
- [ ] Dashboard stats accuracy
- [ ] Job analytics calculations
- [ ] Application trends
- [ ] Skill distribution

### Authorization:
- [ ] Employer can only access own jobs
- [ ] Employee cannot access employer endpoints
- [ ] Proper error messages for unauthorized access

---

## 13. API Response Times

### Expected Performance:
- Simple queries (my-jobs, dashboard-stats): < 100ms
- Application lists with enrichment: < 500ms
- Best candidates with AI scoring: < 2s
- Analytics calculations: < 300ms

### Optimization Tips:
- Use pagination for large result sets
- Cache AI matcher responses
- Index frequently queried fields
- Consider Redis for dashboard stats

---

## Documentation Version
**Version**: 1.0  
**Last Updated**: December 24, 2024  
**Author**: AI Interview System Team
