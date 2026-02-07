# Email Notification System Documentation

## Overview
Automated email notification system using AWS SES to send daily job updates to subscribed users at 3 AM EST.

---

## Features

### 1. Email Subscription Management
- Users can subscribe/unsubscribe to job updates
- Unique unsubscribe tokens for each subscriber
- Support for multiple subscription types
- Track last email sent timestamp

### 2. Automated Daily Emails
- Scheduled to run at 3 AM EST daily
- Only sends if new jobs posted in last 24 hours
- Bulk email sending with rate limiting
- Professional HTML email templates

### 3. AWS SES Integration
- Uses AWS Simple Email Service (SES)
- Region: us-east-1
- SMTP endpoint: email-smtp.us-east-1.amazonaws.com
- Supports both HTML and plain text emails

---

## Setup Instructions

### 1. AWS SES Configuration

#### Get SMTP Credentials:
1. Log into AWS Console: https://675550800021.signin.aws.amazon.com/console
2. Username: `Job_BOT`
3. Password: `8813917626$Karman`
4. Navigate to Amazon SES
5. Go to "SMTP Settings"
6. Click "Create SMTP Credentials"
7. Copy the Access Key ID and Secret Access Key

#### Update Environment Variables:
```bash
AWS_SES_ACCESS_KEY_ID=your_smtp_username
AWS_SES_SECRET_ACCESS_KEY=your_smtp_password
AWS_SES_FROM_EMAIL=noreply@aiforjob.ai
AWS_SES_REGION=us-east-1
```

#### Verify Email Domain:
1. In AWS SES, go to "Verified identities"
2. Click "Create identity"
3. Select "Domain" and enter: `aiforjob.ai`
4. Follow DNS verification steps
5. Or verify individual email addresses for testing

### 2. Install Dependencies
```bash
npm install @aws-sdk/client-ses nodemailer @nestjs/schedule
```

### 3. Module Registration
Already configured in `src/app.module.ts`:
```typescript
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // ... other modules
    EmailModule,
  ],
})
```

---

## API Endpoints

### POST `/email/subscribe`
Subscribe to job update emails.

**Request Body**:
```json
{
  "email": "user@example.com",
  "userId": "optional_user_id"
}
```

**Response**:
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

---

### POST `/email/unsubscribe`
Unsubscribe from job update emails.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully unsubscribed from job updates"
}
```

---

### GET `/email/subscription-status/:email`
Check subscription status for an email.

**Response**:
```json
{
  "isSubscribed": true,
  "email": "user@example.com"
}
```

---

### GET `/email/my-subscription`
Get current user's subscription status (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "isSubscribed": true,
  "email": "user@example.com",
  "subscriptionTypes": ["job_updates"]
}
```

---

### POST `/email/trigger-job-update`
Manually trigger job update email (for testing).

**Response**:
```json
{
  "success": true,
  "message": "Job update email triggered"
}
```

---

### GET `/email/subscribers/count`
Get total number of active subscribers.

**Response**:
```json
{
  "count": 150
}
```

---

## Database Schema

### EmailSubscription Collection
```typescript
{
  userId?: ObjectId;              // Optional reference to User
  email: string;                  // Required, unique, lowercase
  isSubscribed: boolean;          // Default: true
  subscriptionTypes: string[];    // Default: ['job_updates']
  unsubscribeToken?: string;      // Unique token for unsubscribe
  lastEmailSentAt?: Date;         // Last email sent timestamp
  createdAt: Date;                // Auto-generated
  updatedAt: Date;                // Auto-generated
}
```

---

## Scheduled Task

### Cron Schedule
- **Time**: 3:00 AM EST
- **Frequency**: Daily
- **Timezone**: America/New_York
- **Cron Expression**: `0 3 * * *`

### Task Logic
1. Check for new jobs in last 24 hours
2. If no new jobs, skip email sending
3. Get all active subscribers
4. Send bulk emails with rate limiting (100ms delay between emails)
5. Update `lastEmailSentAt` for all subscribers
6. Log success/failure counts

### Manual Trigger
For testing purposes:
```bash
curl -X POST http://localhost:3000/email/trigger-job-update
```

---

## Email Template

### Features
- Responsive HTML design
- Professional gradient header
- Clear call-to-action button
- Unsubscribe link in footer
- Plain text fallback
- Mobile-friendly

### Template Variables
- `jobCount`: Number of new jobs
- Website URL: https://aiforjob.ai
- Unsubscribe URL: https://aiforjob.ai/unsubscribe

### Preview
Subject: 🚀 New Job Opportunities Available at AIForJob.ai

Content includes:
- Personalized greeting
- Number of new jobs
- Platform benefits list
- "Explore Jobs Now" button
- Footer with unsubscribe link

---

## Rate Limiting

### AWS SES Limits
- **Sandbox**: 200 emails/day, 1 email/second
- **Production**: Request limit increase
- **Current Implementation**: 100ms delay between emails (10 emails/second)

### Recommendations
1. Request production access for higher limits
2. Implement exponential backoff for failures
3. Use SES bulk sending API for large lists
4. Monitor bounce and complaint rates

---

## Error Handling

### Email Service
- Logs all send attempts
- Returns success/failure status
- Continues on individual failures
- Provides summary statistics

### Scheduler Service
- Catches and logs all errors
- Doesn't crash on failures
- Continues daily schedule
- Skips sending if no new jobs

---

## Monitoring & Logs

### Log Messages
```
[EmailSchedulerService] Starting daily job update email task...
[EmailSchedulerService] Sending job updates to 150 subscribers about 5 new jobs
[EmailService] Job update email sent to user@example.com
[EmailSchedulerService] Daily job update completed: 148 sent, 2 failed
```

### Metrics to Track
- Total subscribers
- Emails sent per day
- Success/failure rate
- Bounce rate
- Unsubscribe rate
- Open rate (requires tracking pixels)

---

## Testing

### 1. Test Subscription
```bash
curl -X POST http://localhost:3000/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Test Manual Trigger
```bash
curl -X POST http://localhost:3000/email/trigger-job-update
```

### 3. Check Subscriber Count
```bash
curl http://localhost:3000/email/subscribers/count
```

### 4. Test Unsubscribe
```bash
curl -X POST http://localhost:3000/email/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Frontend Integration

### Subscribe Form Component
```typescript
const subscribeToJobUpdates = async (email: string) => {
  const response = await fetch('/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};
```

### Unsubscribe Page
```typescript
const unsubscribe = async (email: string) => {
  const response = await fetch('/email/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};
```

### Check Subscription Status
```typescript
const checkStatus = async (email: string) => {
  const response = await fetch(`/email/subscription-status/${email}`);
  return response.json();
};
```

---

## Security Considerations

### 1. Email Validation
- Emails are stored in lowercase
- Trimmed of whitespace
- Validated format

### 2. Unsubscribe Tokens
- Unique 32-byte random tokens
- Stored with each subscription
- Used for secure unsubscribe links

### 3. Rate Limiting
- Prevent spam subscriptions
- Implement CAPTCHA on frontend
- Limit subscription attempts per IP

### 4. Data Privacy
- Store minimal user data
- Provide easy unsubscribe
- Comply with GDPR/CAN-SPAM
- Include privacy policy link

---

## Production Checklist

- [ ] Verify AWS SES domain (aiforjob.ai)
- [ ] Request production access for SES
- [ ] Set correct AWS credentials in .env
- [ ] Test email delivery to multiple providers
- [ ] Verify unsubscribe links work
- [ ] Set up bounce/complaint handling
- [ ] Monitor email delivery rates
- [ ] Add email tracking (optional)
- [ ] Implement double opt-in (recommended)
- [ ] Add CAPTCHA to subscription form
- [ ] Set up email templates in SES
- [ ] Configure SPF/DKIM/DMARC records

---

## Troubleshooting

### Emails Not Sending
1. Check AWS credentials in .env
2. Verify email domain in SES
3. Check SES sending limits
4. Review CloudWatch logs
5. Verify cron job is running

### Emails Going to Spam
1. Verify SPF/DKIM/DMARC records
2. Warm up sending domain
3. Monitor bounce rates
4. Improve email content
5. Use verified sender domain

### High Bounce Rate
1. Validate email addresses before subscribing
2. Remove invalid emails from list
3. Implement double opt-in
4. Monitor SES bounce notifications

---

## Future Enhancements

### Planned Features
1. **Email Templates**: Multiple template types
2. **Personalization**: User name, job preferences
3. **Frequency Control**: Daily, weekly, monthly options
4. **Job Filtering**: By location, type, experience
5. **Analytics Dashboard**: Open rates, click rates
6. **A/B Testing**: Test different email content
7. **Digest Format**: Summary of all new jobs
8. **Instant Notifications**: For urgent job postings
9. **Email Preferences**: Customize notification types
10. **Referral System**: Share with friends

---

## Cost Estimation

### AWS SES Pricing (us-east-1)
- First 62,000 emails/month: FREE (if sent from EC2)
- Additional emails: $0.10 per 1,000 emails
- Attachments: $0.12 per GB

### Example Costs
- 1,000 subscribers: ~$0.03/day = ~$1/month
- 10,000 subscribers: ~$0.30/day = ~$9/month
- 100,000 subscribers: ~$3/day = ~$90/month

---

## Support & Maintenance

### Regular Tasks
- Monitor email delivery rates
- Review bounce/complaint reports
- Update email templates
- Clean inactive subscribers
- Optimize sending times
- A/B test subject lines

### Contact
- AWS Support: For SES issues
- Development Team: For code issues
- Email: support@aiforjob.ai

---

## Documentation Version
**Version**: 1.0  
**Last Updated**: December 24, 2024  
**Author**: AI Interview System Team
