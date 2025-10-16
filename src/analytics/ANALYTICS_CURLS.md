# Analytics API - cURL Commands Reference

## 🚀 Quick Test Commands

### 1️⃣ **Track Visitor**
```bash
curl -X POST http://localhost:3000/analytics/visitors \
  -H "Content-Type: application/json" \
  -d "{\"visitorId\":\"visitor_1759377739126_e7a874oyk\",\"device\":\"desktop\",\"country\":\"United States\",\"isAdmin\":false}"
```

### 2️⃣ **Start Session**
```bash
curl -X POST http://localhost:3000/analytics/sessions/start \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_1759377952761_aozn7jswc\",\"visitorId\":\"visitor_1759377739126_e7a874oyk\",\"landingPage\":\"/\",\"device\":\"desktop\"}"
```

### 3️⃣ **Track Page View**
```bash
curl -X POST http://localhost:3000/analytics/pageviews \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_1759377952761_aozn7jswc\",\"visitorId\":\"visitor_1759377739126_e7a874oyk\",\"path\":\"/dsa\",\"title\":\"DSA Questions\"}"
```

### 4️⃣ **Heartbeat (Keep-Alive)**
```bash
curl -X POST http://localhost:3000/analytics/heartbeat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_1759377952761_aozn7jswc\",\"visitorId\":\"visitor_1759377739126_e7a874oyk\",\"path\":\"/dsa\"}"
```

### 5️⃣ **WebSocket Connect Handshake**
```bash
curl -X POST http://localhost:3000/analytics/connect \
  -H "Content-Type: application/json" \
  -d "{\"visitorId\":\"visitor_1759377739126_e7a874oyk\",\"sessionId\":\"session_1759377952761_aozn7jswc\"}"
```

### 6️⃣ **End Session**
```bash
curl -X POST http://localhost:3000/analytics/sessions/session_1759377952761_aozn7jswc/end \
  -H "Content-Type: application/json" \
  -d "{\"exitPage\":\"/goodbye\"}"
```

### 7️⃣ **Get All Visitors**
```bash
curl -X GET http://localhost:3000/analytics/visitors
```

### 8️⃣ **Get Visitor Stats**
```bash
curl -X GET http://localhost:3000/analytics/visitors/visitor_1759377739126_e7a874oyk
```

### 9️⃣ **Get All Sessions**
```bash
curl -X GET "http://localhost:3000/analytics/sessions?limit=100"
```

### 🔟 **Get Session Details**
```bash
curl -X GET http://localhost:3000/analytics/sessions/session_1759377952761_aozn7jswc
```

### 1️⃣1️⃣ **Get All Page Views**
```bash
curl -X GET "http://localhost:3000/analytics/pageviews?limit=100"
```

### 1️⃣2️⃣ **Get Analytics Summary**
```bash
curl -X GET http://localhost:3000/analytics/summary
```

---

## 🧪 Complete Test Flow

### Step 1: Track New Visitor
```bash
curl -X POST http://localhost:3000/analytics/visitors \
  -H "Content-Type: application/json" \
  -d "{\"visitorId\":\"visitor_test_123\",\"device\":\"desktop\",\"country\":\"US\"}"
```

### Step 2: Start Session
```bash
curl -X POST http://localhost:3000/analytics/sessions/start \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_test_123\",\"visitorId\":\"visitor_test_123\",\"landingPage\":\"/home\"}"
```

### Step 3: Track Multiple Page Views
```bash
# Page 1: Home
curl -X POST http://localhost:3000/analytics/pageviews \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_test_123\",\"visitorId\":\"visitor_test_123\",\"path\":\"/home\",\"title\":\"Home\"}"

# Page 2: DSA Questions
curl -X POST http://localhost:3000/analytics/pageviews \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_test_123\",\"visitorId\":\"visitor_test_123\",\"path\":\"/dsa\",\"title\":\"DSA\",\"timeOnPage\":45}"

# Page 3: Specific Question
curl -X POST http://localhost:3000/analytics/pageviews \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_test_123\",\"visitorId\":\"visitor_test_123\",\"path\":\"/dsa/two-sum\",\"title\":\"Two Sum\",\"timeOnPage\":120,\"scrollDepth\":95}"
```

### Step 4: Send Heartbeat
```bash
curl -X POST http://localhost:3000/analytics/heartbeat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"session_test_123\",\"visitorId\":\"visitor_test_123\",\"path\":\"/dsa/two-sum\"}"
```

### Step 5: Check Session Details
```bash
curl -X GET http://localhost:3000/analytics/sessions/session_test_123
```

### Step 6: Check Visitor Stats
```bash
curl -X GET http://localhost:3000/analytics/visitors/visitor_test_123
```

### Step 7: End Session
```bash
curl -X POST http://localhost:3000/analytics/sessions/session_test_123/end \
  -H "Content-Type: application/json" \
  -d "{\"exitPage\":\"/dsa/two-sum\"}"
```

### Step 8: Check Summary
```bash
curl -X GET http://localhost:3000/analytics/summary
```

---

## 📊 Expected Responses

### ✅ Successful Visitor Tracking
```json
{
  "_id": "6730a1b2c3d4e5f6a7b8c9d0",
  "visitorId": "visitor_test_123",
  "firstVisit": "2025-10-16T10:30:00.000Z",
  "lastVisit": "2025-10-16T10:30:00.000Z",
  "totalSessions": 1,
  "totalPageViews": 3,
  "device": "desktop",
  "country": "US",
  "isAdmin": false
}
```

### ✅ Successful Session Start
```json
{
  "_id": "6730a1b2c3d4e5f6a7b8c9d1",
  "sessionId": "session_test_123",
  "visitorId": "visitor_test_123",
  "startTime": "2025-10-16T10:30:00.000Z",
  "landingPage": "/home",
  "pageCount": 0,
  "isActive": true
}
```

### ✅ Successful Page View
```json
{
  "_id": "6730a1b2c3d4e5f6a7b8c9d2",
  "sessionId": "session_test_123",
  "visitorId": "visitor_test_123",
  "path": "/dsa/two-sum",
  "title": "Two Sum",
  "timestamp": "2025-10-16T10:35:00.000Z",
  "timeOnPage": 120,
  "scrollDepth": 95
}
```

### ✅ Successful Heartbeat
```json
{
  "success": true,
  "message": "Heartbeat received",
  "sessionId": "session_test_123",
  "isActive": true
}
```

### ✅ Session Details
```json
{
  "session": {
    "_id": "6730a1b2c3d4e5f6a7b8c9d1",
    "sessionId": "session_test_123",
    "visitorId": "visitor_test_123",
    "startTime": "2025-10-16T10:30:00.000Z",
    "pageCount": 3,
    "landingPage": "/home",
    "exitPage": "/dsa/two-sum",
    "isActive": true
  },
  "pageViews": [
    {
      "path": "/home",
      "timestamp": "2025-10-16T10:30:00.000Z"
    },
    {
      "path": "/dsa",
      "timestamp": "2025-10-16T10:32:00.000Z",
      "timeOnPage": 45
    },
    {
      "path": "/dsa/two-sum",
      "timestamp": "2025-10-16T10:35:00.000Z",
      "timeOnPage": 120,
      "scrollDepth": 95
    }
  ]
}
```

### ✅ Analytics Summary
```json
{
  "totalVisitors": 150,
  "totalSessions": 523,
  "totalPageViews": 2891,
  "activeSessions": 12,
  "popularPages": [
    { "_id": "/dsa", "count": 450 },
    { "_id": "/", "count": 523 },
    { "_id": "/about", "count": 120 }
  ]
}
```

---

## 🔥 PowerShell Version (Windows)

```powershell
# Track Visitor
Invoke-RestMethod -Uri "http://localhost:3000/analytics/visitors" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"visitorId":"visitor_test_123","device":"desktop"}'

# Start Session
Invoke-RestMethod -Uri "http://localhost:3000/analytics/sessions/start" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"sessionId":"session_test_123","visitorId":"visitor_test_123","landingPage":"/"}'

# Track Page View
Invoke-RestMethod -Uri "http://localhost:3000/analytics/pageviews" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"sessionId":"session_test_123","visitorId":"visitor_test_123","path":"/dsa"}'

# Heartbeat
Invoke-RestMethod -Uri "http://localhost:3000/analytics/heartbeat" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"sessionId":"session_test_123","visitorId":"visitor_test_123"}'

# Get Summary
Invoke-RestMethod -Uri "http://localhost:3000/analytics/summary" -Method Get
```

---

## 🐛 Error Responses

### ❌ Missing Required Fields
```json
{
  "statusCode": 400,
  "message": [
    "visitorId should not be empty",
    "visitorId must be a string"
  ],
  "error": "Bad Request"
}
```

### ❌ Session Not Found
```json
{
  "statusCode": 404,
  "message": "Session not found",
  "error": "Not Found"
}
```

### ❌ Duplicate Session (Now Handled!)
**Before Fix:**
```
E11000 duplicate key error collection: sessions index: sessionId_1
```

**After Fix:**
Session is updated instead of throwing error ✅

---

## 💡 Tips

1. **Generate Unique IDs:**
   ```javascript
   const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   ```

2. **Test WebSocket:**
   Use Socket.IO client or Postman WebSocket feature

3. **Monitor in Real-time:**
   Keep summary endpoint open in browser and refresh to see updates

4. **Clean Test Data:**
   ```bash
   # Connect to MongoDB
   mongo ai-interview
   
   # Clear collections
   db.visitors.deleteMany({})
   db.sessions.deleteMany({})
   db.pageviews.deleteMany({})
   ```

---

**All 12 endpoints ready to test!** 🚀

Last Updated: October 16, 2025
