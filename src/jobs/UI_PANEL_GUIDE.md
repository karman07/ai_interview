# UI Panel Guide - Employee & Employer

## Employee Panel (User Dashboard)

### Available Features ✅
- Browse all available jobs
- Apply for jobs with cover letter
- View application status

### ❌ RESTRICTED - Employees CANNOT:
- Create job postings (EMPLOYER ONLY)
- View job applications
- Manage applications
- Access employer dashboard features

### UI Routes & API Calls

#### Job Browsing Page
```
GET /jobs
Response: Array of jobs with employer info
```

#### Job Application (Employee Only)
```
POST /jobs/:id/apply
Body: { coverLetter?: string }
Requires: role = 'employee'
```

#### Employee Schema Display
```typescript
{
  name: string;
  email: string;
  role: 'employee';
  resumeUrl?: string;
  profileImageUrl?: string;
}
```

---

## Employer Panel (Company Dashboard)

### Available Features ✅
- Create new job postings
- View all posted jobs
- See job applications
- Find best candidates (ranked)
- Accept/reject applications

### ❌ RESTRICTED - Employers CANNOT:
- Apply for jobs (EMPLOYEE ONLY)

### UI Routes & API Calls

#### Create Job Page (Employer Only)
```
POST /jobs
Body: {
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
}
Requires: role = 'employer'
```

#### My Jobs Dashboard (Employer Only)
```
GET /jobs/my-jobs
Response: Array of employer's jobs
Requires: role = 'employer'
```

#### Job Applications View (Employer Only)
```
GET /jobs/:id/applications
Response: Array of applications with employee info
Requires: role = 'employer'
```

#### Best Candidates Ranking (Employer Only)
```
GET /jobs/:id/best-candidates
Response: Ranked candidates with scores
Requires: role = 'employer'
```

#### Application Management (Employer Only)
```
PATCH /jobs/applications/:id/status/accepted
PATCH /jobs/applications/:id/status/rejected
Requires: role = 'employer'
```

### Employer Schema Display
```typescript
{
  name: string;
  email: string;
  role: 'employer';
  company?: string;
  profileImageUrl?: string;
}
```

---

## Shared UI Components

### Registration Form
```
POST /auth/register
Body: {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'employer';
}
```

### Login Form
```
POST /auth/login
Body: {
  email: string;
  password: string;
}
```

### Profile Management
```
GET /users/profile
PATCH /users/profile
```