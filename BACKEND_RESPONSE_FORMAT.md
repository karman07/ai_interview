# Backend Response Format Documentation

## 🔄 Response Format Differences

The backend API returns a **different structure** than initially expected. The frontend code has been updated to handle this.

---

## 📋 DSA Questions List Endpoint

### Endpoint
```
GET /dsa-questions
```

### Query Parameters
```typescript
{
  difficulty?: 'Easy' | 'Medium' | 'Hard',
  category?: string | string[],
  tags?: string | string[],
  search?: string,
  sortBy?: 'difficulty' | 'likes' | 'acceptanceRate',
  sortOrder?: 'asc' | 'desc',
  page?: number,        // Must be >= 1
  limit?: number,       // Must be >= 1
  includeSolutions?: boolean
}
```

### Backend Response Structure
```json
{
  "questions": [
    {
      "_id": "68ee0244dd2fa398ac972b88",
      "questionId": "two-sum",
      "title": "Two Sum",
      "description": "...",
      "difficulty": "Easy",
      "categories": ["Array", "Hash Table"],
      "tags": ["array", "hash-table"],
      "testCases": [...],
      "functionSignatures": [...],
      "constraints": {...},
      "hints": [...],
      "examples": [...],
      "createdBy": "...",
      "isActive": true,
      "acceptanceRate": 0,
      "totalSubmissions": 0,
      "successfulSubmissions": 0,
      "likes": 0,
      "dislikes": 0,
      "relatedQuestions": [],
      "createdAt": "2025-10-14T07:56:52.659Z",
      "updatedAt": "2025-10-14T07:56:52.659Z",
      "__v": 0
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Frontend Transformation
The API service transforms this to:
```typescript
{
  data: DSAQuestion[],  // questions array renamed to data
  pagination: {
    currentPage: number,      // from "page"
    totalPages: number,       // from "totalPages"
    totalItems: number,       // from "total"
    itemsPerPage: number      // from "limit"
  }
}
```

---

## 📋 Single Question Endpoint

### Endpoint
```
GET /dsa-questions/:questionId
```

### Backend Response
Returns the question object **directly** (not wrapped):
```json
{
  "_id": "68ee0244dd2fa398ac972b88",
  "questionId": "two-sum",
  "title": "Two Sum",
  // ... rest of question fields
}
```

**Not wrapped in:**
```json
{
  "success": true,
  "data": { /* question here */ }
}
```

### Frontend Handling
```typescript
// Handles both formats
return response.data.data || response.data;
```

---

## 📊 Statistics Endpoint

### Endpoint
```
GET /dsa-questions/statistics
```

### Expected Response
May return either:
- Direct: `{ totalQuestions: 100, easyCount: 40, ... }`
- Wrapped: `{ success: true, data: { totalQuestions: 100, ... } }`

### Frontend Handling
```typescript
return response.data.data || response.data;
```

---

## 🎲 Random Question Endpoint

### Endpoint
```
GET /dsa-questions/random?difficulty=Easy
```

### Response
Returns a single question object (see Single Question format above)

---

## ✅ CRUD Operations

### Create Question
```
POST /dsa-questions
```

### Update Question
```
PATCH /dsa-questions/:questionId
```

### Delete Question (Soft)
```
DELETE /dsa-questions/:questionId
```

### Delete Question (Hard)
```
DELETE /dsa-questions/:questionId/hard
```

All return the modified question or a message:
```json
{ "message": "Question deleted successfully" }
```

---

## 🚀 Key Takeaways

1. **List endpoints** return `questions` array, not `data` array
2. **Pagination** fields have different names
3. **Single resources** returned directly without wrapper
4. **Query parameters** must be numbers (not strings)
5. **Frontend now handles both formats** for flexibility

---

## 🔧 Implementation Details

### Query Parameter Handling
```typescript
// ✅ Correct - Uses Axios params with numbers
const params: any = {};
if (filters?.page !== undefined) params.page = Number(filters.page);
if (filters?.limit !== undefined) params.limit = Number(filters.limit);
const response = await http.get(DSA_QUESTIONS_BASE, { params });

// ❌ Wrong - URLSearchParams converts to strings
const params = new URLSearchParams();
params.append('page', '1');  // String "1", not number 1
```

### Response Transformation
```typescript
// For paginated responses
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

// For single resources
return response.data.data || response.data;
```

---

## ✅ Testing Checklist

- [x] Questions list loads without errors
- [x] Pagination displays correctly
- [x] Page numbers match backend response
- [x] Filters work (difficulty, category, search)
- [x] Sorting works (sortBy, sortOrder)
- [x] Single question loads correctly
- [x] Statistics display properly
- [x] Random question works

---

**Status:** ✅ All API calls updated to handle actual backend response format

**Last Updated:** October 16, 2025
