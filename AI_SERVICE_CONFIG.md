# Environment Configuration for AI Service

## Required Environment Variables

Add these to your `.env` file:

```env
# AI Service Configuration
AI_INTERVIEW_API_BASE_URL=http://localhost:8000
AI_INTERVIEW_API_TIMEOUT=120000

# CV Evaluation Endpoints (matching OpenAPI spec)
AI_CV_SCORE_ENDPOINT=/v1/cv/score
AI_CV_FIT_INDEX_ENDPOINT=/v1/cv/fit-index
AI_CV_IMPROVEMENT_ENDPOINT=/v1/cv/improvement
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/v1/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/v1/upload/cv_improvement

# App Configuration
APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Fixed Issues

1. **Base URL**: Changed from `http://localhost:8080` to `http://localhost:8000`
2. **Endpoints**: Updated to use `/v1/` prefix matching OpenAPI specification
3. **Double Path Issue**: Fixed endpoint construction to prevent `/upload/upload/` duplication

## Endpoint Mapping

| Function | Endpoint | Description |
|----------|----------|-------------|
| CV Score | `/v1/cv/score` | Score CV quality only |
| CV Fit Index | `/v1/cv/fit-index` | CV + JD matching analysis |
| CV Improvement | `/v1/cv/improvement` | Generate improvement suggestions |
| Upload & Evaluate | `/v1/upload/cv_evaluate` | Upload CV file and evaluate |
| Upload & Improve | `/v1/upload/cv_improvement` | Upload CV + JD files and improve |

## Testing

Test the AI service endpoints:

```bash
# Health check
curl http://localhost:8000/healthz

# CV evaluation
curl -X POST http://localhost:8000/v1/upload/cv_evaluate \
  -F "file=@resume.pdf" \
  -F "jd_text=Job description text"

# CV improvement
curl -X POST http://localhost:8000/v1/upload/cv_improvement \
  -F "file=@resume.pdf" \
  -F "jd_text=Job description text"
```