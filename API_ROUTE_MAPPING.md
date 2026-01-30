# API Route Mapping - Backend vs OpenAPI Specification

## Current Backend Routes vs Required OpenAPI Routes

### ✅ MATCHING ROUTES

#### Resume Upload
- **OpenAPI**: `POST /v1/resume/upload`
- **Backend**: `POST /resume/upload` 
- **Status**: ❌ **MISMATCH** - Missing `/v1` prefix

#### CV Evaluation (AI Service Calls)
- **OpenAPI**: `POST /v1/upload/cv_evaluate`
- **Backend**: Uses `AI_CV_EVALUATE_UPLOAD_ENDPOINT` = `/upload/cv_evaluate`
- **Status**: ✅ **MATCHES** (with v1 prefix in base URL)

#### CV Improvement (AI Service Calls)  
- **OpenAPI**: `POST /v1/upload/cv_improvement`
- **Backend**: Uses `AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT` = `/upload/cv_improvement`
- **Status**: ✅ **MATCHES** (with v1 prefix in base URL)

### ❌ MISSING ROUTES IN BACKEND

#### CV Scoring
- **OpenAPI**: `POST /v1/cv/score`
- **Backend**: Not implemented as direct endpoint
- **Action**: Create endpoint or proxy to AI service

#### CV Fit Index
- **OpenAPI**: `POST /v1/cv/fit-index`
- **Backend**: Not implemented as direct endpoint
- **Action**: Create endpoint or proxy to AI service

#### CV Improvement (Direct)
- **OpenAPI**: `POST /v1/cv/improvement`
- **Backend**: Not implemented as direct endpoint
- **Action**: Create endpoint or proxy to AI service

#### Interview Session Management
- **OpenAPI**: `POST /v1/sessions/`
- **Backend**: `POST /enhanced-interview/start`
- **Status**: ❌ **MISMATCH** - Different route structure

#### Interview Answer Submission
- **OpenAPI**: `POST /v1/interview/answer`
- **Backend**: `POST /enhanced-interview/answer`
- **Status**: ❌ **MISMATCH** - Different route structure

### 🔧 REQUIRED CHANGES

#### 1. Add Version Prefix to Resume Routes
```typescript
// Current
@Controller('resume')

// Should be
@Controller('v1/resume')
```

#### 2. Add Missing CV Evaluation Endpoints
```typescript
@Controller('v1/cv')
export class CvController {
  @Post('score')
  async scoreCv(@Body() payload: CvScoreRequest) {
    // Proxy to AI service /v1/cv/score
  }

  @Post('fit-index')
  async calculateFitIndex(@Body() payload: FitIndexRequest) {
    // Proxy to AI service /v1/cv/fit-index
  }

  @Post('improvement')
  async improveCv(@Body() payload: ImprovementRequest) {
    // Proxy to AI service /v1/cv/improvement
  }
}
```

#### 3. Update Interview Routes
```typescript
// Current
@Controller('enhanced-interview')

// Should be
@Controller('v1/interview')
// OR
@Controller('v1/sessions')
```

#### 4. Environment Variables Check
Ensure these are set correctly:
```env
AI_INTERVIEW_API_BASE_URL=http://localhost:8080
AI_CV_SCORE_ENDPOINT=/v1/cv/score
AI_CV_FIT_INDEX_ENDPOINT=/v1/cv/fit-index
AI_CV_IMPROVEMENT_ENDPOINT=/v1/cv/improvement
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/v1/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/v1/upload/cv_improvement
```

### 📋 SAMPLE RESPONSE UPDATES

#### Updated Resume POST Response (with correct route)
```bash
# Correct API call matching OpenAPI spec
curl -X POST http://localhost:3000/v1/resume/upload \
  -H "Authorization: Bearer <jwt_token>" \
  -F "file=@resume.pdf" \
  -F "user_id=user123" \
  -F "jd_text=Job description text..."
```

#### Response Structure (matches OpenAPI)
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "filename": "resume.pdf",
    "url": "http://localhost:3000/uploads/users/user123/resume.pdf",
    "stats": {
      "overall_score": 8.2,
      "sections": {...},
      "strengths": [...],
      "weaknesses": [...],
      "recommendations": [...],
      "ats_compatibility": {...},
      "keyword_analysis": {...}
    },
    "improvement_resume": {
      "fit_score": 85.5,
      "matching_skills": [...],
      "missing_skills": [...],
      "suggestions": [...],
      "rewritten_sections": {...},
      "overall_improvement_score": 92.3,
      "recommendations": [...]
    }
  }
}
```

### 🚀 IMPLEMENTATION PRIORITY

1. **High Priority**: Add `/v1` prefix to existing routes
2. **Medium Priority**: Create missing CV evaluation endpoints
3. **Low Priority**: Standardize interview route structure

### 📝 NOTES

- The OpenAPI spec expects `/v1` prefix for all routes
- Current backend routes work but don't match the specification
- AI service calls are correctly configured to match OpenAPI endpoints
- Frontend should call `/v1/resume/upload` instead of `/resume/upload`