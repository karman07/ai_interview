# Job Management API

## Overview
This API provides job management functionality with role-based access for employers and employees.

## User Roles
- **EMPLOYER**: Can create jobs, view applications, and find best candidates
- **EMPLOYEE**: Can view jobs and apply for positions

## Endpoints

### Jobs

#### Create Job (Employer Only)
```
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Software Engineer",
  "description": "We are looking for a skilled software engineer...",
  "requirements": ["JavaScript", "Node.js", "React"],
  "salary": 75000,
  "location": "New York, NY"
}
```

#### Get All Jobs
```
GET /jobs
Authorization: Bearer <token>
```

#### Get My Jobs (Employer Only)
```
GET /jobs/my-jobs
Authorization: Bearer <token>
```

#### Apply for Job (Employee Only)
```
POST /jobs/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverLetter": "I am interested in this position because..."
}
```

#### Get Job Applications (Employer Only)
```
GET /jobs/:id/applications
Authorization: Bearer <token>
```

#### Get Best Candidates (Employer Only)
```
GET /jobs/:id/best-candidates
Authorization: Bearer <token>
```

#### Update Application Status (Employer Only)
```
PATCH /jobs/applications/:applicationId/status/:status
Authorization: Bearer <token>

Status values: pending, accepted, rejected
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access
- Endpoints marked "Employer Only" require user role to be 'employer'
- Endpoints marked "Employee Only" require user role to be 'employee'
- Some endpoints are accessible to both roles