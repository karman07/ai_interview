# Backend API Routes - Updated to Match OpenAPI Specification

## ✅ UPDATED ROUTES

### Resume Upload
- **Before**: `POST /resume/upload`
- **After**: `POST /v1/resume/upload` ✅
- **Status**: FIXED

### Interview Routes
- **Before**: `POST /enhanced-interview/start`
- **After**: `POST /v1/interview/start` ✅
- **Before**: `POST /enhanced-interview/answer`  
- **After**: `POST /v1/interview/answer` ✅
- **Status**: FIXED

### ✅ NEW ROUTES ADDED

#### CV Evaluation Endpoints
- **NEW**: `POST /v1/cv/score` ✅
- **NEW**: `POST /v1/cv/fit-index` ✅  
- **NEW**: `POST /v1/cv/improvement` ✅

## 🔧 FIXED ISSUES

### 1. AI Service Endpoint Configuration
```typescript
// Fixed double /upload issue
// Before: http://localhost:8000/upload/upload/cv_improvement
// After:  http://localhost:8000/v1/upload/cv_improvement
```

### 2. Controller Updates
```typescript
// Resume Controller
@Controller('v1/resume')  // Was: @Controller('resume')

// Interview Controller  
@Controller('v1/interview')  // Was: @Controller('enhanced-interview')

// New CV Controller
@Controller('v1/cv')  // NEW
```

### 3. Environment Variables
```env
AI_INTERVIEW_API_BASE_URL=http://localhost:8000
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/v1/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/v1/upload/cv_improvement
```

## 📋 COMPLETE ROUTE MAPPING

### Resume & CV Routes
| OpenAPI Route | Backend Route | Status |
|---------------|---------------|---------|
| `POST /v1/resume/upload` | `POST /v1/resume/upload` | ✅ |
| `POST /v1/cv/score` | `POST /v1/cv/score` | ✅ |
| `POST /v1/cv/fit-index` | `POST /v1/cv/fit-index` | ✅ |
| `POST /v1/cv/improvement` | `POST /v1/cv/improvement` | ✅ |

### Interview Routes
| OpenAPI Route | Backend Route | Status |
|---------------|---------------|---------|
| `POST /v1/interview/start` | `POST /v1/interview/start` | ✅ |
| `POST /v1/interview/answer` | `POST /v1/interview/answer` | ✅ |

### File Upload Routes (AI Service)
| OpenAPI Route | AI Service Call | Status |
|---------------|-----------------|---------|
| `POST /v1/upload/cv_evaluate` | `/v1/upload/cv_evaluate` | ✅ |
| `POST /v1/upload/cv_improvement` | `/v1/upload/cv_improvement` | ✅ |

## 🚀 SAMPLE API CALLS

### Resume Upload (Updated)
```bash
curl -X POST http://localhost:3000/v1/resume/upload \
  -H "Authorization: Bearer <jwt_token>" \
  -F "files=@resume.pdf" \
  -F "jd_text=Job description..."
```

### CV Score
```bash
curl -X POST http://localhost:3000/v1/cv/score \
  -H "Content-Type: application/json" \
  -d '{"cv_text": "Resume content..."}'
```

### CV Fit Index
```bash
curl -X POST http://localhost:3000/v1/cv/fit-index \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Resume content...",
    "jd_text": "Job description..."
  }'
```

### Interview Start (Updated)
```bash
curl -X POST http://localhost:3000/v1/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "session_id": "sess456",
    "role_title": "Software Engineer",
    "company_name": "Tech Corp",
    "industry": "Technology"
  }'
```

### Interview Answer (Updated)
```bash
curl -X POST http://localhost:3000/v1/interview/answer \
  -F "user_id=user123" \
  -F "session_id=sess456" \
  -F "audio_file=@answer.wav"
```

## 📝 NOTES

- All routes now have `/v1` prefix matching OpenAPI spec
- AI service calls fixed to prevent double `/upload` paths
- New CV evaluation endpoints proxy directly to AI service
- Resume upload maintains existing functionality with updated route
- Interview routes updated but maintain all existing features

## 🔄 MIGRATION GUIDE

### Frontend Updates Required
1. Change `/resume/upload` → `/v1/resume/upload`
2. Change `/enhanced-interview/*` → `/v1/interview/*`
3. New endpoints available: `/v1/cv/score`, `/v1/cv/fit-index`, `/v1/cv/improvement`

### Environment Variables
Ensure your `.env` has:
```env
AI_INTERVIEW_API_BASE_URL=http://localhost:8000
```