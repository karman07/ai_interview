from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Optional
import traceback
import PyPDF2
from io import BytesIO

from ai_service import AIService
from utils import extract_text_from_pdf, process_text_input
from models import (
    JobDescriptionResponse, ResumeResponse, 
    UploadResponse, BestJobsResponse, BestResumesResponse, MatchScoreResponse
)
from database import MongoDB
from file_storage import FileStorage

load_dotenv()

app = FastAPI(title="AI Resume-Job Matcher", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()
file_storage = FileStorage()
try:
    db = MongoDB()
    print("MongoDB connected successfully")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    db = None

@app.post("/generate-job", response_model=JobDescriptionResponse)
async def generate_job_description(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None)
):
    """Generate job description based on resume."""
    
    if resume_file:
        if resume_file.content_type == "application/pdf":
            resume_content = extract_text_from_pdf(await resume_file.read())
        else:
            resume_content = (await resume_file.read()).decode('utf-8')
    elif resume_text:
        resume_content = process_text_input(resume_text)
    else:
        raise HTTPException(status_code=400, detail="Resume file or text required")
    
    try:
        job_description = ai_service.generate_job_description(resume_content)
        return JobDescriptionResponse(job_description=job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job generation failed: {str(e)}")

@app.post("/generate-resume", response_model=ResumeResponse)
async def generate_resume(
    job_file: Optional[UploadFile] = File(None),
    job_text: Optional[str] = Form(None)
):
    """Generate resume tailored to job description."""
    
    if job_file:
        if job_file.content_type == "application/pdf":
            job_content = extract_text_from_pdf(await job_file.read())
        else:
            job_content = (await job_file.read()).decode('utf-8')
    elif job_text:
        job_content = process_text_input(job_text)
    else:
        raise HTTPException(status_code=400, detail="Job description file or text required")
    
    try:
        resume = ai_service.generate_resume(job_content)
        return ResumeResponse(resume=resume)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume generation failed: {str(e)}")

@app.get("/debug/resumes")
async def debug_resumes():
    """Debug endpoint to check resumes in database."""
    if db is None:
        return {"error": "Database not available"}
    
    resumes = db.get_all_resumes()
    return {
        "count": len(resumes),
        "resumes": [{"id": r.get("id"), "user_id": r.get("user_id"), "content_preview": r.get("content", "")[:100]} for r in resumes]
    }

@app.get("/debug/jobs")
async def debug_jobs():
    """Debug endpoint to check jobs in database."""
    if db is None:
        return {"error": "Database not available"}
    
    jobs = db.get_all_jobs()
    return {
        "count": len(jobs),
        "jobs": [{"id": j.get("id"), "job_id": j.get("job_id"), "title": j.get("title"), "content_preview": j.get("content", "")[:100]} for j in jobs]
    }

@app.get("/")
async def root():
    return {"message": "AI Resume-Job Matcher API", "version": "1.0.0"}

@app.post("/upload-resume", response_model=UploadResponse)
async def upload_resume(
    user_id: str = Form(...),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None)
):
    """Upload and store a resume (one per user)."""
    try:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not available")
            
        file_path = None
        
        if resume_file:
            filename = resume_file.filename
            file_content = await resume_file.read()
            
            # Save all files to server
            if filename:
                file_path = file_storage.save_resume_file(file_content, filename, user_id)
                print(f"File saved to: {file_path}")
            
            # Extract content based on file type
            if resume_file.content_type == "application/pdf" or filename.lower().endswith('.pdf'):
                content = extract_text_from_pdf(file_content)
            else:
                try:
                    content = file_content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        content = file_content.decode('latin-1')
                    except UnicodeDecodeError:
                        content = file_content.decode('utf-8', errors='ignore')
        elif resume_text:
            content = process_text_input(resume_text)
        else:
            raise HTTPException(status_code=400, detail="Resume file or text required")
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="Resume content is empty")
        
        resume_id = db.add_resume(user_id, file_path, filename)
        return UploadResponse(id=resume_id, message="Resume uploaded successfully")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload resume error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}")

@app.post("/upload-job-pdf", response_model=UploadResponse)
async def upload_job_pdf(
    job_id: str = Form(...),
    job_file: UploadFile = File(...)
):
    """Upload complete job description PDF with company details."""
    try:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Validate file type
        if not job_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Read file content
        file_content = await job_file.read()
        
        # Save file with job_id
        file_path = file_storage.save_job_file(file_content, job_file.filename, job_id)
        
        # Extract text from PDF
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            pdf_text = ""
            for page in pdf_reader.pages:
                pdf_text += page.extract_text()
        except Exception:
            pdf_text = "Error extracting text from PDF"
        
        if not pdf_text.strip() or pdf_text == "Error extracting text from PDF":
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Store in database
        result_id = db.add_job(None, job_file.filename, file_path, job_id)
        
        return UploadResponse(
            id=result_id,
            message="Job description PDF uploaded successfully",
            extracted_text_preview=pdf_text[:200] + "..." if len(pdf_text) > 200 else pdf_text
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload job PDF error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to upload job PDF: {str(e)}")

@app.delete("/delete-job/{job_id}")
async def delete_job(job_id: str):
    """Delete job files by job_id."""
    try:
        success = file_storage.delete_job_files(job_id)
        if success:
            # Also remove from database if exists
            if db:
                db.delete_job_by_id(job_id)
            return {"message": f"Job files for job_id {job_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Job files not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete job: {str(e)}")

@app.post("/upload-job", response_model=UploadResponse)
async def upload_job(
    job_file: Optional[UploadFile] = File(None),
    job_text: Optional[str] = Form(None),
    job_title: Optional[str] = Form(None)
):
    """Upload and store a job description."""
    try:
        file_path = None
        
        if job_file:
            file_content = await job_file.read()
            filename = job_file.filename
            
            # Save all files to server
            if filename:
                file_path = file_storage.save_job_file(file_content, filename)
                print(f"File saved to: {file_path}")
            
            # Extract content based on file type
            if job_file.content_type == "application/pdf" or filename.lower().endswith('.pdf'):
                content = extract_text_from_pdf(file_content)
            else:
                try:
                    content = file_content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        content = file_content.decode('latin-1')
                    except UnicodeDecodeError:
                        content = file_content.decode('utf-8', errors='ignore')
        elif job_text:
            content = process_text_input(job_text)
        else:
            raise HTTPException(status_code=400, detail="Job description file or text required")
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="Job description content is empty")
        
        job_id = db.add_job(job_title, file_path)
        return UploadResponse(id=job_id, message="Job description uploaded successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload job: {str(e)}")

@app.post("/best-job-for-resume", response_model=BestJobsResponse)
async def get_best_job_for_resume(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    limit: int = Form(10)
):
    """Find the best matching jobs for a given resume."""
    try:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not available")
            
        if resume_file:
            file_content = await resume_file.read()
            filename = resume_file.filename
            
            if resume_file.content_type == "application/pdf" or filename.lower().endswith('.pdf'):
                resume_content = extract_text_from_pdf(file_content)
            else:
                try:
                    resume_content = file_content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        resume_content = file_content.decode('latin-1')
                    except UnicodeDecodeError:
                        resume_content = file_content.decode('utf-8', errors='ignore')
        elif resume_text:
            resume_content = process_text_input(resume_text)
        else:
            raise HTTPException(status_code=400, detail="Resume file or text required")
        
        if not resume_content.strip():
            raise HTTPException(status_code=400, detail="Resume content is empty")
        
        if limit < 1 or limit > 50:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 50")
        
        jobs = db.get_all_jobs()
        result = ai_service.find_best_jobs_for_resume(resume_content, jobs, limit)
        return BestJobsResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Best job error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")

@app.post("/best-resume-for-job", response_model=BestResumesResponse)
async def get_best_resume_for_job(
    job_file: Optional[UploadFile] = File(None),
    job_text: Optional[str] = Form(None),
    limit: int = Form(10)
):
    """Find the best matching resumes for a given job description."""
    try:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not available")
            
        if job_file:
            file_content = await job_file.read()
            filename = job_file.filename
            
            if job_file.content_type == "application/pdf" or filename.lower().endswith('.pdf'):
                job_content = extract_text_from_pdf(file_content)
            else:
                try:
                    job_content = file_content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        job_content = file_content.decode('latin-1')
                    except UnicodeDecodeError:
                        job_content = file_content.decode('utf-8', errors='ignore')
        elif job_text:
            job_content = process_text_input(job_text)
        else:
            raise HTTPException(status_code=400, detail="Job description file or text required")
        
        if not job_content.strip():
            raise HTTPException(status_code=400, detail="Job description content is empty")
        
        if limit < 1 or limit > 50:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 50")
        
        resumes = db.get_all_resumes()
        print(f"Found {len(resumes)} resumes in database")
        if resumes:
            print(f"First resume preview: {resumes[0].get('content', '')[:100]}...")
        
        result = ai_service.find_best_resumes_for_job(job_content, resumes, limit)
        print(f"AI service result: {result}")
        return BestResumesResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Best resume error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")

@app.post("/match-score", response_model=MatchScoreResponse)
async def get_match_score(
    applicant_id: str = Form(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None)
):
    """Get AI match score between applicant's resume and job description."""
    try:
        if db is None:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get applicant's resume
        resume = db.get_resume_by_user_id(applicant_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Applicant resume not found")
        
        # Get job description content
        if jd_file:
            filename = jd_file.filename
            file_content = await jd_file.read()
            
            if jd_file.content_type == "application/pdf" or (filename and filename.lower().endswith('.pdf')):
                jd_content = extract_text_from_pdf(file_content)
            else:
                jd_content = file_content.decode('utf-8')
        elif jd_text:
            jd_content = process_text_input(jd_text)
        else:
            raise HTTPException(status_code=400, detail="Job description file or text required")
        
        if not jd_content.strip():
            raise HTTPException(status_code=400, detail="Job description content is empty")
        
        # Get AI match analysis
        result = ai_service.analyze_resume_job_match(resume['content'], jd_content)
        
        return MatchScoreResponse(
            applicant_id=applicant_id,
            match_score=result.get('match_score', 0.0),
            missing_keywords=result.get('missing_keywords', []),
            suggestions=result.get('suggestions', [])
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Match score error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to calculate match score: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)