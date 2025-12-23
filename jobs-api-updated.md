# Jobs API Documentation

## Schemas

### Job Schema
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
  descriptionFileUrl?: string // for PDF files
  requirements: string[]
  salary: number
  location: string
  employerId: ObjectId // ref: User
  isActive: boolean // default: true
  createdAt: Date
  updatedAt: Date
}
```

### Job Application Schema
```typescript
enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted', 
  REJECTED = 'rejected'
}

JobApplication {
  _id: string
  jobId: ObjectId // ref: Job
  employeeId: ObjectId // ref: User
  status: ApplicationStatus // default: 'pending'
  coverLetter?: string
  createdAt: Date
  updatedAt: Date
}
```

### Employer Request Schema
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

## Routes

### Job Management (Employer Only)
- **POST /jobs** - Create job with optional file upload
  - Body: `CreateJobDto` + optional `descriptionFile` (multipart/form-data)
  - Supports PDF, MD, or text descriptions
- **GET /jobs/my-jobs** - Get employer's jobs
- **GET /jobs/:id/applications** - Get job applications
- **GET /jobs/:id/best-candidates** - Get best candidates for job
- **PATCH /jobs/applications/:id/status/:status** - Update application status

### Job Browsing (All Users)
- **GET /jobs** - Get all active jobs
- **POST /jobs/:id/apply** - Apply for job (Employee only)
  - Body: `ApplyJobDto`

### Employer Requests (New Feature)
- **POST /jobs/request-employee** - Request specific employee (Employer only)
  - Body: `CreateEmployerRequestDto`
- **GET /jobs/my-requests** - Get employer's requests (Employer only)
- **GET /jobs/requests-for-me** - Get requests for employee (Employee only)
- **PATCH /jobs/requests/:id/respond** - Respond to employer request (Employee only)
  - Body: `RespondToRequestDto`

## DTOs

### CreateJobDto
```typescript
{
  title: string
  description: string
  descriptionType?: JobDescriptionType
  descriptionFileUrl?: string
  requirements: string[]
  salary: number
  location: string
}
```

### CreateEmployerRequestDto
```typescript
{
  jobId: string
  employeeId: string
  message?: string
}
```

### RespondToRequestDto
```typescript
{
  status: 'accepted' | 'rejected'
  employeeResponse?: string
}
```

## File Upload Support
- Job descriptions can be uploaded as PDF files
- Files stored in `/uploads/job-descriptions/`
- Supports text, markdown, and PDF formats
- File URL automatically set in `descriptionFileUrl` field

## Authentication & Authorization
- All routes require JWT authentication
- Role-based access control:
  - **EMPLOYER**: Can create jobs, view applications, request employees
  - **EMPLOYEE**: Can apply for jobs, respond to employer requests
  - **Both**: Can view all jobs