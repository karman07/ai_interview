# Authentication API Documentation

## 🔐 Overview

Complete authentication system with **JWT tokens**, **Google OAuth**, **bcrypt password hashing**, and **refresh token rotation**.

---

## 📋 API Endpoints

### 1️⃣ **Sign Up** (Email/Password)
Create a new user account with email and password.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Developer",
  "company": "Tech Corp",
  "industry": "Software"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"securePassword123\",\"role\":\"Developer\",\"company\":\"Tech Corp\"}"
```

**Response:**
```json
{
  "user": {
    "_id": "6730a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Developer",
    "company": "Tech Corp",
    "industry": "Software",
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `refresh_token` (HttpOnly, 7 days expiry)

---

### 2️⃣ **Login** (Email/Password)
Authenticate existing user with email and password.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"securePassword123\"}"
```

**Response:**
```json
{
  "user": {
    "_id": "6730a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Developer",
    "company": "Tech Corp"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `refresh_token` (HttpOnly, 7 days expiry)

**Error Cases:**

❌ **Missing Credentials:**
```json
{
  "statusCode": 401,
  "message": "Email and password are required",
  "error": "Unauthorized"
}
```

❌ **Wrong Email/Password:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

❌ **Google-Only Account:**
```json
{
  "statusCode": 401,
  "message": "This account uses Google Sign-In. Please login with Google.",
  "error": "Unauthorized"
}
```

---

### 3️⃣ **Google Login**
Authenticate using Google OAuth ID token.

**Endpoint:** `POST /auth/google`

**Request Body:**
```json
{
  "idToken": "ya29.a0AfH6SMBx..."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/google \
  -H "Content-Type: application/json" \
  -d "{\"idToken\":\"ya29.a0AfH6SMBx...\"}"
```

**Response:**
```json
{
  "user": {
    "_id": "6730a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "googleId": "108234567890123456789",
    "profileImageUrl": "https://lh3.googleusercontent.com/a/..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Behavior:**
- If user exists with same email → Links Google account
- If new Google user → Creates new account
- If existing Google user → Returns existing account

**Cookies Set:**
- `refresh_token` (HttpOnly, 7 days expiry)

---

### 4️⃣ **Logout**
Invalidate refresh token and clear cookies.

**Endpoint:** `GET /auth/logout`

**Authentication:** Required (JWT Bearer Token)

**cURL Command:**
```bash
curl -X GET http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true
}
```

**Actions:**
- Clears `refresh_token` cookie
- Invalidates refresh token in database

---

### 5️⃣ **Refresh Token**
Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "userId": "6730a1b2c3d4e5f6a7b8c9d0",
  "email": "john@example.com"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"6730a1b2c3d4e5f6a7b8c9d0\",\"email\":\"john@example.com\"}"
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- New `refresh_token` (HttpOnly, 7 days expiry)

---

## 🔒 Security Features

### Password Hashing
- **Algorithm:** bcrypt with salt rounds = 10
- **Storage:** Only hashed passwords stored in database
- **Validation:** Constant-time comparison

### JWT Tokens
- **Access Token:** Short-lived (15 minutes default)
- **Refresh Token:** Long-lived (7 days default)
- **Algorithm:** HS256
- **Payload:** `{ sub: userId, email }`

### Refresh Token Rotation
- New refresh token issued on every refresh
- Old refresh token invalidated
- Refresh token hash stored in database

### Cookie Security
- **HttpOnly:** Prevents XSS attacks
- **SameSite:** Lax (CSRF protection)
- **Secure:** Set to `true` in production
- **Path:** `/` (accessible to all routes)

### Google OAuth
- **Verification:** Firebase Admin SDK
- **Token Validation:** Server-side verification
- **User Linking:** Automatic email-based linking

---

## 🌐 Authentication Flow

### Email/Password Flow
```
1. User submits email + password
   ↓
2. Backend validates credentials
   ↓
3. bcrypt compares password hash
   ↓
4. Generate access + refresh tokens
   ↓
5. Hash refresh token and store
   ↓
6. Set refresh token in HttpOnly cookie
   ↓
7. Return user data + access token
```

### Google OAuth Flow
```
1. Frontend gets ID token from Google
   ↓
2. Send ID token to backend
   ↓
3. Verify token with Firebase
   ↓
4. Find or create user
   ↓
5. Link Google ID to account
   ↓
6. Generate access + refresh tokens
   ↓
7. Return user data + access token
```

### Token Refresh Flow
```
1. Access token expires
   ↓
2. Frontend sends userId + email
   ↓
3. Backend verifies refresh token cookie
   ↓
4. Generate new access + refresh tokens
   ↓
5. Invalidate old refresh token
   ↓
6. Return new access token
```

---

## 🛡️ Protected Routes

Use the `@UseGuards(JwtAuthGuard)` decorator to protect routes:

```typescript
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: any) {
  return user;
}
```

**Access Token in Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 User Object Structure

### Standard User (Email/Password)
```json
{
  "_id": "6730a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "$2b$10$...", // Never returned in API
  "role": "Developer",
  "company": "Tech Corp",
  "industry": "Software",
  "jobDescription": "Senior Developer",
  "resumeUrl": "/uploads/resumes/...",
  "profileImageUrl": "/uploads/profile-images/...",
  "refreshTokenHash": "$2b$10$...", // Never returned in API
  "createdAt": "2025-10-14T10:30:00.000Z",
  "updatedAt": "2025-10-14T10:30:00.000Z"
}
```

### Google User
```json
{
  "_id": "6730a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "email": "john@example.com",
  "googleId": "108234567890123456789",
  "profileImageUrl": "https://lh3.googleusercontent.com/a/...",
  "role": "Developer",
  "company": "Tech Corp",
  "createdAt": "2025-10-14T10:30:00.000Z",
  "updatedAt": "2025-10-14T10:30:00.000Z"
}
```

**Note:** Google users don't have `passwordHash` field.

---

## 🚨 Common Error Scenarios

### 1. Login with Google Account Using Password
**Problem:** User created account with Google, tries to login with password

**Solution:** System detects missing `passwordHash` and returns:
```json
{
  "statusCode": 401,
  "message": "This account uses Google Sign-In. Please login with Google.",
  "error": "Unauthorized"
}
```

### 2. Missing Email or Password
**Problem:** Empty or null credentials sent

**Solution:** System validates input before bcrypt:
```json
{
  "statusCode": 401,
  "message": "Email and password are required",
  "error": "Unauthorized"
}
```

### 3. Invalid Credentials
**Problem:** Wrong email or password

**Solution:** Generic error message (security best practice):
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 4. Expired Access Token
**Problem:** Access token expired (after 15 minutes)

**Solution:** Use refresh endpoint to get new access token

### 5. Invalid Refresh Token
**Problem:** Refresh token cookie missing or tampered

**Solution:** User must login again

---

## 🔧 Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Firebase (for Google OAuth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Database
MONGODB_URI=mongodb://localhost:27017/ai_interview
```

---

## 📝 Complete Integration Example

### Frontend Login Flow (JavaScript)

```javascript
// 1. Login with Email/Password
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const { user, accessToken } = await response.json();
    
    // Store access token (localStorage/sessionStorage)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, accessToken };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// 2. Login with Google
const googleLogin = async (idToken) => {
  try {
    const response = await fetch('http://localhost:3000/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken })
    });
    
    const { user, accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, accessToken };
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

// 3. Make Authenticated Request
const fetchProtectedData = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/some-protected-route', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    await refreshToken();
    // Retry request
    return fetchProtectedData();
  }
  
  return response.json();
};

// 4. Refresh Token
const refreshToken = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      userId: user._id,
      email: user.email
    })
  });
  
  const { accessToken } = await response.json();
  localStorage.setItem('accessToken', accessToken);
  
  return accessToken;
};

// 5. Logout
const logout = async () => {
  const token = localStorage.getItem('accessToken');
  
  await fetch('http://localhost:3000/auth/logout', {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};
```

---

## ✅ Testing Checklist

- [ ] Sign up with new email/password
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Login with non-existent email (should fail)
- [ ] Login with empty email/password (should fail)
- [ ] Sign up with Google (new user)
- [ ] Login with Google (existing user)
- [ ] Login with password on Google-only account (should fail with message)
- [ ] Access protected route with valid token
- [ ] Access protected route with expired token
- [ ] Refresh access token
- [ ] Logout and verify token invalidation
- [ ] Try to use refresh token after logout (should fail)

---

## 🎯 Quick Test Commands

### 1. Sign Up
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 3. Access Protected Route
```bash
# Replace YOUR_ACCESS_TOKEN with actual token from login response
curl -X GET http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔗 Related Documentation

- [Users API](../users/USERS_API.md)
- [DSA Questions API](../dsa-questions/README.md)
- [Code Execution API](../dsa-questions/CODE_EXECUTION.md)
- [Progress Tracking API](../dsa-questions/PROGRESS_TRACKING.md)

---

**Authentication system is fully functional and secure!** 🔐

Last Updated: October 14, 2025
