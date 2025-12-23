# Enhanced Jobs API with AI Integration

## New Features Added

### 1. AI-Powered Job Matching
- Automatic resume upload to AI matcher service when users upload resumes
- Automatic job description upload to AI matcher service when employers create jobs
- AI-powered candidate recommendations for employers
- AI-powered job recommendations for employees

### 2. Employer Request System
- Employers can request specific employees for positions
- Employees can accept/reject employer requests
- Request tracking and status management

### 3. Flexible Job Descriptions
- Support for text, PDF, and markdown job descriptions
- File upload support for job descriptions

## Updated Schemas

### Job Schema (Enhanced)
```typescript
enum JobDescriptionType {
  TEXT = 'text',
  PDF = 'pdf', 
  MARKDOWN = 'markdown'
}

Job {
  _id: string
  title: string
  description: string
  descriptionType: JobDescriptionType // default: 'text'
  descriptionFileUrl?: string // for PDF/markdown files
  requirements: string[]
  salary: number
  location: string
  employerId: ObjectId // ref: User
  isActive: boolean // default: true
  createdAt: Date
  updatedAt: Date
}
```

### Employer Request Schema (New)
```typescript
enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected', 
  WITHDRAWN = 'withdrawn'
}

EmployerRequest {
  _id: string
  jobId: ObjectId // ref: Job
  employerId: ObjectId // ref: User
  employeeId: ObjectId // ref: User
  status: RequestStatus // default: 'pending'
  message?: string // employer's message
  employeeResponse?: string // employee's response
  createdAt: Date
  updatedAt: Date
}
```

## API Routes

### Enhanced Job Management
- **POST /jobs** - Create job with AI integration
  - Supports file upload for job descriptions
  - Automatically uploads to AI matcher service
  - Body: `CreateJobDto` + optional `descriptionFile`

- **GET /jobs/:id/best-candidates** - AI-powered candidate matching
  - Uses AI matcher service to find best resumes for job
  - Falls back to basic scoring if AI service unavailable

### New AI-Powered Routes
- **GET /jobs/recommendations?limit=10** - Get AI job recommendations for user
  - Requires user to have uploaded resume
  - Uses AI matcher service for intelligent matching

### Employer Request Routes (New)
- **POST /jobs/request-employee** - Request specific employee
  - Body: `{ jobId: string, employeeId: string, message?: string }`
- **GET /jobs/my-requests** - Get employer's requests (Employer only)
- **GET /jobs/requests-for-me** - Get requests for employee (Employee only)
- **PATCH /jobs/requests/:id/respond** - Respond to request (Employee only)
  - Body: `{ status: 'accepted'|'rejected', employeeResponse?: string }`

## AI Integration Details

### Resume Upload Integration
When users upload resumes via `/resume/upload`:
1. Resume is processed by existing CV evaluation API
2. Resume is automatically uploaded to AI matcher service
3. User ID is used as identifier in AI matcher database

### Job Creation Integration
When employers create jobs via `/jobs`:
1. Job is saved to main database
2. Job description (text or file) is uploaded to AI matcher service
3. Job title is included for better matching

### AI Matching Process
- **Best Candidates**: Uses `/best-resume-for-job` endpoint
- **Job Recommendations**: Uses `/best-job-for-resume` endpoint
- **Fallback**: If AI service fails, uses basic scoring algorithm

## Configuration

Add to `.env`:
```
AI_MATCHER_BASE_URL=http://localhost:8000
```

## Error Handling
- AI service failures don't break main functionality
- Graceful fallback to basic algorithms
- Comprehensive logging for debugging

## Usage Examples

```bash
# Create job with PDF description
curl -X POST "http://localhost:3000/jobs" \
  -H "Authorization: Bearer <token>" \
  -F "title=Senior Developer" \
  -F "description=Looking for experienced developer..." \
  -F "requirements[]=5+ years experience" \
  -F "salary=100000" \
  -F "location=Remote" \
  -F "descriptionFile=@job_description.pdf"

# Get AI job recommendations
curl -X GET "http://localhost:3000/jobs/recommendations?limit=5" \
  -H "Authorization: Bearer <token>"

# Request specific employee
curl -X POST "http://localhost:3000/jobs/request-employee" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "507f1f77bcf86cd799439012",
    "employeeId": "507f1f77bcf86cd799439013",
    "message": "Your profile matches perfectly for this role!"
  }'
```

## Benefits
1. **Intelligent Matching**: AI-powered job-resume matching
2. **Proactive Recruitment**: Employers can reach out to ideal candidates
3. **Better User Experience**: Personalized job recommendations
4. **Flexible Content**: Support for various job description formats
5. **Scalable Architecture**: Microservice-based AI integration