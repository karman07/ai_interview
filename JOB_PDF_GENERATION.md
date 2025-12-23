# Job PDF Generation and JD Matcher Integration

## Overview
Enhanced job upload functionality to automatically generate PDFs from job descriptions and upload them to the JD matcher service using the `/upload-job-pdf` endpoint.

## Changes Made

### 1. AI Matcher Service Updates (`ai-matcher.service.ts`)

#### Added PDF Generation
- **New Method**: `generateJobPDF()` - Creates PDF from job description text
- **Updated Method**: `uploadJob()` - Now generates PDF and calls `/upload-job-pdf`
- **Dependencies**: Added PDFKit for PDF generation

#### PDF Generation Features
```typescript
private async generateJobPDF(jobText: string, jobTitle?: string, jobId?: string): Promise<string>
```
- Creates formatted PDF with job title and description
- Temporary file storage in `./temp/` directory
- Automatic cleanup after upload
- Unique filename generation using job ID

#### Updated Upload Flow
```typescript
async uploadJob(jobText?: string, jobFilePath?: string, jobTitle?: string, jobId?: string)
```
- **If file exists**: Uses existing PDF file
- **If text provided**: Generates PDF from text
- **Endpoint**: Calls `POST /upload-job-pdf` instead of `/upload-job`
- **Parameters**: Sends `job_id` and `job_file` as form data

### 2. Jobs Service Updates (`jobs.service.ts`)

#### Enhanced Job Creation
```typescript
await this.aiMatcherService.uploadJob(
  createJobDto.description,
  descriptionFileUrl ? `.${descriptionFileUrl}` : undefined,
  createJobDto.title,
  savedJob._id.toString() // ⭐ NEW: Pass job ID
);
```

#### Enhanced Job Updates
```typescript
await this.aiMatcherService.uploadJob(
  updateJobDto.description || job.description,
  descriptionFileUrl ? `.${descriptionFileUrl}` : (job.descriptionFileUrl ? `.${job.descriptionFileUrl}` : undefined),
  updateJobDto.title || job.title,
  jobId // ⭐ NEW: Pass job ID for updates
);
```

## API Integration

### JD Matcher Endpoint
**Endpoint:** `POST http://localhost:8000/upload-job-pdf`

#### Request Format
```bash
curl -X POST "http://localhost:8000/upload-job-pdf" \
  -F "job_id=64a1b2c3d4e5f6789012345" \
  -F "job_file=@generated_job_description.pdf"
```

#### Form Data Parameters
- `job_id`: MongoDB ObjectId of the job
- `job_file`: PDF file (generated or uploaded)

## PDF Generation Specifications

### PDF Content Structure
```
[Job Title] (centered, 16pt font)

[Job Description] (left-aligned, 12pt font, 500px width)
```

### File Management
- **Temporary Directory**: `./temp/`
- **Filename Format**: `job_{jobId}.pdf`
- **Auto-cleanup**: Generated PDFs are deleted after upload
- **Error Handling**: Graceful failure with cleanup

### PDF Features
- Professional formatting
- Automatic text wrapping
- Consistent font sizing
- Clean layout structure

## Implementation Flow

### Job Creation Flow
1. User creates job via `POST /jobs`
2. Job saved to database with generated ID
3. PDF generated from job description text
4. PDF uploaded to JD matcher with job ID
5. Temporary PDF file cleaned up
6. Response returned to user

### Job Update Flow
1. User updates job via `PATCH /jobs/:id`
2. Job updated in database
3. New PDF generated with updated content
4. PDF re-uploaded to JD matcher with same job ID
5. Temporary PDF file cleaned up
6. Response returned to user

### File Upload Flow
1. User uploads job with PDF file
2. Existing PDF file used directly
3. PDF uploaded to JD matcher with job ID
4. No temporary file generation needed

## Error Handling

### PDF Generation Errors
```typescript
// Graceful error handling
try {
  await this.aiMatcherService.uploadJob(/* params */);
} catch (error) {
  console.error('Failed to upload job to AI matcher:', error.message);
  // Job creation/update continues despite AI matcher failure
}
```

### File System Errors
- Automatic temp directory creation
- File existence checks
- Stream error handling
- Cleanup on failure

### Network Errors
- 30-second timeout for uploads
- Detailed error logging
- Non-blocking failures

## Dependencies Added

### NPM Packages
```json
{
  "pdfkit": "^0.14.0",
  "@types/pdfkit": "^0.12.12"
}
```

### Import Statements
```typescript
import PDFDocument from 'pdfkit';
import * as path from 'path';
```

## Directory Structure

### Temporary Files
```
backend/
├── temp/                    # ⭐ NEW: Temporary PDF storage
│   ├── job_64a1b2c3.pdf   # Generated job PDFs
│   └── job_64a1b2c4.pdf
├── uploads/
│   └── job-descriptions/    # User-uploaded files
└── src/
```

## Configuration

### Environment Variables
```env
AI_MATCHER_BASE_URL=http://localhost:8000  # JD matcher service URL
```

### File System Permissions
- Ensure write permissions for `./temp/` directory
- Automatic directory creation if not exists

## Testing

### Manual Testing
```bash
# Test job creation with PDF generation
curl -X POST "http://localhost:3000/jobs" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "We are looking for a skilled software engineer...",
    "requirements": ["JavaScript", "Node.js"],
    "salary": 75000,
    "location": "Remote"
  }'

# Test job update with PDF regeneration
curl -X PATCH "http://localhost:3000/jobs/JOB_ID" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated job description..."
  }'
```

### Verification Steps
1. Check temp directory for PDF generation
2. Verify JD matcher receives correct job_id
3. Confirm PDF content matches job description
4. Validate cleanup of temporary files

## Performance Considerations

### PDF Generation
- Lightweight PDFKit library
- Minimal memory footprint
- Fast generation for text content
- Automatic cleanup prevents disk bloat

### Network Optimization
- Single upload per job operation
- Efficient form data streaming
- Timeout handling for reliability

## Future Enhancements

### Potential Improvements
1. **PDF Templates**: Custom branded PDF templates
2. **Batch Processing**: Multiple job PDF generation
3. **Caching**: Cache generated PDFs for identical content
4. **Compression**: PDF compression for smaller file sizes
5. **Validation**: PDF content validation before upload

### Monitoring
- Track PDF generation success rates
- Monitor temp directory usage
- Log JD matcher response times
- Alert on repeated failures