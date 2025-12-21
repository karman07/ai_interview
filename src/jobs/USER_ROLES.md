# User Roles Clarification

## User = Employee

In this system, **"user"** and **"employee"** refer to the same role.

- Default role for new registrations: `EMPLOYEE`
- Users can browse and apply for jobs
- To become an employer, role must be set to `EMPLOYER` during registration

## Role Types
- `EMPLOYEE` (default) - Can apply for jobs
- `EMPLOYER` - Can post jobs and manage applications

## Schemas

### User Schema
```typescript
{
  name: string;
  email: string;
  role: 'employee' | 'employer'; // default: 'employee'
  company?: string;
  resumeUrl?: string;
  profileImageUrl?: string;
}
```

### Job Schema
```typescript
{
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  employerId: ObjectId;
  isActive: boolean; // default: true
}
```

### Job Application Schema
```typescript
{
  jobId: ObjectId;
  employeeId: ObjectId;
  status: 'pending' | 'accepted' | 'rejected'; // default: 'pending'
  coverLetter?: string;
}
```

## API Routes

### Job Routes
- `POST /jobs` - Create job (employer only)
- `GET /jobs` - View all jobs
- `GET /jobs/my-jobs` - View employer's jobs
- `POST /jobs/:id/apply` - Apply for job (employee only)
- `GET /jobs/:id/applications` - View applications (employer only)
- `GET /jobs/:id/best-candidates` - Get ranked candidates (employer only)
- `PATCH /jobs/applications/:id/status/:status` - Update application status (employer only)

### User Routes (existing)
- `POST /auth/register` - Register with role selection
- `POST /auth/login` - Login
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile