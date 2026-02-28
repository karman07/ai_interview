# Frontend Integration Guide: Subscription & Feature Limits

This document summarizes the recent backend changes regarding default user plans and feature limit enforcement. Use this to update your React/Vue components and provide a better user experience.

---

## 🚀 1. Default Plan Assignment (New)

Every user now is automatically assigned a **Free Tier** subscription upon registration (this applies to both Email and Google signups).

### What changed?
- **User Object**: When you call `GET /users/me`, you will now see `subscriptionStatus: "free"` and a populated `subscriptionPlan` object by default for all new accounts.
- **Frontend Action**: You no longer need to check if `subscriptionPlan` is null. You can immediately access the features of the "Free Tier."

---

## 📊 2. Resume Upload Limits

The backend strictly enforces a cap on the number of resumes a user can upload.

| Plan | Status | Resume Limit |
| :--- | :--- | :--- |
| **Free Tier** | `free` | **5 Resumes** |
| **Pro Monthly** | `active` | **10 Resumes** |
| **Enterprise Yearly**| `active` | **1000 Resumes** |

### Enforcement Logic
When calling `POST /v1/resume/upload`:
1. The backend counts existing resumes for that user.
2. It checks the limit in their plan's features.
3. If limit reached, it returns **`400 Bad Request`**.

---

## 🛑 3. Handling Limit Errors

When a user hits their limit, the API will fail with this specific payload:

**Payload (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "You have reached your limit of 5 resumes. Please upgrade your plan to upload more.",
  "error": "Bad Request"
}
```

### Recommendation for UI Implementation:
- **Toast/Alert**: Catch the 400 error and show the `message` to the user.
- **Redirect**: Add a "Upgrade to Pro" button in the error modal that links to your Pricing page.

---

## 🛠️ 4. Proactive UI Updates (Recommended)

To avoid letting users try an upload that will fail, follow this flow:

### Step 1: Get Current Usage & Limit
Fetch the user profile and their resume history.
```javascript
// From user profile
const limitFeature = user.subscriptionPlan.features.find(f => f.name === 'Resume Upload Limit');
const maxResumes = limitFeature ? limitFeature.value : 5;

// From resume history
const currentResumes = resumeHistory.length;
```

### Step 2: Display Usage
Show a simple progress indicator on the dashboard:
> **Resumes:** 3 / 10 used

### Step 3: Conditional Button State
If `currentResumes >= maxResumes`, disable the **"Upload New Resume"** button and show a tool-tip: *"You've reached your plan limit. Upgrade to Pro for more storage."*

---

## 🔗 Related Endpoints
- `GET /users/me`: To get plan details.
- `GET /v1/resume/history`: To get current resume count.
- `POST /v1/resume/upload`: The endpoint being limited.
