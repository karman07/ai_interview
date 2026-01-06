# Resume and Job Description API Documentation

## Overview
Resumes and Job Descriptions are now handled as separate entities with their own collections, controllers, and upload directories.

## File Structure
```
uploads/
├── users/{userId}/           # Resume files
│   └── timestamp-resume.pdf
└── job-descriptions/{userId}/ # Job Description files
    ├── timestamp-jd.pdf
    └── timestamp-job-description.txt
```

## Resume Upload API

### Upload Resume with JD
**Endpoint**: `POST /resume/upload`

**Authentication**: Required (JWT Bearer Token)

**Request**: Multipart form data
- `files[0]`: Resume file (required)
- `files[1]`: JD file (optional)
- `jd_text`: JD text content (optional)

**Behavior**:
1. Resume is saved to `uploads/users/{userId}/`
2. If JD is provided (text or file), it's automatically saved to separate JD collection
3. JD files stored in `uploads/job-descriptions/{userId}/`

### Get User Resumes
**Endpoint**: `GET /resume/files`

**Response**:
```json
{
  "resumes": [
    {
      "id": "resume_id",
      "name": "resume.pdf",
      "url": "http://localhost:3000/uploads/users/userId/timestamp-resume.pdf"
    }
  ]
}
```

## Job Description API

### Upload JD Separately
**Endpoint**: `POST /job-description/upload`

**Authentication**: Required (JWT Bearer Token)

**Request**: Multipart form data
- `file`: JD file (optional)
- `jd_text`: JD text content (optional)

### Get User Job Descriptions
**Endpoint**: `GET /job-description/list`

**Response**:
```json
{
  "jobDescriptions": [
    {
      "id": "jd_id",
      "name": "job-description.txt",
      "url": "http://localhost:3000/uploads/job-descriptions/userId/timestamp-job-description.txt"
    }
  ]
}
```

## Key Changes

### ✅ What's New:
- **Separate Collections**: Resumes and JDs have independent MongoDB collections
- **Separate Controllers**: `/resume/*` and `/job-description/*` endpoints
- **Organized Uploads**: Different folders for resumes and JDs
- **Auto JD Save**: When uploading resume with JD, JD is automatically saved to separate collection

### ✅ Benefits:
- **Independent Management**: JDs can be uploaded/managed separately from resumes
- **Better Organization**: Clear separation of file types
- **Reusable JDs**: Same JD can be used with multiple resumes
- **Clean APIs**: Dedicated endpoints for each file type

## Frontend Integration

### Upload Resume with JD:
```javascript
const formData = new FormData();
formData.append('files', resumeFile);
formData.append('jd_text', jobDescriptionText);

await fetch('/resume/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Get Files for Selection Boxes:
```javascript
// Get resumes
const resumeResponse = await fetch('/resume/files', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { resumes } = await resumeResponse.json();

// Get job descriptions
const jdResponse = await fetch('/job-description/list', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { jobDescriptions } = await jdResponse.json();
```