# File Storage Changes

## Overview
Modified the file storage system to ensure one job description per job_id (jid).

## Changes Made

### 1. Modified `save_job_file` method
- **File**: `file_storage.py`
- **Change**: Added `job_id` parameter to ensure unique job descriptions per job ID
- **Before**: `save_job_file(file_content: bytes, filename: str) -> str`
- **After**: `save_job_file(file_content: bytes, filename: str, job_id: str) -> str`

### 2. Added job file cleanup
- **File**: `file_storage.py`
- **Change**: Added `_remove_old_job_files` method to remove existing job files for the same job_id
- **Purpose**: Ensures only one job description exists per job_id

### 3. Updated file naming convention
- **Before**: Random UUID for job files
- **After**: `{job_id}_{uuid}` format for job files
- **Benefit**: Easy identification and cleanup of job files by job_id

### 4. Added job file deletion method
- **File**: `file_storage.py`
- **Change**: Added `delete_job_files` method to delete all job files for a specific job_id
- **Purpose**: Allows complete removal of job files when needed

## Impact

### API Changes Required
The following endpoints will need to be updated to pass `job_id`:
- `POST /upload-job` - Must include job_id parameter
- `DELETE /delete-job/{job_id}` - New endpoint to delete job files
- Any other endpoints that save job files

### API Route Updates
```python
# Before
@app.post("/upload-job")
async def upload_job(job_text: str = Form(...), job_title: str = Form(...)):
    # Implementation without job_id

# After
@app.post("/upload-job")
async def upload_job(job_id: str = Form(...), job_text: str = Form(...), job_title: str = Form(...)):
    # Pass job_id to file_storage.save_job_file()
    file_path = file_storage.save_job_file(file_content, filename, job_id)

# New endpoint for deleting job files
@app.delete("/delete-job/{job_id}")
async def delete_job(job_id: str):
    success = file_storage.delete_job_files(job_id)
    if success:
        return {"message": f"Job files for job_id {job_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Job files not found")
```

### Database Considerations
- Ensure job_id is unique in the database
- Consider adding constraints to prevent duplicate job_ids

### Benefits
1. **Data Integrity**: One job description per job_id prevents confusion
2. **Storage Efficiency**: Automatic cleanup of old job files
3. **Consistency**: Matches the user-resume relationship pattern

## Migration Notes
- Existing job files without job_id prefix will remain until manually cleaned
- New uploads will follow the new naming convention
- Consider running a cleanup script for existing files if needed