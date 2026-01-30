# Resume API Changes Documentation

## Overview
This document outlines the changes made to the Resume API to support JD file uploads, comprehensive AI evaluation, and resume deletion functionality.

## Changes Summary

### 1. Enhanced CV Evaluation with JD File Support

#### Modified Files
- `src/resume/ai-cv-api.service.ts`
- `src/resume/resume.service.ts`

#### Changes Made

**ai-cv-api.service.ts - `uploadAndEvaluateCv` method:**
- Added support for `jd_file` parameter alongside existing `jd_text`
- Method signature updated:
  ```typescript
  async uploadAndEvaluateCv(
    filePath: string, 
    originalName: string, 
    jdText?: string,
    jdFilePath?: string,    // NEW
    jdFileName?: string     // NEW
  ): Promise<any>
  ```

- FormData now includes:
  - `file`: Resume PDF
  - `jd_text`: Job description text (always sent, empty string if not provided)
  - `jd_file`: Job description PDF file (sent if provided)

**resume.service.ts - `uploadResume` method:**
- Updated to pass JD file to AI evaluation service:
  ```typescript
  stats = await this.aiCvApiService.uploadAndEvaluateCv(
    file.path,
    file.originalname,
    jdText,
    jdFile?.path,        // NEW
    jdFile?.originalname, // NEW
  );
  ```

### 2. DELETE Resume Endpoint

#### New Endpoint
```
DELETE /resume/:id
DELETE /v1/resume/:id
```

#### Modified Files
- `src/resume/resume.controller.ts` - Added DELETE endpoint
- `src/resume/resume.service.ts` - Added `deleteResume` method

#### Implementation Details

**Controller Method:**
```typescript
@UseGuards(JwtAuthGuard)
@Delete(':id')
async deleteResume(@Param('id') id: string, @Req() req) {
  const userId = req.user.sub;
  const result = await this.resumeService.deleteResume(id, userId);
  return result;
}
```

**Service Method:**
```typescript
async deleteResume(resumeId: string, userId: string) {
  // 1. Find resume
  // 2. Verify ownership
  // 3. Delete file from filesystem
  // 4. Delete from database
  // 5. Return success response
}
```

#### Features
- ✅ Deletes resume from database
- ✅ Removes physical file from filesystem
- ✅ Deletes all associated stats and improvement data
- ✅ Validates user ownership before deletion
- ✅ Returns appropriate error if resume not found or unauthorized

## API Request/Response Examples

### Upload Resume with JD (POST /resume/upload)

#### Request Format
```bash
curl -X 'POST' \
  'http://localhost:3000/resume/upload' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@KomalGoel.pdf' \
  -F 'files=@Dine3D_Job_Description.pdf' \
  -F 'jd_text='
```

Or with jd_text instead of file:
```bash
curl -X 'POST' \
  'http://localhost:3000/resume/upload' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@KomalGoel.pdf' \
  -F 'jd_text=Job description text here...'
```

#### Response Format
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "507f1f77bcf86cd799439011",
    "filename": "KomalGoel.pdf",
    "url": "http://localhost:3000/uploads/users/user123/1706659200000-KomalGoel.pdf",
    "analytics": {
      "cv_quality": {
        "overall_score": 82,
        "subscores": [
          {
            "dimension": "ats_structure",
            "score": 8,
            "max_score": 10,
            "evidence": [
              "Contact details are clear, sections are well-defined, bullets are easily parseable, dates are consistent."
            ]
          },
          {
            "dimension": "writing_clarity",
            "score": 12,
            "max_score": 15,
            "evidence": [
              "Concise, uses active voice (e.g., \"Built\", \"Developed\")",
              "Parallel bullet structure"
            ]
          },
          {
            "dimension": "quantified_impact",
            "score": 16,
            "max_score": 20,
            "evidence": [
              "Built high-accuracy predictive models for cyclone forecasting (94%) and methane emission estimation (97%)",
              "Enhanced forecasting reliability by 40%"
            ]
          },
          {
            "dimension": "technical_depth",
            "score": 12,
            "max_score": 15,
            "evidence": [
              "Mentions specific, non-generic tools/frameworks/architectures (e.g., PyTorch, Google Colab)",
              "Shows understanding of complex systems (e.g., machine learning, natural language processing)"
            ]
          },
          {
            "dimension": "projects_portfolio",
            "score": 8,
            "max_score": 10,
            "evidence": [
              "Includes links to a portfolio (github.com/KomalGoel18)",
              "Describes personal/open-source projects with outcomes"
            ]
          },
          {
            "dimension": "leadership_skills",
            "score": 6,
            "max_score": 10,
            "evidence": [
              "Provides evidence of leading teams (e.g., Hare Ka Sahara Thapar Society)",
              "Mentoring others (e.g., Janmashtami event)"
            ]
          },
          {
            "dimension": "career_progression",
            "score": 8,
            "max_score": 10,
            "evidence": [
              "Shows increasing responsibility over time",
              "Timeline is clear and logical"
            ]
          },
          {
            "dimension": "consistency",
            "score": 8,
            "max_score": 10,
            "evidence": [
              "Formatting, tone, and verb tenses are consistent throughout the document",
              "No large, unexplained career gaps"
            ]
          }
        ]
      },
      "jd_match": {
        "overall_score": 72,
        "subscores": [
          {
            "dimension": "hard_skills",
            "score": 28,
            "max_score": 35,
            "evidence": [
              "Strong knowledge of JavaScript / TypeScript",
              "Experience with React or similar frontend frameworks",
              "Experience with Node.js / NestJS backend development"
            ]
          },
          {
            "dimension": "responsibilities",
            "score": 10,
            "max_score": 15,
            "evidence": [
              "Overlap between the candidate's experience (verbs and outcomes) and the key responsibilities listed in the JD (e.g., \"Develop and maintain web applications and dashboards\")"
            ]
          },
          {
            "dimension": "domain_relevance",
            "score": 6,
            "max_score": 10,
            "evidence": [
              "Match of the candidate's industry experience (e.g., FinTech, SaaS, AI) with the company's domain (e.g., hospitality industry)"
            ]
          },
          {
            "dimension": "seniority",
            "score": 6,
            "max_score": 10,
            "evidence": [
              "Candidate's years of relevant experience (2+ years) vs. JD requirements (e.g., \"5+ years\")"
            ]
          },
          {
            "dimension": "nice_to_haves",
            "score": 2,
            "max_score": 5,
            "evidence": [
              "Coverage of optional skills or \"bonus points\" mentioned in the JD (e.g., experience with cloud platforms and VPS deployments)"
            ]
          },
          {
            "dimension": "education_certs",
            "score": 0,
            "max_score": 5,
            "evidence": [
              "No evidence found."
            ]
          },
          {
            "dimension": "recent_achievements",
            "score": 6,
            "max_score": 10,
            "evidence": [
              "Candidate's accomplishments in the last 1-2 roles directly align with the core needs of the job (e.g., \"Built high-accuracy predictive models for cyclone forecasting\")"
            ]
          },
          {
            "dimension": "constraints",
            "score": 8,
            "max_score": 10,
            "evidence": [
              "Match on practical constraints like location (India), work authorization (no mention of sponsorship), or travel (no mention of travel requirements)"
            ]
          }
        ]
      },
      "key_takeaways": {
        "red_flags": [
          "No direct experience with cloud platforms and VPS deployments",
          "No direct experience with Electron or mobile development"
        ],
        "green_flags": [
          "Strong knowledge of JavaScript / TypeScript and experience with React or similar frontend frameworks",
          "Experience with Node.js / NestJS backend development and knowledge of REST APIs and databases",
          "Built high-accuracy predictive models for cyclone forecasting and methane emission estimation"
        ]
      },
      "overall_score": 82
    },
    "enhancement": {
      "tailored_resume": {
        "content": "Enhanced resume content...",
        "improvements": ["Improvement 1", "Improvement 2"]
      },
      "top_1_percent_gap": {
        "missing_skills": ["Skill 1", "Skill 2"],
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      },
      "cover_letter": {
        "content": "Generated cover letter content..."
      }
    }
  }
}
```

### AI Service Integration (Backend to AI Service)

The backend now sends the following format to the AI service:

```bash
curl -X 'POST' \
  'http://localhost:8000/v1/upload/cv_evaluate' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@KomalGoel.pdf;type=application/pdf' \
  -F 'jd_text=' \
  -F 'jd_file=@Dine3D_Job_Description.pdf;type=application/pdf'
```

#### AI Service Expected Response
```json
{
  "cv_quality": {
    "overall_score": 82,
    "subscores": [...]
  },
  "jd_match": {
    "overall_score": 72,
    "subscores": [...]
  },
  "key_takeaways": {
    "red_flags": [...],
    "green_flags": [...]
  }
}
```

### Delete Resume (DELETE /resume/:id)

#### Request Format
```bash
curl -X 'DELETE' \
  'http://localhost:3000/resume/507f1f77bcf86cd799439011' \
  -H 'Authorization: Bearer <JWT_TOKEN>'
```

#### Response Format - Success
```json
{
  "message": "Resume deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

#### Response Format - Not Found
```json
{
  "statusCode": 404,
  "message": "Resume not found"
}
```

#### Response Format - Unauthorized
```json
{
  "statusCode": 400,
  "message": "Unauthorized to delete this resume"
}
```

## Data Flow

### Upload Flow
1. **Frontend** → Sends resume file + optional JD (file or text)
2. **Backend (resume.controller.ts)** → Receives files and jd_text
3. **Backend (resume.service.ts)** → Processes and calls AI services
4. **Backend → AI Service** → Sends `file`, `jd_text`, and `jd_file` to `/v1/upload/cv_evaluate`
5. **AI Service** → Returns evaluation with cv_quality, jd_match, key_takeaways
6. **Backend → AI Service** → Sends to `/v1/upload/cv_improvement` for enhancement
7. **AI Service** → Returns tailored_resume, top_1_percent_gap, cover_letter
8. **Backend** → Saves to database with all analytics and enhancement data
9. **Backend → Frontend** → Returns complete response with separated analytics and enhancement

### Delete Flow
1. **Frontend** → Sends DELETE request with resume ID
2. **Backend** → Validates JWT token and user ownership
3. **Backend** → Deletes file from filesystem
4. **Backend** → Removes record from database
5. **Backend → Frontend** → Returns success confirmation

## Database Schema

### Resume Document
```typescript
{
  filename: string;              // Original filename
  path: string;                  // File path on server
  url: string;                   // Public URL to access file
  stats: {                       // From cv_evaluate API
    cv_quality: {...},
    jd_match: {...},             // Only present if JD was provided
    key_takeaways: {...}
  };
  improvement_resume: {          // From cv_improvement API
    tailored_resume: {...},
    top_1_percent_gap: {...},
    cover_letter: {...}
  };
  user: ObjectId;                // Reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

## Benefits of Changes

1. **JD File Support**: Users can now upload JD as a PDF file instead of pasting text
2. **Better AI Analysis**: AI service receives both text and file formats for better analysis
3. **Complete Evaluation**: Backend receives comprehensive evaluation including JD match scores
4. **JD Match Scoring**: When JD is provided, detailed matching analysis is returned and stored
5. **Data Management**: Users can delete resumes and all associated data
6. **Separated Concerns**: Analytics (cv_quality, jd_match, key_takeaways) and enhancement data are clearly separated in the response
7. **Security**: User ownership validation prevents unauthorized deletions

## Important Notes

- **jd_match field**: Only present in the response when a JD (text or file) was provided during upload or improvement
- **Conditional data**: The AI service only returns `jd_match` when it has JD context to compare against
- **Storage**: All analytics data (cv_quality, jd_match, key_takeaways) is stored in the `stats` object in MongoDB
- **Enhancement**: AI enhancement data is stored separately in the `improvement_resume` object

## Testing

### Test Upload with JD File
```bash
curl -X POST http://localhost:3000/resume/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@path/to/resume.pdf" \
  -F "files=@path/to/jd.pdf" \
  -F "jd_text="
```

### Test Upload with JD Text
```bash
curl -X POST http://localhost:3000/resume/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@path/to/resume.pdf" \
  -F "jd_text=Your job description here..."
```

### Test Delete
```bash
curl -X DELETE http://localhost:3000/resume/RESUME_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/v1/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/v1/upload/cv_improvement
AI_INTERVIEW_API_BASE_URL=http://localhost:8000
AI_INTERVIEW_API_TIMEOUT=120000
```

## Error Handling

- **AI Service Unavailable**: Resume is saved without analytics/enhancement data
- **File Not Found**: Appropriate error message returned
- **Unauthorized Delete**: 400 Bad Request with message
- **Resume Not Found**: 404 Not Found
- **Invalid File Type**: Validation error before processing

## Future Enhancements

- [ ] Bulk delete resumes
- [ ] Soft delete with trash/restore functionality
- [ ] Resume versioning
- [ ] Compare multiple resumes
- [ ] Export analytics as PDF/CSV
