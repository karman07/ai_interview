# How to Run the AI Resume-Job Matcher App

## Prerequisites
- Python 3.8+
- MongoDB Atlas account (already configured)
- Gemini API key (already in .env)

## Step-by-Step Setup

### 1. Navigate to Project Directory
```bash
cd /Users/karmansingh/Desktop/work/ai_interview/ai
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Verify Environment File
Check `.env` file contains:
```
GEMINI_API_KEY=AIzaSyDrzRdiZVBNb64eFBi6F9qo8Fiup3u_bmk
MONGODB_URL=mongodb+srv://karmansingharora03_db_user:8813917626%24Karman@cluster0.yyjs2ln.mongodb.net/ai-interview?retryWrites=true&w=majority&appName=Cluster0
```

### 6. Run the Application
```bash
python main.py
```

### 7. Verify App is Running
- Server starts on: `http://localhost:8000`
- API docs available at: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/`

## Quick Test Commands

### Test Health Check
```bash
curl http://localhost:8000/
```

### Upload a Resume
```bash
curl -X POST "http://localhost:8000/upload-resume" \
  -F "user_id=test_user_1" \
  -F "resume_text=Software Engineer with 5 years Python experience, Django, React, AWS"
```

### Upload a Job
```bash
curl -X POST "http://localhost:8000/upload-job" \
  -F "job_text=Looking for Senior Python Developer with Django and React experience" \
  -F "job_title=Senior Python Developer"
```

### Find Best Jobs for Resume
```bash
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Python developer with Django and React experience" \
  -F "limit=5"
```

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:8000 | xargs kill -9
```

### MongoDB Connection Issues
- Check internet connection
- Verify MongoDB URL in .env
- Ensure MongoDB Atlas cluster is running

### Gemini API Issues
- Verify API key is correct
- Check API quota/limits
- Ensure internet connection

## File Structure
```
ai/
├── main.py              # FastAPI application
├── ai_service.py        # Gemini AI integration
├── database.py          # MongoDB operations
├── models.py            # Pydantic models
├── utils.py             # PDF/text processing
├── requirements.txt     # Dependencies
├── .env                 # Environment variables
└── venv/               # Virtual environment
```

## API Endpoints Summary
- `GET /` - Health check
- `POST /upload-resume` - Upload resume (requires user_id)
- `POST /upload-job` - Upload job description
- `POST /best-job-for-resume` - Find matching jobs
- `POST /best-resume-for-job` - Find matching resumes
- `POST /generate-job` - Generate job from resume
- `POST /generate-resume` - Generate resume from job

## Next Steps
1. Test all endpoints using the curl commands above
2. Visit `http://localhost:8000/docs` for interactive API testing
3. Upload multiple resumes and jobs to test matching
4. Check MongoDB collections in Atlas dashboard