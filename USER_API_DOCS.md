# 📱 User API Documentation (Client-Facing)

This document provides a comprehensive guide to all endpoints available for the end-user application. 

**Base URL**: `http://localhost:3000` (or your production URL)  
**Authentication**: Use the `Authorization: Bearer <JWT_ACCESS_TOKEN>` header for all protected routes.

---

## 🔐 1. Authentication (`/auth`)

### 1.1 Sign Up
Create a new user account. Does not issue a token immediately.
- **Endpoint**: `POST /auth/signup`
- **Body**:
```json
{
  "name": "Full Name",
  "email": "user@example.com",
  "password": "strongPassword123",
  "role": "user", 
  "company": "Optional Company",
  "industry": "Optional Industry"
}
```
- **Note**: You must verify your email via Firebase and sync status using `PATCH /users/me/verify-status` before you can log in.

### 1.2 Email Login
Log in with credentials. Email must be verified.
- **Endpoint**: `POST /auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### 1.3 Google Login (Firebase)
Log in or sign up via Google Firebase.
- **Endpoint**: `POST /auth/google`
- **Body**: `{ "idToken": "FIREBASE_TOKEN" }`
- **Note**: This automatically marks the user's email as verified.

---

## 👤 2. User Profile (`/users`)

### 2.1 Get My Data
Fetch your full profile, including verified status and professional info.
- **Endpoint**: `GET /users/me`
- **Response**: Full user object with populated `subscriptionPlan`.

### 2.2 Update Profile
Update professional details.
- **Endpoint**: `PATCH /users/profile`
- **Body** (Supports JSON or Multipart):
```json
{
  "name": "New Name",
  "bio": "Professional Bio",
  "phone": "+91...",
  "location": "City, Country",
  "experienceLevel": "Mid-Level",
  "skills": ["JavaScript", "NestJS"],
  "website": "https://...",
  "githubUrl": "https://github.com/...",
  "linkedinUrl": "https://linkedin.com/in/..."
}
```
*Note: `jobDescription` and `resumeUrl` are no longer supported in the profile update.*

### 2.3 Upload Profile Image
- **Endpoint**: `PATCH /users/me/profile-image`
- **Body**: Multipart file with field name `profileImage`.

### 2.4 Sync Verification Status
Update backend status after Firebase phone/email verification.
- **Endpoint**: `PATCH /users/me/verify-status`
- **Body**: `{ "field": "email" | "phone", "status": true }`

---

## 📄 3. Resume Management (`/resume`)

### 3.1 Upload Resume
Upload a PDF/Word resume for AI analysis.
- **Endpoint**: `POST /resume/upload`
- **Body**: Multipart file with field `resume`. Optional `jdText` or `jdFile`.

### 3.2 List My Resumes
Get history of uploaded resumes.
- **Endpoint**: `GET /resume`

### 3.3 Delete Resume
- **Endpoint**: `DELETE /resume/:id`

---

## 💳 4. Subscriptions & Payments (`/subscriptions`, `/payments`)

### 4.1 Get Local Plans
Fetch active plans available in your country.
- **Endpoint**: `GET /subscriptions/active?country=IN` (Use ISO codes like IN, US)

### 4.2 Create Razorpay Order
- **Endpoint**: `POST /payments/orders`
- **Body**:
```json
{
  "amount": 999, // In Rupees/Dollars (Total)
  "subscriptionId": "PLAN_MONGO_ID",
  "description": "Unlock Pro Access"
}
```

### 4.3 Verify & Activate
Verify Razorpay signature to instantly upgrade your account.
- **Endpoint**: `POST /payments/verify`
- **Body**:
```json
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "sig_xxx"
}
```

---

## 🎤 5. Interview Sessions (`/sessions`)

### 5.1 Start Multi-Step Interview
- **Endpoint**: `POST /sessions`
- **Body**: `{ "jd": "Job Text", "difficulty": "Medium" }`

### 5.2 Get Session State
- **Endpoint**: `GET /sessions/:id`

---

## 📊 6. Results & Progress (`/results`, `/progress`)

### 6.1 View Interview History
- **Endpoint**: `GET /results`

### 6.2 Get Personalized Report
- **Endpoint**: `GET /results/:id`

### 6.3 Track Learning Progress
- **Endpoint**: `GET /progress/me`

---

## 🎓 7. Material (`/subjects`, `/lessons`)

### 7.1 List Subjects
- **Endpoint**: `GET /subjects`

### 7.2 Get Lessons
- **Endpoint**: `GET /lessons?subjectId=...`
