# DSA Questions - Pagination Fix

## 🐛 Issue Fixed

**Error:**
```json
{
  "message": [
    "page must not be less than 1",
    "page must be a number conforming to the specified constraints",
    "limit must not be less than 1",
    "limit must be a number conforming to the specified constraints"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Cause:** Query parameters come as strings from URL but DTO expected numbers.

**Solution:** Added `@Type(() => Number)` decorator from `class-transformer` to convert string to number.

---

## ✅ Fixed Code

### Before:
```typescript
@ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
@IsOptional()
@IsNumber()
@Min(1)
page?: number;
```

### After:
```typescript
@ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
@IsOptional()
@Type(() => Number)  // ⭐ Added this to transform string to number
@IsNumber()
@Min(1)
page?: number;
```

---

## 🧪 Test the Fix

### Test URL:
```
http://localhost:3000/dsa-questions?sortBy=difficulty&sortOrder=asc&page=1&limit=10
```

### Expected Success Response:
```json
{
  "data": [
    {
      "questionId": "two-sum",
      "title": "Two Sum",
      "difficulty": "Easy",
      // ... more question data
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 📝 All Query Parameters

### Filter Parameters:
- `difficulty` - Filter by difficulty (Easy, Medium, Hard)
- `categories` - Filter by categories (Array, String, etc.)
- `tags` - Filter by tags (array)
- `search` - Search in title/description

### Pagination:
- `page` - Page number (default: 1) ✅ Fixed
- `limit` - Items per page (default: 20) ✅ Fixed

### Sorting:
- `sortBy` - Sort field (createdAt, difficulty, acceptanceRate, totalSubmissions)
- `sortOrder` - Sort direction (asc, desc)

---

## 🚀 Test Commands

### 1. Basic Pagination
```bash
curl "http://localhost:3000/dsa-questions?page=1&limit=10"
```

### 2. With Difficulty Filter
```bash
curl "http://localhost:3000/dsa-questions?difficulty=Easy&page=1&limit=5"
```

### 3. With Sorting
```bash
curl "http://localhost:3000/dsa-questions?sortBy=difficulty&sortOrder=asc&page=1&limit=10"
```

### 4. With Search
```bash
curl "http://localhost:3000/dsa-questions?search=array&page=1&limit=10"
```

### 5. Combined Filters
```bash
curl "http://localhost:3000/dsa-questions?difficulty=Medium&sortBy=acceptanceRate&sortOrder=desc&page=2&limit=15"
```

---

## 🎯 Why This Works

### Query Parameter Flow:
```
URL: ?page=1&limit=10
    ↓
Express: page="1", limit="10" (strings)
    ↓
@Type(() => Number): Transforms to numbers
    ↓
@IsNumber(): Validates they are numbers
    ↓
@Min(1): Validates they are >= 1
    ↓
Controller: page=1, limit=10 (numbers) ✅
```

### Without @Type():
```
URL: ?page=1
    ↓
Express: page="1" (string)
    ↓
@IsNumber(): ❌ Fails! "1" is not a number
```

### With @Type():
```
URL: ?page=1
    ↓
Express: page="1" (string)
    ↓
@Type(() => Number): "1" → 1
    ↓
@IsNumber(): ✅ Passes! 1 is a number
```

---

## ✅ Validation Now Works

### Valid Requests:
✅ `?page=1&limit=10` - Numbers
✅ `?page=2` - Only page (limit uses default)
✅ `?limit=5` - Only limit (page uses default)
✅ No params - Both use defaults

### Invalid Requests:
❌ `?page=0` - Less than 1
❌ `?limit=-5` - Less than 1
❌ `?page=abc` - Not a number
❌ `?limit=xyz` - Not a number

---

## 📊 Default Values

When parameters are not provided, defaults are used:
- `page` → 1
- `limit` → 20

This is handled in the service layer:
```typescript
async findAll(filterDto: FilterDsaQuestionsDto) {
  const page = filterDto.page || 1;
  const limit = filterDto.limit || 20;
  // ...
}
```

---

## 🔧 Files Modified

1. **src/dsa-questions/dto/filter-dsa-questions.dto.ts**
   - Added `import { Type } from 'class-transformer';`
   - Added `@Type(() => Number)` to `page` field
   - Added `@Type(() => Number)` to `limit` field

---

## 🎉 Result

**Pagination now works perfectly!** 

Your URL with query parameters will work without validation errors:
```
✅ http://localhost:3000/dsa-questions?sortBy=difficulty&sortOrder=asc&page=1&limit=10
```

---

Last Updated: October 16, 2025
Status: ✅ FIXED
