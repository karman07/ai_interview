import { Briefcase, Plus, List } from 'lucide-react';

export const JobsPage = () => {
  const endpoints = [
    {
      icon: Plus,
      method: 'POST',
      path: '/jobs',
      title: 'Create Job',
      description: 'Create a new job posting with optional file upload',
      auth: 'Employer Only',
      contentType: 'multipart/form-data',
      fields: `{
  "title": "string (required)",
  "description": "string (required)",
  "descriptionType": "'text' | 'pdf' | 'markdown' (optional)",
  "requirements": "string[] (required)",
  "salary": "number (required)",
  "location": "string (required)",
  "descriptionFile": "File (optional - PDF/Markdown)"
}`,
      example: `curl -X POST "http://localhost:3000/jobs" \\
  -H "Authorization: Bearer <accessToken>" \\
  -F "title=Senior Full Stack Developer" \\
  -F "description=Looking for experienced developer..." \\
  -F "requirements[]=5+ years experience" \\
  -F "requirements[]=React expertise" \\
  -F "requirements[]=Node.js experience" \\
  -F "salary=120000" \\
  -F "location=Remote" \\
  -F "descriptionType=pdf" \\
  -F "descriptionFile=@job_description.pdf"`
    },
    {
      icon: List,
      method: 'GET',
      path: '/jobs/my-jobs',
      title: 'Get My Jobs',
      description: 'Retrieve all jobs posted by the employer',
      auth: 'Employer Only',
      response: `[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer",
    "description": "Looking for experienced developer...",
    "descriptionType": "pdf",
    "descriptionFileUrl": "/uploads/job-descriptions/job_1234567890.pdf",
    "requirements": ["5+ years experience", "React expertise"],
    "salary": 120000,
    "location": "Remote",
    "employerId": "507f1f77bcf86cd799439011",
    "isActive": true,
    "applicationCount": 15,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]`,
      example: `curl -X GET "http://localhost:3000/jobs/my-jobs" \\
  -H "Authorization: Bearer <accessToken>"`
    },
    {
      icon: Briefcase,
      method: 'GET',
      path: '/jobs',
      title: 'Get All Jobs (Public)',
      description: 'Retrieve all active job postings',
      auth: 'No Auth Required',
      response: `[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer",
    "description": "Looking for experienced developer...",
    "requirements": ["5+ years experience", "React expertise"],
    "salary": 120000,
    "location": "Remote",
    "employerId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Employer",
      "company": "Tech Corp"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]`,
      example: `curl -X GET "http://localhost:3000/jobs"`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Job Management Routes</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create and manage job postings with support for file uploads and AI integration.
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map(({ icon: Icon, method, path, title, description, auth, contentType, fields, response, example }) => (
          <div key={path} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {method}
                  </span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{path}</code>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
                <div className="flex space-x-4 mt-1">
                  <span className="text-sm text-blue-600 dark:text-blue-400">{auth}</span>
                  {contentType && (
                    <span className="text-sm text-purple-600 dark:text-purple-400">{contentType}</span>
                  )}
                </div>
              </div>
            </div>

            {fields && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Form Fields:</h4>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example:</h4>
