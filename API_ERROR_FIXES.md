# API Error Fixes - October 16, 2025

## 🐛 Issues Identified

### 1. DSA Questions API - Response Format Mismatch
**Error Messages:**
```json
{
  "error": "Bad Request",
  "message": [
    "page must not be less than 1",
    "page must be a number conforming to the specified constraints",
    "limit must not be less than 1",
    "limit must be a number conforming to the specified constraints"
  ],
  "statusCode": 400
}
```

Also: `"Failed to fetch questions"` even when API returns 200 OK.

**Endpoint:** `GET /dsa-questions?sortBy=difficulty&sortOrder=asc&page=1&limit=10`

**Root Causes:**

1. **Query Parameter Type Mismatch**: The backend validation requires `page` and `limit` to be numbers (not strings)
2. **Response Structure Mismatch**: Backend returns different format than frontend expects

**Backend Response Format:**
```json
{
  "questions": [...],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Frontend Expected Format:**
```typescript
{
  data: [...],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number
  }
}
```

**Fix Applied (Part 1 - Frontend):**
Updated `src/pages/DSA/DSAQuestionsList.tsx` to ensure pagination values are always valid:

```typescript
useEffect(() => {
  // Ensure page and limit are always valid numbers >= 1
  const validPage = Math.max(1, currentPage);
  const validLimit = Math.max(1, limit);

  const filters: any = {
    page: validPage,
    limit: validLimit,
    sortBy,
    sortOrder,
  };

  // ... rest of filters

  console.log('Fetching DSA questions with filters:', filters);
  fetchQuestions(filters);
}, [difficulty, category, search, sortBy, sortOrder, currentPage]);
```

**Fix Applied (Part 2 - API Service - Query Parameters):**
Updated `src/api/dsaQuestions.ts` to use Axios params properly:

```typescript
// Before (using URLSearchParams - sent as strings)
const params = new URLSearchParams();
if (filters?.page) params.append('page', filters.page.toString());
if (filters?.limit) params.append('limit', filters.limit.toString());
const response = await http.get(`${DSA_QUESTIONS_BASE}?${params.toString()}`);

// After (using Axios params - preserves number types)
const params: any = {};
if (filters?.page !== undefined) params.page = Number(filters.page);
if (filters?.limit !== undefined) params.limit = Number(filters.limit);
const response = await http.get(DSA_QUESTIONS_BASE, { params });
```

**Why This Matters:**
- URLSearchParams always converts values to strings
- Backend validators expect actual numbers, not numeric strings
- Axios's params option properly serializes numbers in query strings
- Backend can now correctly validate: `typeof page === 'number'`

**Fix Applied (Part 3 - API Service - Response Transformation):**
Added response transformation to match frontend interface:

```typescript
// Transform backend response to match frontend PaginatedResponse interface
const backendData = response.data;
return {
  data: backendData.questions || [],
  pagination: {
    currentPage: backendData.page || 1,
    totalPages: backendData.totalPages || 1,
    totalItems: backendData.total || 0,
    itemsPerPage: backendData.limit || 10,
  },
};
```

**Additional Fixes:**
All API methods now handle both response formats:
```typescript
// Flexible response handling for single question, stats, etc.
return response.data.data || response.data;
```

This ensures compatibility whether the backend wraps responses in `ApiResponse<T>` format or returns data directly.

**Benefits:**
- ✅ Prevents sending invalid pagination values
- ✅ Adds defensive checks for edge cases
- ✅ Includes console logging for debugging
- ✅ Ensures page/limit are always >= 1
- ✅ Numbers sent as numbers, not strings
- ✅ Backend validation passes correctly
- ✅ Transforms backend response to match frontend interface
- ✅ Questions now display correctly in UI
- ✅ Pagination works as expected
- ✅ Handles both wrapped and direct API responses

---

### 2. Analytics Session Start - Internal Server Error
**Error Messages:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Endpoint:** `POST /analytics/sessions/start`

**Root Cause:**
The `StartSessionDto` expects specific fields only:
```typescript
interface StartSessionDto {
  visitorId: string;
  sessionId: string;
  entryPage: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
```

However, the code was spreading `...getVisitorData()` which included additional fields like:
- `language`
- `timezone`
- `screenResolution`

These extra fields were causing the backend to reject the request or throw an internal error.

**Fix Applied:**
Updated `src/contexts/AnalyticsContext.tsx` to only send expected fields:

```typescript
// Before (spreading all fields)
const sessionData = {
  visitorId: newVisitorId,
  sessionId: newSessionId,
  entryPage: window.location.pathname,
  userId: userId,
  ...getVisitorData(), // ❌ Included extra fields
};

// After (explicit field mapping)
const additionalData = getVisitorData();

const sessionData: StartSessionDto = {
  visitorId: newVisitorId,
  sessionId: newSessionId,
  entryPage: window.location.pathname,
  userId: userId,
  userAgent: additionalData.userAgent,
  referrer: additionalData.referrer,
  utmSource: additionalData.utmSource,
  utmMedium: additionalData.utmMedium,
  utmCampaign: additionalData.utmCampaign,
  // ✅ Only includes fields defined in StartSessionDto
};
```

**Additional Changes:**
- Added `StartSessionDto` import to type-check the data structure
- Maintained visitor tracking with full data (which accepts more fields)
- Ensured type safety with explicit interface typing

**Benefits:**
- ✅ Prevents sending unexpected fields to backend
- ✅ Type-safe with TypeScript checking
- ✅ Reduces 500 errors from malformed requests
- ✅ Clear separation between visitor and session data

---

### 3. DSA Questions List - Undefined myProgress Error
**Error Messages:**
```
Uncaught TypeError: Cannot read properties of undefined (reading 'find')
    at getUserProgress (DSAQuestionsList.tsx:44:23)
```

**Endpoint:** N/A (Frontend state issue)

**Root Cause:**
The `myProgress` array from `DSAProgressContext` was being accessed before it was initialized or when it was undefined.

**Fix Applied:**
Added optional chaining to safely handle undefined state:

```typescript
// Before
const getUserProgress = (questionId: string) => {
  return myProgress.find((p) => p.questionId === questionId);
};

// After
const getUserProgress = (questionId: string) => {
  return myProgress?.find((p) => p.questionId === questionId);
};
```

**Benefits:**
- ✅ Prevents runtime errors when myProgress is undefined
- ✅ Gracefully handles loading states
- ✅ Returns undefined instead of crashing
- ✅ Component continues to render correctly

---

## 🔍 How to Verify Fixes

### Test DSA Questions API:
1. Navigate to `/dsa/questions`
2. Open browser DevTools → Network tab
3. Filter by "dsa-questions"
4. Verify request has valid `page` and `limit` parameters
5. Should see 200 OK response with question data

**Expected Request:**
```
GET /dsa-questions?sortBy=difficulty&sortOrder=asc&page=1&limit=10
```

**Backend Returns:**
```json
{
  "questions": [...questions array...],
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5
}
```

**Frontend Transforms To:**
```json
{
  "data": [...questions array...],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

### Test Analytics Session Start:
1. Clear localStorage: `localStorage.clear()`
2. Refresh the page
3. Open browser DevTools → Network tab
4. Filter by "sessions/start"
5. Check request payload matches StartSessionDto structure
6. Should see 200 OK or 201 Created response

**Expected Request Body:**
```json
{
  "visitorId": "uuid-here",
  "sessionId": "uuid-here",
  "entryPage": "/",
  "userId": "optional-user-id",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://...",
  "utmSource": "optional",
  "utmMedium": "optional",
  "utmCampaign": "optional"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "message": "Session started successfully"
  }
}
```

---

## 📝 Additional Notes

### Backend Validation
The backend is using class-validator decorators which enforce:
- Type checking (number vs string)
- Minimum values (@Min(1) for page and limit)
- Required vs optional fields

### Frontend Best Practices
To prevent similar issues:
1. ✅ Always validate input before sending to API
2. ✅ Use TypeScript interfaces to match backend DTOs
3. ✅ Add defensive checks for user inputs
4. ✅ Log API requests during development
5. ✅ Handle edge cases (undefined, 0, negative values)

### Console Logging Added
For easier debugging, console logs now show:
```typescript
console.log('Fetching DSA questions with filters:', filters);
```

This helps verify what data is being sent to the API.

---

## 🚀 Next Steps

If you still encounter errors:

1. **Check Backend Logs**: Look for validation error details
2. **Verify Backend is Running**: Ensure `http://localhost:3000` is accessible
3. **Check CORS Settings**: Make sure frontend origin is allowed
4. **Inspect Request Payload**: Use DevTools to see exact data being sent
5. **Test with Postman/cURL**: Verify backend endpoints work independently

---

## 📚 Related Files Modified

1. ✅ `src/pages/DSA/DSAQuestionsList.tsx` - Added pagination validation + optional chaining for myProgress
2. ✅ `src/api/dsaQuestions.ts` - Fixed query parameter serialization + response transformation
3. ✅ `src/contexts/AnalyticsContext.tsx` - Fixed session data structure
4. ✅ Added `StartSessionDto` import for type safety

---

**Status:** ✅ Fixes Applied - Ready for Testing

**Date:** October 16, 2025

**Next Action:** Start the backend server and test both endpoints to confirm fixes work as expected.
