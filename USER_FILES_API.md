# User Files API

## Get User Files for Selection

**Endpoint**: `GET /resume/files`

**Authentication**: Required (JWT Bearer Token)

**Description**: Returns user's uploaded resumes and job descriptions formatted for selection boxes.

## Response

```json
{
  "resumes": [
    {
      "id": "67890abcdef123456789",
      "name": "john_doe_resume.pdf",
      "url": "http://localhost:3000/uploads/users/userId/1766661234567-john_doe_resume.pdf"
    }
  ],
  "jobDescriptions": [
    {
      "id": "67890abcdef123456789_jd",
      "name": "Job Description - john_doe_resume.pdf",
      "url": "http://localhost:3000/uploads/users/userId/1766661234568-job-description.txt"
    }
  ]
}
```

## Usage

Perfect for populating dropdown/selection boxes in frontend:

```javascript
// Fetch user files
const response = await fetch('/resume/files', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { resumes, jobDescriptions } = await response.json();

// Use in select options
resumes.forEach(resume => {
  console.log(`${resume.name} - ${resume.id}`);
});
```

## Features

- ✅ User-specific files only
- ✅ Ready for selection boxes (id, name, url)
- ✅ Separate arrays for resumes and job descriptions
- ✅ Full file URLs for direct access
- ✅ JWT authentication required