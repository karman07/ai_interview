#!/usr/bin/env python3

import sys
import os
sys.path.append('/Users/karmansingh/Desktop/work/ai_interview/ai')

from database import MongoDB
from utils import extract_text_from_pdf

def check_database():
    try:
        db = MongoDB()
        print("✅ MongoDB connected successfully")
        
        # Check resumes
        resumes = db.get_all_resumes()
        print(f"\n📄 Resumes in database: {len(resumes)}")
        for resume in resumes:
            print(f"  - ID: {resume.get('id')}, User: {resume.get('user_id')}, Content preview: {resume.get('content', '')[:50]}...")
        
        # Check jobs
        jobs = db.get_all_jobs()
        print(f"\n💼 Jobs in database: {len(jobs)}")
        for job in jobs:
            print(f"  - ID: {job.get('id')}, Title: {job.get('title')}, Content preview: {job.get('content', '')[:50]}...")
            
    except Exception as e:
        print(f"❌ Database error: {e}")

def extract_from_files():
    """Extract text from uploaded files to see what's there"""
    print("\n🔍 Checking uploaded files:")
    
    resume_path = "/Users/karmansingh/Desktop/work/ai_interview/ai/uploads/resumes/68edfb398df3bfece0f3daf5_c426819beccd484cba943fb528c01a62.pdf"
    job_path = "/Users/karmansingh/Desktop/work/ai_interview/ai/uploads/jobs/694958fe2fc1675fd92efa33_df9fba21b067431d887b63626f0c9a25.pdf"
    
    try:
        with open(resume_path, 'rb') as f:
            resume_text = extract_text_from_pdf(f.read())
            print(f"📄 Resume file text preview: {resume_text[:100]}...")
    except Exception as e:
        print(f"❌ Error reading resume: {e}")
    
    try:
        with open(job_path, 'rb') as f:
            job_text = extract_text_from_pdf(f.read())
            print(f"💼 Job file text preview: {job_text[:100]}...")
    except Exception as e:
        print(f"❌ Error reading job: {e}")

if __name__ == "__main__":
    print("🔍 Debugging AI Resume-Job Matcher Database")
    print("=" * 50)
    
    check_database()
    extract_from_files()
    
    print("\n💡 Solution:")
    print("The files exist on disk but not in the database.")
    print("You need to upload them through the API endpoints:")
    print("1. POST /upload-resume with user_id and resume file")
    print("2. POST /upload-job-pdf with job_id and job file")