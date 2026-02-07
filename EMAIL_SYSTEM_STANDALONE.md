# Email Subscription System - Standalone

## Overview
Simple email subscription system that sends daily updates at 9:25 AM IST to all subscribers. No job dependency.

## Features
- Subscribe/Unsubscribe functionality
- Welcome email on subscription
- Daily update emails at 9:25 AM IST
- AWS SES integration

## API Endpoints

### POST `/email/subscribe`
Subscribe to daily updates and receive welcome email.

**Request**:
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
  "message": "Successfully subscribed to daily updates",
  "subscription": {
    "email": "user@example.com",
    "isSubscribed": true
  }
}
```

### POST `/email/unsubscribe`
Unsubscribe from daily updates.

**Request**:
```json
{
  "email": "user@example.com"
}
```

### GET `/email/subscription-status/:email`
Check subscription status.

### POST `/email/trigger-daily-update`
Manually trigger daily email (for testing).

### GET `/email/subscribers/count`
Get total subscriber count.

## Schedule
- **Time**: 9:25 AM IST (Asia/Kolkata timezone)
- **Frequency**: Daily
- **Cron**: `25 9 * * *`

## Email Templates

### Welcome Email
Sent immediately after subscription with:
- Thank you message
- Platform overview
- Visit website button

### Daily Update Email
Sent daily at 9:25 AM with:
- Daily greeting
- Platform features
- Call to action

## Setup

1. **AWS SES Credentials** in `.env`:
```
AWS_SES_ACCESS_KEY_ID=your_key
AWS_SES_SECRET_ACCESS_KEY=your_secret
AWS_SES_FROM_EMAIL=noreply@aiforjob.ai
```

2. **Verify Domain** in AWS SES

3. **Test**:
```bash
# Subscribe
curl -X POST http://localhost:3000/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Trigger daily email
curl -X POST http://localhost:3000/email/trigger-daily-update
```

## Testing Schedule
Current time set to 9:25 AM IST for immediate testing. Adjust cron expression as needed:
- `25 9 * * *` - 9:25 AM daily
- `0 9 * * *` - 9:00 AM daily
- `30 9 * * *` - 9:30 AM daily
