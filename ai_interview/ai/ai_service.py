import google.generativeai as genai
import os
from typing import Dict, Any, Optional, List
import json

class AIService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        try:
            self.model = genai.GenerativeModel('gemini-1.5-pro')
        except:
            try:
                self.model = genai.GenerativeModel('gemini-pro')
            except:
                self.model = genai.GenerativeModel('models/gemini-pro')
    
    def analyze_resume_job_match(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Analyze match between resume and job description."""
        try:
            # Simple keyword matching as fallback
            job_keywords = ['react', 'node', 'express', 'javascript', 'typescript', 'mern', 'mongodb', 'python', 'java', 'angular', 'vue']
            resume_lower = resume_text.lower()
            job_lower = job_description.lower()
            
            matched_skills = []
            missing_skills = []
            
            for keyword in job_keywords:
                if keyword in job_lower:
                    if keyword in resume_lower:
                        matched_skills.append(keyword.title())
                    else:
                        missing_skills.append(keyword.title())
            
            # Calculate basic match score
            if len(matched_skills) + len(missing_skills) > 0:
                match_score = int((len(matched_skills) / (len(matched_skills) + len(missing_skills))) * 100)
            else:
                match_score = 50
            
            return {
                "match_score": max(match_score, 30),  # Minimum 30% match
                "strengths": matched_skills if matched_skills else ["General programming experience"],
                "weaknesses": missing_skills if missing_skills else ["No specific weaknesses identified"]
            }
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return {
                "match_score": 60,
                "strengths": ["Analysis error"],
                "weaknesses": [f"Error processing analysis: {str(e)}"]
            }
    
    def find_best_jobs_for_resume(self, resume_text: str, jobs: list, limit: int = 10) -> Dict[str, Any]:
        """Find best matching jobs for a resume."""
        if not jobs:
            return {"matches": [], "total": 0, "error": "No jobs available"}
        
        matches = []
        
        for job in jobs:
            try:
                # Extract content from PDF file if file_path exists
                if "file_path" in job and job["file_path"]:
                    try:
                        with open(job["file_path"], 'rb') as f:
                            from utils import extract_text_from_pdf
                            job_content = extract_text_from_pdf(f.read())
                    except Exception as e:
                        print(f"Error reading job PDF {job['file_path']}: {e}")
                        continue
                else:
                    # Fallback to stored content if available
                    job_content = job.get("content", "")
                    if not job_content:
                        continue
                
                analysis = self.analyze_resume_job_match(resume_text, job_content)
                score = analysis.get("match_score", 0)
                
                matches.append({
                    "job_id": job["id"],
                    "job_title": job.get("title", "Untitled"),
                    "match_score": score,
                    "strengths": analysis.get("strengths", []),
                    "weaknesses": analysis.get("weaknesses", [])
                })
            except Exception as e:
                continue
        
        # Sort by match score descending and limit results
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        limited_matches = matches[:limit]
        
        return {
            "matches": limited_matches,
            "total": len(matches),
            "showing": len(limited_matches),
            "error": None if matches else "No suitable matches found"
        }
    
    def find_best_resumes_for_job(self, job_description: str, resumes: list, limit: int = 10) -> Dict[str, Any]:
        """Find best matching resumes for a job."""
        if not resumes:
            return {"matches": [], "total": 0, "error": "No resumes available"}
        
        print(f"Analyzing {len(resumes)} resumes against job description")  # Debug log
        matches = []
        
        for i, resume in enumerate(resumes):
            try:
                print(f"Processing resume {i+1}/{len(resumes)}: {resume.get('id', 'unknown')}")  # Debug log
                
                # Extract content from PDF file
                if "file_path" not in resume or not resume["file_path"]:
                    print(f"Resume {i+1} missing file_path")
                    continue
                
                # Read and extract content from PDF
                try:
                    with open(resume["file_path"], 'rb') as f:
                        from utils import extract_text_from_pdf
                        resume_content = extract_text_from_pdf(f.read())
                        print(f"Extracted {len(resume_content)} characters from resume PDF")
                except Exception as e:
                    print(f"Error reading PDF {resume['file_path']}: {e}")
                    continue
                    
                analysis = self.analyze_resume_job_match(resume_content, job_description)
                score = analysis.get("match_score", 0)
                print(f"Resume {i+1} score: {score}")  # Debug log
                
                matches.append({
                    "user_id": resume.get("user_id", ""),
                    "resume_id": resume["id"],
                    "resume_filename": resume.get("filename", "Untitled"),
                    "match_score": score,
                    "strengths": analysis.get("strengths", []),
                    "weaknesses": analysis.get("weaknesses", [])
                })
            except Exception as e:
                print(f"Error processing resume {i+1}: {e}")  # Debug log
                continue
        
        # Sort by match score descending and limit results
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        limited_matches = matches[:limit]
        
        print(f"Total matches found: {len(matches)}, showing: {len(limited_matches)}")  # Debug log
        
        return {
            "matches": limited_matches,
            "total": len(matches),
            "showing": len(limited_matches),
            "error": None if matches else "No suitable matches found"
        }
    
    def generate_job_description(self, resume_text: str) -> str:
        """Generate job description based on resume."""
        prompt = f"""
        Based on this resume, generate a suitable job description that matches the candidate's skills and experience:
        
        {resume_text}
        
        Return only the job description text.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_resume(self, job_description: str) -> str:
        """Generate resume tailored to job description."""
        prompt = f"""
        Create a professional resume tailored for this job description:
        
        {job_description}
        
        Return only the resume text in a professional format.
        """
        
        response = self.model.generate_content(prompt)
        return response.text