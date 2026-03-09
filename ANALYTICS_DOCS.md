# 📊 Analytics API Documentation

This module provides a robust tracking system for user behavior, session management, and business intelligence. It supports both RESTful HTTP requests and real-time WebSocket communication.

## 🚀 Base Configuration

- **Base URLs**: 
  - `http://api.aiforjob.ai/analytics`
  - `http://api.aiforjob.ai/interviews`
- **WebSocket Namespace**: `http://api.aiforjob.ai/analytics`

---

## 👤 Client Tracking (Public)

These endpoints are used by the frontend to track user interactions.

### 1. Track Visitor
Initializes or updates a persistent visitor profile.
- **Endpoint**: `POST /visitors`
- **Body**:
```json
{
  "visitorId": "unique-id-from-localstorage",
  "userId": "optional-platform-user-id",
  "userAgent": "Browser/OS info",
  "country": "India",
  "device": "desktop",
  "isAdmin": false
}
```

### 2. Start Session
Starts a new browsing session for a visitor.
- **Endpoint**: `POST /sessions/start`
- **Body**:
```json
{
  "sessionId": "random-session-id",
  "visitorId": "persistent-visitor-id",
  "landingPage": "/home",
  "referrer": "google.com"
}
```

### 3. Track Page View
Logs every page the user visits.
- **Endpoint**: `POST /pageviews`
- **Body**:
```json
{
  "sessionId": "random-session-id",
  "visitorId": "persistent-visitor-id",
  "path": "/dashboard/results",
  "title": "My Results",
  "timeOnPage": 120,
  "scrollDepth": 85
}
```

### 4. Session Heartbeat
Maintains the session's active status. Recommended to call every 30-60 seconds.
- **Endpoint**: `POST /heartbeat`
- **Body**:
```json
{
  "sessionId": "session-id",
  "visitorId": "visitor-id",
  "path": "/current-page-url"
}
```

---

## 🛠️ Admin Analytics (Admin Only)

Comprehensive snapshots of the platform's performance.

### 1. Dashboard Stats (Interview Dashboard)
Recommended endpoint for fetching overall platform performance.
- **Endpoint**: `GET /interviews/dashboard-stats`
- **Response Features**:
  - **Overview**: Total Users, Total Revenue (INR), Total Interviews conducted, Total Resumes.
  - **Growth**: New signups in last 7 days + conversion rate.
  - **Activity Chart**: Daily session volume for the past 7 days.
  - **Metrics**: User role distribution, Popular topics, Traffic sources.

### 2. Analytics Summary
Quick stats summary.
- **Endpoint**: `GET /analytics/summary`

---

## �️ Admin Analytics (Admin Only)

Comprehensive snapshots of the platform's performance.

### 1. Dashboard Stats (Interview Dashboard)
Recommended endpoint for fetching overall platform performance.
- **Endpoint**: `GET /interviews/dashboard-stats`

### 2. Analytics Summary
Quick stats summary.
- **Endpoint**: `GET /analytics/summary`

---

## �🔌 Real-time Tracking (WebSockets)

For lower overhead and instantaneous updates, use the WebSocket gateway.

### Connection
- **URL**: `ws://localhost:3000/analytics`
- **Query Params**: `visitorId`, `sessionId`, `userId`

### Events (Client to Server)
- **`trackPageView`**: Send same payload as the POST endpoint.
- **`trackEvent`**: Track custom actions (e.g., button clicks).
- **`heartbeat`**: Keep connection alive.

### Events (Server to Client)
- **`connected`**: Emitted on successful handshake.
- **`pageViewTracked`**: Broadcasted to sessions when a view is recorded.

---

## 📈 Database Indices
For high-performance queries, the following fields are indexed:
- `Visitor.visitorId` (Unique)
- `Session.sessionId` (Unique)
- `Session.startTime`
- `PageView.timestamp`
