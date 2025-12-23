from pymongo import MongoClient
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

class MongoDB:
    def __init__(self):
        try:
            self.client = MongoClient(os.getenv("MONGODB_URL"))
            self.db = self.client["job_finder"]
            self.resumes = self.db["resumes"]
            self.jobs = self.db["jobs"]
            # Test connection
            self.client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            raise
    
    def add_resume(self, user_id: str, file_path: str, filename: str = None) -> str:
        try:
            # Check if user already has a resume
            existing = self.resumes.find_one({"user_id": user_id})
            
            resume_data = {
                "user_id": user_id,
                "filename": filename,
                "file_path": file_path,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            if existing:
                # Update existing resume
                self.resumes.update_one(
                    {"user_id": user_id},
                    {"$set": resume_data}
                )
                return str(existing["_id"])
            else:
                # Insert new resume
                result = self.resumes.insert_one(resume_data)
                return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding resume: {e}")
            raise
    
    def add_job(self, title: str = None, file_path: str = None, job_id: str = None, filename: str = None) -> str:
        try:
            if job_id:
                # Check if job_id already exists
                existing = self.jobs.find_one({"job_id": job_id})
                
                job_data = {
                    "job_id": job_id,
                    "title": title,
                    "filename": filename,
                    "file_path": file_path,
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                
                if existing:
                    # Update existing job
                    self.jobs.update_one(
                        {"job_id": job_id},
                        {"$set": job_data}
                    )
                    return str(existing["_id"])
                else:
                    # Insert new job
                    result = self.jobs.insert_one(job_data)
                    return str(result.inserted_id)
            else:
                # Original behavior for jobs without job_id
                job_data = {
                    "title": title,
                    "filename": filename,
                    "file_path": file_path,
                    "created_at": datetime.now()
                }
                result = self.jobs.insert_one(job_data)
                return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding job: {e}")
            raise
    
    def get_all_resumes(self) -> List[Dict]:
        try:
            resumes = list(self.resumes.find())
            for resume in resumes:
                resume["id"] = str(resume["_id"])
            return resumes
        except Exception as e:
            print(f"Error getting resumes: {e}")
            return []
    
    def get_all_jobs(self) -> List[Dict]:
        try:
            jobs = list(self.jobs.find())
            for job in jobs:
                job["id"] = str(job["_id"])
            return jobs
        except Exception as e:
            print(f"Error getting jobs: {e}")
            return []
    
    def get_resume(self, resume_id: str) -> Optional[Dict]:
        try:
            resume = self.resumes.find_one({"_id": ObjectId(resume_id)})
            if resume:
                resume["id"] = str(resume["_id"])
            return resume
        except Exception as e:
            print(f"Error getting resume: {e}")
            return None
    
    def get_resume_by_user_id(self, user_id: str) -> Optional[Dict]:
        try:
            resume = self.resumes.find_one({"user_id": user_id})
            if resume:
                resume["id"] = str(resume["_id"])
            return resume
        except Exception as e:
            print(f"Error getting resume by user_id: {e}")
            return None
    
    def get_job(self, job_id: str) -> Optional[Dict]:
        try:
            job = self.jobs.find_one({"_id": ObjectId(job_id)})
            if job:
                job["id"] = str(job["_id"])
            return job
        except Exception as e:
            print(f"Error getting job: {e}")
            return None
    
    def delete_job_by_id(self, job_id: str) -> bool:
        """Delete job by job_id (not MongoDB _id)."""
        try:
            result = self.jobs.delete_one({"job_id": job_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting job by job_id: {e}")
            return False