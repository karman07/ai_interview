# User Job Guide

## For Job Seekers (Employees)

### What You Can Do
- Browse available job listings
- Apply for jobs with cover letter
- Track your application status

### Job Search
```
GET /jobs
```
View all active job postings with company details.

### Apply for Jobs
```
POST /jobs/:jobId/apply
Body: {
  coverLetter?: "Why I'm interested in this role..."
}
```

### Job Data Structure
```typescript
Job {
  title: string;           // "Software Engineer"
  description: string;     // Job details
  requirements: string[];  // ["JavaScript", "React"]
  salary: number;         // 75000
  location: string;       // "New York, NY"
  company: string;        // Employer's company name
}
```

### Application Status
- `pending` - Waiting for employer review
- `accepted` - You got the job! 🎉
- `rejected` - Better luck next time

### ❌ What You Cannot Do
- Post job listings (employers only)
- View other people's applications
- Manage job postings