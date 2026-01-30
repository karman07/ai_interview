# Resume POST API Sample Response

## Endpoint
`POST /resume/upload`

## Request
```bash
curl -X POST http://localhost:3000/resume/upload \
  -H "Authorization: Bearer <jwt_token>" \
  -F "files=@resume.pdf" \
  -F "files=@job_description.pdf" \
  -F "jd_text=We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and TypeScript..."
```

## Sample Response

### Successful Upload with AI Analysis and Enhancement
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "filename": "john_doe_resume.pdf",
    "url": "http://localhost:3000/uploads/users/user123/1710123456789-john_doe_resume.pdf",
    "stats": {
      "overall_score": 8.2,
      "sections": {
        "contact_info": {
          "score": 9.0,
          "feedback": "Complete contact information provided"
        },
        "professional_summary": {
          "score": 8.5,
          "feedback": "Strong summary highlighting key skills"
        },
        "work_experience": {
          "score": 8.0,
          "feedback": "Good experience details with quantifiable achievements"
        },
        "education": {
          "score": 7.5,
          "feedback": "Relevant educational background"
        },
        "skills": {
          "score": 8.8,
          "feedback": "Comprehensive technical skills listed"
        }
      },
      "strengths": [
        "Strong technical background in React and Node.js",
        "Quantifiable achievements in previous roles",
        "Clear and professional formatting",
        "Relevant certifications included"
      ],
      "weaknesses": [
        "Could include more soft skills",
        "Missing portfolio links",
        "Some experience descriptions could be more detailed"
      ],
      "recommendations": [
        "Add links to GitHub and portfolio projects",
        "Include more leadership and teamwork examples",
        "Consider adding volunteer work or side projects"
      ],
      "ats_compatibility": {
        "score": 8.5,
        "issues": [
          "Use standard section headings",
          "Avoid complex formatting"
        ]
      },
      "keyword_analysis": {
        "matched_keywords": [
          "React", "Node.js", "TypeScript", "JavaScript", 
          "MongoDB", "Express.js", "Git", "Agile"
        ],
        "missing_keywords": [
          "Docker", "AWS", "Microservices", "CI/CD"
        ],
        "keyword_density": 0.12
      }
    },
    "improvement_resume": {
      "fit_score": 85.5,
      "matching_skills": [
        "React (5 years)",
        "Node.js (4 years)",
        "TypeScript (3 years)",
        "MongoDB (3 years)",
        "Express.js (4 years)",
        "Git (5 years)",
        "Agile methodologies (3 years)"
      ],
      "missing_skills": [
        "Docker containerization",
        "AWS cloud services",
        "Microservices architecture",
        "CI/CD pipelines",
        "Test-driven development"
      ],
      "suggestions": [
        {
          "section": "Professional Summary",
          "current": "Experienced software engineer with expertise in full-stack development.",
          "improved": "Senior Software Engineer with 5+ years of expertise in full-stack development using React, Node.js, and TypeScript. Proven track record of delivering scalable web applications and leading development teams."
        },
        {
          "section": "Skills",
          "suggestion": "Add missing keywords: Docker, AWS, Microservices, CI/CD, TDD",
          "priority": "high"
        },
        {
          "section": "Work Experience",
          "suggestion": "Quantify achievements with specific metrics (e.g., 'Improved application performance by 40%')",
          "priority": "medium"
        }
      ],
      "rewritten_sections": {
        "professional_summary": "Senior Software Engineer with 5+ years of expertise in full-stack development using React, Node.js, and TypeScript. Proven track record of delivering scalable web applications, implementing microservices architecture, and leading cross-functional development teams. Experience with cloud platforms (AWS), containerization (Docker), and CI/CD pipelines.",
        "skills": {
          "technical_skills": [
            "Frontend: React, TypeScript, JavaScript, HTML5, CSS3",
            "Backend: Node.js, Express.js, RESTful APIs, GraphQL",
            "Databases: MongoDB, PostgreSQL, Redis",
            "Cloud & DevOps: AWS, Docker, CI/CD, Jenkins",
            "Tools: Git, Jira, Agile/Scrum methodologies"
          ]
        }
      },
      "overall_improvement_score": 92.3,
      "recommendations": [
        "Highlight leadership experience and team management skills",
        "Add specific project examples with measurable outcomes",
        "Include relevant certifications (AWS, React, etc.)",
        "Optimize for ATS with standard formatting and keywords"
      ]
    },
    "tailored_resume": {
      "title": "Improved Resume Version",
      "content": "\nJOHN DOE\nSoftware Engineer | Python Developer | AI Enthusiast\n\nPROFESSIONAL SUMMARY\nResults-driven Software Engineer with 5+ years of experience developing scalable web applications \nand AI-powered solutions. Proven track record of delivering high-quality code and leading \ncross-functional teams to achieve business objectives.\n\nTECHNICAL SKILLS\n• Programming: Python, JavaScript, TypeScript, SQL\n• Frameworks: FastAPI, React, Node.js, Django\n• Databases: MongoDB, PostgreSQL, Redis\n• Cloud: AWS, Docker, Kubernetes\n• AI/ML: TensorFlow, PyTorch, Scikit-learn\n\nPROFESSIONAL EXPERIENCE\nSenior Software Engineer | Tech Corp | 2021-Present\n• Developed and maintained 15+ microservices handling 1M+ daily requests\n• Led team of 4 engineers in building AI-powered recommendation system\n• Reduced system latency by 40% through optimization and caching strategies\n• Implemented CI/CD pipelines reducing deployment time by 60%\n\nSoftware Engineer | StartupXYZ | 2019-2021\n• Built full-stack web applications using Python and React\n• Designed and implemented RESTful APIs serving 100K+ users\n• Collaborated with product team to deliver features ahead of schedule\n• Mentored 2 junior developers and conducted code reviews\n\nEDUCATION\nBachelor of Science in Computer Science | University of Technology | 2019\n• Relevant Coursework: Data Structures, Algorithms, Machine Learning, Database Systems\n",
      "improvements": [
        "Added quantified achievements",
        "Highlighted relevant technologies",
        "Improved formatting and structure",
        "Added professional summary",
        "Emphasized leadership experience"
      ]
    },
    "top_1_percent_benchmark": {
      "title": "Top 1% Candidate Profile",
      "content": "\nTOP 1% SOFTWARE ENGINEER PROFILE\n\nDISTINGUISHING CHARACTERISTICS:\n• 7+ years of experience with proven impact on business metrics\n• Led teams of 10+ engineers across multiple projects\n• Published research papers or contributed to open-source projects\n• Speaking experience at industry conferences\n• Multiple certifications (AWS Solutions Architect, Google Cloud Professional)\n\nTECHNICAL EXCELLENCE:\n• Expert-level proficiency in 3+ programming languages\n• Deep understanding of system design and architecture\n• Experience with cutting-edge technologies (AI/ML, blockchain, etc.)\n• Contributions to high-scale systems (millions of users)\n• Track record of technical innovation and patents\n\nLEADERSHIP & IMPACT:\n• Mentored 15+ junior engineers with measurable career progression\n• Led digital transformation initiatives saving $1M+ annually\n• Established engineering best practices adopted company-wide\n• Cross-functional collaboration with C-level executives\n• Built and scaled engineering teams from 5 to 50+ members\n\nCONTINUOUS LEARNING:\n• Advanced degree (MS/PhD) in Computer Science or related field\n• Continuous learning through courses, certifications, and conferences\n• Active participation in tech communities and open-source projects\n• Thought leadership through blogs, articles, or speaking engagements\n",
      "gap_analysis": [
        "Need more quantified business impact",
        "Could highlight leadership and mentoring experience",
        "Missing advanced certifications",
        "No mention of open-source contributions",
        "Could add speaking or writing experience"
      ]
    },
    "cover_letter": {
      "title": "Tailored Cover Letter",
      "content": "\nDear Hiring Manager,\n\nI am excited to apply for the Software Engineer position at Tech Corp. With 5+ years of experience building scalable applications and a passion for AI-powered solutions, I am confident I can contribute significantly to your team.\n\nIn my current role, I've led the development of microservices handling over 1M daily requests and reduced system latency by 40%. My experience with Python, FastAPI, and MongoDB aligns perfectly with your tech stack requirements. Additionally, I've mentored junior developers and implemented CI/CD pipelines that improved deployment efficiency by 60%.\n\nWhat excites me most about this opportunity is the chance to work on cutting-edge AI applications while contributing to a team that values innovation and technical excellence. I'm particularly drawn to your company's mission of democratizing AI technology.\n\nI would welcome the opportunity to discuss how my technical skills and leadership experience can help drive your engineering initiatives forward.\n\nBest regards,\nJohn Doe\n",
      "key_points": [
        "Directly addresses role requirements",
        "Quantifies achievements and impact",
        "Shows enthusiasm for company mission",
        "Highlights relevant technical skills",
        "Professional and concise tone"
      ]
    }
  }
}
```

### Upload Without Job Description
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "filename": "jane_smith_resume.pdf",
    "url": "http://localhost:3000/uploads/users/user456/1710123456790-jane_smith_resume.pdf",
    "stats": {
      "overall_score": 7.8,
      "sections": {
        "contact_info": {
          "score": 9.0,
          "feedback": "Complete contact information provided"
        },
        "professional_summary": {
          "score": 7.5,
          "feedback": "Good summary but could be more specific"
        },
        "work_experience": {
          "score": 8.2,
          "feedback": "Strong experience with good details"
        },
        "education": {
          "score": 8.0,
          "feedback": "Relevant educational background"
        },
        "skills": {
          "score": 7.0,
          "feedback": "Skills listed but could be more comprehensive"
        }
      },
      "strengths": [
        "Clear work progression",
        "Good educational background",
        "Professional formatting"
      ],
      "weaknesses": [
        "Limited technical skills detail",
        "Missing quantifiable achievements",
        "No portfolio or project links"
      ],
      "recommendations": [
        "Add more technical skills",
        "Include project portfolio",
        "Quantify achievements with numbers"
      ],
      "ats_compatibility": {
        "score": 8.0,
        "issues": []
      }
    },
    "improvement_resume": null
  }
}
```

### Upload with AI Service Unavailable
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "filename": "resume_basic.pdf",
    "url": "http://localhost:3000/uploads/users/user789/1710123456791-resume_basic.pdf",
    "stats": null,
    "improvement_resume": null
  }
}
```

## Response Fields Explanation

### Main Response
- `message`: Success message
- `resume`: Resume object with analysis data

### Resume Object
- `id`: MongoDB ObjectId of the saved resume
- `filename`: Original filename of uploaded resume
- `url`: Public URL to access the resume file
- `stats`: AI analysis of resume quality (null if AI service unavailable)
- `improvement_resume`: Job-specific improvement suggestions (null if no JD provided or AI service unavailable)

### Stats Object (AI Resume Analysis)
- `overall_score`: Overall resume quality score (0-10)
- `sections`: Score and feedback for each resume section
- `strengths`: Array of resume strengths
- `weaknesses`: Array of areas needing improvement
- `recommendations`: General improvement suggestions
- `ats_compatibility`: ATS (Applicant Tracking System) compatibility analysis
- `keyword_analysis`: Keyword matching and density analysis

### Improvement Resume Object (Job-Specific Analysis)
- `fit_score`: How well resume matches job description (0-100)
- `matching_skills`: Skills that match job requirements
- `missing_skills`: Skills mentioned in JD but missing from resume
- `suggestions`: Section-specific improvement suggestions
- `rewritten_sections`: AI-improved versions of resume sections
- `overall_improvement_score`: Projected score after improvements
- `recommendations`: Job-specific recommendations

## Error Responses

### No File Uploaded
```json
{
  "statusCode": 400,
  "message": "At least one file (resume) is required",
  "error": "Bad Request"
}
```

### Invalid File Type
```json
{
  "statusCode": 400,
  "message": "Only PDF files are allowed",
  "error": "Bad Request"
}
```

### AI Service Timeout
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "filename": "resume.pdf",
    "url": "http://localhost:3000/uploads/users/user123/1710123456792-resume.pdf",
    "stats": null,
    "improvement_resume": null
  },
  "warning": "AI analysis unavailable - service timeout"
}
```