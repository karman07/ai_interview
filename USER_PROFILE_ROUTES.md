# 👤 User Profile API Documentation (v2 - User/Admin Schema)

This document details the user profile routes and the simplified role system for the Ai for job.

**Base URL**: `http://api.aiforjob.ai`
**Authentication**: Required for protected routes (`Authorization: Bearer <JWT_ACCESS_TOKEN>`).

---

## 🏗️ 1. User Schema Overview

The user schema now uses a simplified role system: `user` (default) and `admin`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name of the user |
| `email` | String | Unique email address (indexed, lowercase) |
| `role` | Enum | `user` or `admin` |
| `isEmailVerified`| Boolean | Status of email verification |
| `isPhoneVerified`| Boolean | Status of phone verification |
| `profileImageUrl`| String | URL to the profile picture |
| `bio` | String | Professional biography |
| `phone` | String | Contact phone number |
| `location` | String | User's location (City, Country) |
| `experienceLevel`| String | e.g., "Junior", "Mid-Level", "Senior" |
| `skills` | String[] | Array of technical/soft skills |
| `company` | String | (Optional) Company name |
| `industry` | String | (Optional) Industry sector |
| `subscriptionPlan`| ObjectId | Reference to `Subscription` schema |
| `subscriptionStatus`| String | `free`, `active`, `expired`, `trial` |

---

## 🔑 2. Authentication (`/auth`)

### 2.1 Sign Up / Register
Creates a new user account with the `user` role by default.
- **Endpoint**: `POST /auth/signup`
- **Body**: 
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "strongPassword123",
  "role": "user" 
}
```

### 2.2 Login
- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: Returns JWT token and User object (with role).

---

## 🚀 3. Profile Routes (`/users`)

### 3.1 Get My Profile
- **Endpoint**: `GET /users/me`
- **Response**: The complete user object.

### 3.2 Update Profile
Update your professional details.
- **Endpoint**: `PATCH /users/profile`
- **Body Example**:
```json
{
  "name": "John Updated",
  "bio": "Expert Developer",
  "location": "New York, USA",
  "skills": ["JavaScript", "NestJS"]
}
```

### 3.3 Update Verification Status
- **Endpoint**: `PATCH /users/me/verify-status`
- **Body**: `{ "field": "email" | "phone", "status": true }`

---

## 🛡️ 4. Admin Access
Certain routes may be restricted to the `admin` role using the `RolesGuard`.
To restrict a route, developers use:
`@Roles(UserRole.ADMIN)`
`@UseGuards(JwtAuthGuard, RolesGuard)`
