# Backend API Contract & Data Models

> **Freeze Date:** 2026-02-07
> **Base URL:** `http://localhost:8000`
> **Version:** 1.0.0

This document serves as the single source of truth for the backend API contract. All frontend development should strictly adhere to these schemas and endpoints.

---

## 1. Core Data Models (Enums & Types)

### 1.1. Enums
These values must be used in dropdowns/selects.

#### `JobLevel`
- `ENTRY_LEVEL`
- `MID_LEVEL`
- `SENIOR_LEVEL`
- `EXECUTIVE`

#### `EmploymentType`
- `FULL_TIME`
- `PART_TIME`
- `CONTRACTOR`
- `INTERNSHIP`

---

## 2. API Endpoints

### 2.1. Resume Matching
**POST** `/match/resume`

Matches a resume text against available jobs using AI.

#### Request Body (`ResumeMatchRequest`)
```json
{
  "resume_text": "string (min 50 chars, required)",
  "location": "string (optional)",
  "internship_only": false,
  "job_level": "JobLevel (optional)",
  "stipend_min": 0.0
}
```

#### Response (`MatchResultResponse`)
```json
{
  "total_matches": 10,
  "search_time_ms": 123.45,
  "jobs": [
    {
      "job_id": "string (ObjectId)",
      "adzuna_id": "string",
      "title": "string",
      "company": "string",
      "location": "string | null",
      "employment_type": "string | null",
      "salary_min": 100000.0,
      "salary_max": 150000.0,
      "description": "string",
      "redirect_url": "string | null",
      "relevance_score": 0.95,
      "is_internship": false
    }
  ],
  "metadata": {}
}
```

### 2.2. Job Description Matching
**POST** `/match/jd`

Finds jobs similar to a provided job description.

#### Request Body (`JobDescriptionMatchRequest`)
```json
{
  "job_description": "string (min 50 chars, required)",
  "location": "string (optional)",
  "job_type": "EmploymentType (optional)"
}
```

#### Response
Same as **2.1 Resume Matching**.

### 2.3. Job Listing (Search & Filter)
**GET** `/jobs`

Retrieves a paginated list of jobs with optional filters.

#### Query Parameters
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `min_stipend` | float | No | - | Minimum salary |
| `max_stipend` | float | No | - | Maximum salary |
| `remote` | bool | No | - | Filter for remote jobs |
| `internship` | bool | No | - | Filter for internships |
| `location` | string | No | - | Partial location match |
| `skip` | int | No | 0 | Pagination offset |
| `limit` | int | No | 50 | Limit (max 100) |

#### Response (`JobListResponse`)
```json
{
  "total": 100,
  "jobs": [
    {
      // Same Job Object as in 2.1
      "job_id": "...",
      "title": "...",
        // ...
    }
  ]
}
```

### 2.4. Health Check
**GET** `/health`

#### Response (`HealthResponse`)
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T12:00:00",
  "database": "string",
  "cts_connection": "string",
  "version": "1.0.0"
}
```

### 2.5. Admin: Refresh Jobs
**POST** `/admin/refresh-jobs`

Triggers a manual sync from Adzuna.

#### Response (`RefreshJobsResponse`)
```json
{
  "message": "Job refresh initiated successfully",
  "sync_id": 123,
  "status": "in_progress"
}
```

---

## 3. Error Handling

All 400-series errors follow this standard format (FastAPI default):

```json
{
  "detail": [
    {
      "loc": ["body", "resume_text"],
      "msg": "Resume text must be at least 50 characters",
      "type": "value_error"
    }
  ]
}
```

- **400 Bad Request:** Validation errors (e.g., text too short).
- **422 Validation Error:** Data type mismatch.
- **500 Internal Server Error:** Backend failure (e.g., database down).
