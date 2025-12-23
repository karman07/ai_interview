# Job Upload API Input Specification

## POST /upload-job-pdf

### Expected Input Format

```python
# Form Data Fields (multipart/form-data)
{
    "job_id": "string",        # Required - Unique identifier for the job
    "job_file": "file"         # Required - PDF file with complete job description
}
```

### Example API Calls

#### Upload complete job description PDF
```bash
curl -X POST "http://localhost:8000/upload-job-pdf" \
  -F "job_id=job_001" \
  -F "job_file=@complete_job_description.pdf"
```

### FastAPI Endpoint Definition

```python
from fastapi import FastAPI, Form, File, UploadFile, HTTPException
import PyPDF2
from io import BytesIO

@app.post("/upload-job-pdf")
async def upload_job_pdf(
    job_id: str = Form(...),                    # Required
    job_file: UploadFile = File(...)            # Required - PDF file
):
    # Validate file type
    if not job_file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed")
    
    # Read and save file
    file_content = await job_file.read()
    file_path = file_storage.save_job_file(file_content, job_file.filename, job_id)
    
    # Extract text from PDF for processing
    pdf_text = extract_pdf_text(file_content)
    
    # Store in database with job_id as unique key
    # Return job_id and confirmation
    return {
        "job_id": job_id,
        "message": "Job description PDF uploaded successfully",
        "file_path": file_path,
        "extracted_text_preview": pdf_text[:200] + "..." if len(pdf_text) > 200 else pdf_text
    }

def extract_pdf_text(file_content: bytes) -> str:
    """Extract text from PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception:
        return "Error extracting text from PDF"
```

### Response Format

```json
{
    "job_id": "job_001",
    "message": "Job description PDF uploaded successfully",
    "file_path": "/uploads/jobs/job_001_abc123.pdf",
    "extracted_text_preview": "Company: TechCorp Inc. Position: Senior Software Engineer..."
}
```

### Key Features
- **PDF-only upload** - Accepts complete job description PDFs with company details
- **Automatic text extraction** - Extracts text from PDF for AI processing
- **One job per job_id** - Replaces existing job with same job_id
- **File validation** - Ensures only PDF files are accepted
- **Text preview** - Returns preview of extracted text for verification

### Delete Job Endpoint

```bash
# Delete job files by job_id
curl -X DELETE "http://localhost:8000/delete-job/job_001"
```

Response:
```json
{
    "message": "Job files for job_id job_001 deleted successfully"
}
```