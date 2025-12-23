# Complete Employer API Documentation

## Overview
Complete guide for employers including authentication, job management, candidate management, and AI-powered features.

---

## Authentication Routes

### Register Employer
**POST /auth/register**
- **Body**:
  ```typescript
  {
    name: string
    email: string
    password: string
    role: 'employer'     // Required for employer registration
    company?: string     // Optional company name
    industry?: string    // Optional industry
  }
  ```
- **Response**: User object with tokens
- **No Auth Required**

### Login
**POST /auth/login**
- **Body**:
  ```typescript
  {
    email: string
    password: string
  }
  ```
- **Response**: 
  ```typescript
  {
    user: User
    accessToken: string
    refreshToken: string
  }
  ```
- **No Auth Required**

### Refresh Token
**POST /auth/refresh**
- **Headers**: `Authorization: Bearer <refreshToken>`
- **Response**: New access and refresh tokens

### Logout
**POST /auth/logout**
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: Success message

---

## User Profile Routes

### Get Profile
**GET /users/profile**
- **Auth**: Required
- **Response**: Current user profile

### Update Profile
**PATCH /users/profile**
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```typescript
  {
    name?: string
    company?: string
    industry?: string
    jobDescription?: string
    profileImage?: File
  }
  ```
- **Response**: Updated user profile

---

## Job Management Routes

### Create Job
**POST /jobs**
- **Auth**: Employer only
- **Content-Type**: `multipart/form-data`
- **Body**:
  ```typescript
  {
    title: string                    // Required
    description: string              // Required - text description
    descriptionType?: 'text' | 'pdf' | 'markdown'  // Optional
    requirements: string[]           // Required - array of requirements
    salary: number                   // Required
    location: string                 // Required
    descriptionFile?: File           // Optional - PDF/markdown file
  }
  ```
- **Response**: Created job object with AI integration
- **Features**:
  - Supports file upload for job descriptions
  - Automatically uploads to AI matcher service
  - Generates job recommendations for matching

### Get My Jobs
**GET /jobs/my-jobs**
- **Auth**: Employer only
- **Response**: Array of employer's active jobs
- **Includes**: Job details with application counts

### Get All Jobs (Public)
**GET /jobs**
- **Auth**: Not required
- **Response**: All active jobs (public endpoint)
- **Populated**: Employer name and company info

---

## Application Management Routes

### Get Job Applications
**GET /jobs/:id/applications**
- **Auth**: Employer only (job owner)
- **Params**: `id` - Job ID
- **Response**: Array of applications for the job
- **Populated**: Employee details (name, email, resumeUrl)

### Get AI-Powered Best Candidates
**GET /jobs/:id/best-candidates**
- **Auth**: Employer only (job owner)
- **Params**: `id` - Job ID
- **Response**: AI-ranked candidates with match scores
- **Features**:
  - Uses AI matcher service for intelligent ranking
  - Provides match scores and missing keywords
  - Falls back to basic scoring if AI unavailable
- **Format**:
  ```typescript
  {
    matches: [{
      resume_id: string
      resume_filename: string
      match_score: number
      missing_keywords: string[]
      suggestions: string[]
      resume_content: string
    }]
    total: number
    showing: number
  }
  ```

### Update Application Status
**PATCH /jobs/applications/:id/status/:status**
- **Auth**: Employer only (job owner)
- **Params**: 
  - `id` - Application ID
  - `status` - 'pending' | 'accepted' | 'rejected'
- **Response**: Updated application

---

## Employer Request System Routes

### Request Specific Employee
**POST /jobs/request-employee**
- **Auth**: Employer only
- **Body**:
  ```typescript
  {
    jobId: string        // Required - Job ID
    employeeId: string   // Required - Employee ID
    message?: string     // Optional - Personal message
  }
  ```
- **Response**: Created employer request
- **Use Case**: Proactively reach out to ideal candidates

### Get My Requests
**GET /jobs/my-requests**
- **Auth**: Employer only
- **Response**: Array of employer's sent requests
- **Populated**: Job title and employee details
- **Status Tracking**: pending, accepted, rejected, withdrawn

---

## File Upload Routes

### Upload Job Description File
**Included in POST /jobs**
- **Field**: `descriptionFile`
- **Supported**: PDF, Markdown files
- **Directory**: `./uploads/job-descriptions/`
- **Auto URL**: `/uploads/job-descriptions/{filename}`

### Upload Profile Image
**Included in PATCH /users/profile**
- **Field**: `profileImage`
- **Supported**: Image files (PNG, JPG, JPEG)
- **Directory**: `./uploads/profile-images/`
- **Auto URL**: `/uploads/profile-images/{filename}`

---

## Complete Route List for Employers

### Authentication (No Auth Required)
- `POST /auth/register` - Register new employer
- `POST /auth/login` - Login employer
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout employer

### Profile Management (Auth Required)
- `GET /users/profile` - Get current profile
- `PATCH /users/profile` - Update profile with image upload

### Job Management (Employer Only)
- `POST /jobs` - Create job with file upload
- `GET /jobs/my-jobs` - Get employer's jobs
- `GET /jobs` - Get all jobs (public)

### Application Management (Employer Only)
- `GET /jobs/:id/applications` - Get job applications
- `GET /jobs/:id/best-candidates` - Get AI-ranked candidates
- `PATCH /jobs/applications/:id/status/:status` - Update application status

### Employer Requests (Employer Only)
- `POST /jobs/request-employee` - Request specific employee
- `GET /jobs/my-requests` - Get sent requests

### File Serving (Public)
- `GET /uploads/job-descriptions/:filename` - Serve job description files
- `GET /uploads/profile-images/:filename` - Serve profile images

---

## Example Usage

### Complete Employer Workflow

#### 1. Register and Login
```bash
# Register
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employer",
    "email": "john@company.com",
    "password": "securePassword123",
    "role": "employer",
    "company": "Tech Corp",
    "industry": "Technology"
  }'

# Login
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "securePassword123"
  }'
```

#### 2. Create Job with File Upload
```bash
curl -X POST "http://localhost:3000/jobs" \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Senior Full Stack Developer" \
  -F "description=Looking for experienced developer..." \
  -F "requirements[]=5+ years experience" \
  -F "requirements[]=React expertise" \
  -F "requirements[]=Node.js experience" \
  -F "salary=120000" \
  -F "location=Remote" \
  -F "descriptionType=pdf" \
  -F "descriptionFile=@detailed_job_description.pdf"
```

#### 3. Get AI-Powered Candidates
```bash
curl -X GET "http://localhost:3000/jobs/{jobId}/best-candidates" \
  -H "Authorization: Bearer <accessToken>"
```

#### 4. Request Specific Employee
```bash
curl -X POST "http://localhost:3000/jobs/request-employee" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "507f1f77bcf86cd799439012",
    "employeeId": "507f1f77bcf86cd799439013",
    "message": "Your React and Node.js experience makes you perfect for this role!"
  }'
```

#### 5. Update Application Status
```bash
curl -X PATCH "http://localhost:3000/jobs/applications/{applicationId}/status/accepted" \
  -H "Authorization: Bearer <accessToken>"
```

---

## AI Integration Features

### Automatic Job Upload
When creating jobs:
1. Job saved to database
2. Automatically uploaded to AI matcher service
3. Available for AI-powered candidate matching

### AI-Powered Candidate Matching
- **Endpoint**: `/jobs/:id/best-candidates`
- **Technology**: External AI Resume-Job Matcher API
- **Benefits**:
  - Intelligent resume-job compatibility scoring
  - Missing keywords identification
  - Improvement suggestions
  - Ranked candidate list

### Fallback System
- If AI service unavailable, uses basic scoring algorithm
- Based on resume presence, cover letter, and profile completeness
- Ensures functionality always available

---

## File Upload Support

### Job Description Files
- **Directory**: `./uploads/job-descriptions/`
- **Supported Formats**: PDF, Markdown
- **Field Name**: `descriptionFile`
- **Auto URL**: `/uploads/job-descriptions/{filename}`

### File Handling
- Automatic filename generation with timestamps
- Proper file extension preservation
- URL generation for frontend access

---

## Response Formats

### Success Response
```typescript
{
  data: Job | Job[] | Application[]
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

### Job Object
```typescript
{
  _id: string
  title: string
  description: string
  descriptionType: 'text' | 'pdf' | 'markdown'
  descriptionFileUrl?: string
  requirements: string[]
  salary: number
  location: string
  employerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Application Object
```typescript
{
  _id: string
  jobId: string
  employeeId: {
    _id: string
    name: string
    email: string
    resumeUrl?: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  coverLetter?: string
  createdAt: Date
  updatedAt: Date
}
```

### Employer Request Object
```typescript
{
  _id: string
  jobId: {
    _id: string
    title: string
  }
  employerId: string
  employeeId: {
    _id: string
    name: string
    email: string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  message?: string
  employeeResponse?: string
  createdAt: Date
  updatedAt: Date
}
```

---

## Best Practices

### Job Creation
1. **Clear Titles**: Use specific, searchable job titles
2. **Detailed Descriptions**: Provide comprehensive job details
3. **File Uploads**: Use PDF for formatted job descriptions
4. **Requirements**: List specific skills and experience needed

### Candidate Management
1. **AI Matching**: Use best-candidates endpoint for intelligent ranking
2. **Quick Response**: Update application statuses promptly
3. **Personal Touch**: Include messages in employer requests

### Proactive Recruitment
1. **Browse Profiles**: Find ideal candidates before they apply
2. **Direct Outreach**: Use employer request system
3. **Personalized Messages**: Explain why they're a good fit

---

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User not employer or not job owner
- **404 Not Found**: Job, application, or employee not found
- **400 Bad Request**: Invalid data or duplicate applications

### AI Service Errors
- **Graceful Fallback**: Basic scoring when AI unavailable
- **Logged Errors**: All AI failures logged for debugging
- **Continued Service**: Main functionality unaffected

---

## Configuration

### Environment Variables
```env
AI_MATCHER_BASE_URL=http://localhost:8000
```

### Required Directories
```
uploads/
└── job-descriptions/    # Auto-created for job description files
```

This comprehensive system enables employers to efficiently manage jobs, find the best candidates using AI, and proactively recruit talent through direct employee requests.