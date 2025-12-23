import os
import uuid
from pathlib import Path
from typing import Optional

class FileStorage:
    def __init__(self, base_path: str = "uploads"):
        self.base_path = Path(base_path)
        self.resumes_path = self.base_path / "resumes"
        self.jobs_path = self.base_path / "jobs"
        
        # Create directories if they don't exist
        self.resumes_path.mkdir(parents=True, exist_ok=True)
        self.jobs_path.mkdir(parents=True, exist_ok=True)
    
    def save_resume_file(self, file_content: bytes, filename: str, user_id: str) -> str:
        """Save resume file and return the file path."""
        # Generate unique filename
        if filename:
            file_extension = Path(filename).suffix
            if not file_extension:
                file_extension = '.pdf'
        else:
            file_extension = '.pdf'
        
        unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_extension}"
        file_path = self.resumes_path / unique_filename
        
        # Remove old resume file for this user if exists
        self._remove_old_user_files(self.resumes_path, user_id)
        
        # Save new file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return str(file_path)
    
    def save_job_file(self, file_content: bytes, filename: str, job_id: str) -> str:
        """Save job file and return the file path. Ensures one job description per job_id."""
        # Generate unique filename
        if filename:
            file_extension = Path(filename).suffix
            if not file_extension:
                file_extension = '.pdf'
        else:
            file_extension = '.pdf'
        
        unique_filename = f"{job_id}_{uuid.uuid4().hex}{file_extension}"
        file_path = self.jobs_path / unique_filename
        
        # Remove old job file for this job_id if exists
        self._remove_old_job_files(self.jobs_path, job_id)
        
        # Save new file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return str(file_path)
    
    def _remove_old_user_files(self, directory: Path, user_id: str):
        """Remove old files for a specific user."""
        for file_path in directory.glob(f"{user_id}_*"):
            try:
                file_path.unlink()
            except OSError:
                pass  # File might be in use or already deleted
    
    def _remove_old_job_files(self, directory: Path, job_id: str):
        """Remove old files for a specific job_id."""
        for file_path in directory.glob(f"{job_id}_*"):
            try:
                file_path.unlink()
            except OSError:
                pass  # File might be in use or already deleted
    
    def delete_job_files(self, job_id: str) -> bool:
        """Delete all job files for a specific job_id."""
        try:
            deleted_count = 0
            for file_path in self.jobs_path.glob(f"{job_id}_*"):
                file_path.unlink()
                deleted_count += 1
            return deleted_count > 0
        except OSError:
            return False
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage."""
        try:
            Path(file_path).unlink()
            return True
        except OSError:
            return False