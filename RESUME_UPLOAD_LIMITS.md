# Resume Upload Limits - Frontend Integration Guide

This document describes how the resume upload limits are enforced on the backend and how the frontend should handle them.

## 📊 Subscription Tiers & Limits

The application enforces strict limits on the number of resumes a user can upload based on their current plan.

| Plan | Status | Resume Limit |
| :--- | :--- | :--- |
| **Free Tier** | `free` | **5 Resumes** |
| **Pro Monthly** | `active` | **10 Resumes** |
| **Enterprise Yearly** | `active` | **1000 Resumes** |

---

## 🛠 Backend Enforcement

The limitation logic is implemented in `ResumeService.uploadResume`. Before saving any file or calling the AI evaluation APIs, the backend:
1.  Identifies the user from the JWT token.
2.  Counts the number of existing resumes for that user in MongoDB.
3.  Checks the user's `subscriptionPlan` to find the `"Resume Upload Limit"` feature.
4.  If the count meets or exceeds the limit, it returns a `400 Bad Request`.

---

## 🛑 Handling Errors in Frontend

When a user reaches their limit, the backend will return an error response. You should catch this in your API calls.

### API Endpoint: `POST /v1/resume/upload`

**Example Response (Status 400):**
```json
{
  "statusCode": 400,
  "message": "You have reached your limit of 5 resumes. Please upgrade your plan to upload more.",
  "error": "Bad Request"
}
```

### ✅ Best Practices for UI
- **Usage Indicator**: Before the user clicks "Upload," you can fetch the user's current resume count using `GET /v1/resume/history` and display it (e.g., "3 of 5 resumes used").
- **Disable Upload**: If the limit is reached, disable the "Upload" button and show a link to the Pricing page.
- **Dynamic Plan Check**: You can read the `subscriptionPlan` features from the user profile object returned by `GET /api/users/profile` to get the current limit value dynamically.

### How to fetch the current limit value via API:
The user object contains the `subscriptionPlan` object (when populated). You can find the limit here:
```javascript
const userLimit = user.subscriptionPlan.features.find(f => f.name === 'Resume Upload Limit').value;
```

---

## 🔄 Admin Management

Admins can change these limits globally by updating the features of a subscription plan. All users currently on that plan will be immediately subject to the new limits.
