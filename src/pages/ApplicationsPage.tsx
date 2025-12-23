import { FileText, Bot, CheckCircle } from 'lucide-react';

export const ApplicationsPage = () => {
  const endpoints = [
    {
      icon: FileText,
      method: 'GET',
      path: '/jobs/:id/applications',
      title: 'Get Job Applications',
      description: 'Retrieve all applications for a specific job',
      auth: 'Employer Only (Job Owner)',
      response: `[
  {
    "_id": "507f1f77bcf86cd799439013",
    "jobId": "507f1f77bcf86cd799439012",
    "employeeId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Developer",
      "email": "jane@example.com",
      "resumeUrl": "/uploads/resumes/resume_1234567890.pdf"
    },
    "status": "pending",
    "coverLetter": "I am excited to apply for this position...",
    "createdAt": "2024-01-16T09:15:00.000Z"
  }
]`,
      example: `curl -X GET "http://localhost:3000/jobs/507f1f77bcf86cd799439012/applications" \\
  -H "Authorization: Bearer <accessToken>"`
    },
    {
      icon: Bot,
      method: 'GET',
      path: '/jobs/:id/best-candidates',
      title: 'Get AI-Powered Best Candidates',
      description: 'Get AI-ranked candidates with match scores and insights',
      auth: 'Employer Only (Job Owner)',
      response: `{
  "matches": [
    {
      "resume_id": "507f1f77bcf86cd799439014",
      "resume_filename": "jane_developer_resume.pdf",
      "match_score": 0.92,
      "missing_keywords": ["Docker", "Kubernetes"],
      "suggestions": [
        "Consider highlighting containerization experience",
        "Emphasize cloud deployment skills"
      ],
      "resume_content": "Experienced Full Stack Developer with 6 years..."
    }
  ],
  "total": 15,
  "showing": 10
}`,
      example: `curl -X GET "http://localhost:3000/jobs/507f1f77bcf86cd799439012/best-candidates" \\
  -H "Authorization: Bearer <accessToken>"`
    },
    {
      icon: CheckCircle,
      method: 'PATCH',
      path: '/jobs/applications/:id/status/:status',
      title: 'Update Application Status',
      description: 'Update the status of a job application',
      auth: 'Employer Only (Job Owner)',
      params: `{
  "id": "Application ID",
  "status": "'pending' | 'accepted' | 'rejected'"
}`,
      example: `curl -X PATCH "http://localhost:3000/jobs/applications/507f1f77bcf86cd799439013/status/accepted" \\
  -H "Authorization: Bearer <accessToken>"`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Management Routes</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage job applications with AI-powered candidate ranking and status tracking.
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map(({ icon: Icon, method, path, title, description, auth, params, response, example }) => (
          <div key={path} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {method}
                  </span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{path}</code>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
                <span className="text-sm text-blue-600 dark:text-blue-400">{auth}</span>
              </div>
            </div>

            {params && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Parameters:</h4>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example:</h4>
