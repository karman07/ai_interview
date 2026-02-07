# Postman Collection - Email & Enhanced Jobs API

## Files
- `Email_Enhanced_Jobs_API.postman_collection.json` - Complete API collection
- `Local_Environment.postman_environment.json` - Environment variables

## Import Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Email_Enhanced_Jobs_API.postman_collection.json`
4. Collection will appear in left sidebar

### 2. Import Environment
1. Click "Import" button
2. Select `Local_Environment.postman_environment.json`
3. Select environment from dropdown (top right)

## Quick Start

### Step 1: Login
1. Go to **Auth > Login**
2. Update email/password in request body
3. Send request
4. Access token automatically saved to `{{accessToken}}` variable

### Step 2: Test Email APIs
All email endpoints are in **Email Notification System** folder:
- Subscribe to Job Updates
- Unsubscribe
- Get Subscription Status
- Trigger Email (for testing)

### Step 3: Test Enhanced Job APIs
All job endpoints are in **Enhanced Job Management** folder:
- Create Job (requires employer role)
- Get My Jobs
- Get Dashboard Stats
- Update/Delete Job
- Manage Applications

## Variables

### Collection Variables
- `baseUrl` - API base URL (default: http://localhost:3000)
- `accessToken` - JWT token (auto-set on login)
- `jobId` - Job ID for testing
- `applicationId` - Application ID for testing

### How to Set Variables
1. After creating a job, copy the `_id` from response
2. Set as collection variable: `jobId`
3. Use `{{jobId}}` in subsequent requests

## API Endpoints Summary

### Email Notification System (6 endpoints)
```
POST   /email/subscribe              - Subscribe to job updates
POST   /email/unsubscribe            - Unsubscribe from updates
GET    /email/subscription-status/:email - Check subscription
GET    /email/my-subscription        - Get user subscription (auth)
POST   /email/trigger-job-update     - Manual trigger (testing)
GET    /email/subscribers/count      - Get subscriber count
```

### Enhanced Job Management (11 endpoints)
```
POST   /jobs/enhanced                - Create job (employer)
GET    /jobs/enhanced/my-jobs        - Get employer jobs
GET    /jobs/enhanced/dashboard-stats - Dashboard statistics
PUT    /jobs/enhanced/:jobId         - Update job
DELETE /jobs/enhanced/:jobId         - Delete job
GET    /jobs/enhanced/:jobId/applications - Get applications
GET    /jobs/enhanced/:jobId/top-candidates - Top candidates
GET    /jobs/enhanced/:jobId/analytics - Job analytics
PUT    /jobs/enhanced/applications/:id/status - Update status
POST   /jobs/enhanced/bulk-update-status - Bulk update
POST   /jobs/enhanced/:jobId/toggle-status - Toggle active
```

### Auth (2 endpoints)
```
POST   /auth/login                   - Login (auto-saves token)
POST   /auth/logout                  - Logout
```

## Testing Workflow

### Email System Testing
1. **Subscribe**: POST /email/subscribe with test email
2. **Check Status**: GET /email/subscription-status/:email
3. **Trigger Email**: POST /email/trigger-job-update
4. **Check Count**: GET /email/subscribers/count
5. **Unsubscribe**: POST /email/unsubscribe

### Job Management Testing
1. **Login**: POST /auth/login (employer account)
2. **Create Job**: POST /jobs/enhanced
3. **Get Jobs**: GET /jobs/enhanced/my-jobs
4. **Dashboard**: GET /jobs/enhanced/dashboard-stats
5. **Applications**: GET /jobs/enhanced/:jobId/applications
6. **Analytics**: GET /jobs/enhanced/:jobId/analytics
7. **Update Status**: PUT /jobs/enhanced/applications/:id/status

## Authentication

### Required Headers
```
Authorization: Bearer {{accessToken}}
```

### Roles
- **Employer**: Can create/manage jobs and view applications
- **Employee**: Can apply to jobs and view recommendations

## Response Examples

### Subscribe Response
```json
{
  "success": true,
  "message": "Successfully subscribed to job updates",
  "subscription": {
    "email": "user@example.com",
    "isSubscribed": true
  }
}
```

### Dashboard Stats Response
```json
{
  "totalJobs": 15,
  "activeJobs": 12,
  "totalApplications": 87,
  "pendingApplications": 23,
  "recentJobs": [...]
}
```

### Job Analytics Response
```json
{
  "totalApplications": 45,
  "statusBreakdown": {
    "pending": 15,
    "reviewed": 10,
    "shortlisted": 8,
    "rejected": 10,
    "hired": 2
  },
  "averageAIMatch": 72.5,
  "averageInterviewScore": 7.8,
  "topSkills": [...],
  "applicationTrend": [...]
}
```

## Troubleshooting

### 401 Unauthorized
- Login first to get access token
- Check token is set in Authorization header
- Token may have expired, login again

### 403 Forbidden
- Check user has correct role (employer/employee)
- Some endpoints require employer role

### 404 Not Found
- Verify server is running on http://localhost:3000
- Check endpoint URL is correct
- Ensure jobId/applicationId variables are set

### Email Not Sending
- Check AWS SES credentials in .env
- Verify email domain is verified in AWS SES
- Check server logs for errors

## Notes

- All timestamps are in ISO 8601 format
- Dates are in UTC timezone
- Email addresses are stored in lowercase
- Job types: full-time, part-time, contract, internship
- Experience levels: entry, mid, senior, executive
- Application statuses: pending, reviewed, shortlisted, rejected, interview_scheduled, hired

## Support

For issues or questions:
- Check server logs: `npm run start:dev`
- Review documentation: `EMAIL_NOTIFICATION_SYSTEM.md`
- Review documentation: `JOB_MANAGEMENT_COMPLETE_DOCUMENTATION.md`
