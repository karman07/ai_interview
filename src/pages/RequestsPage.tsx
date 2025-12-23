import { Send, List } from 'lucide-react';

export const RequestsPage = () => {
  const endpoints = [
    {
      icon: Send,
      method: 'POST',
      path: '/jobs/request-employee',
      title: 'Request Specific Employee',
      description: 'Proactively reach out to ideal candidates',
      auth: 'Employer Only',
      body: `{
  "jobId": "507f1f77bcf86cd799439012",
  "employeeId": "507f1f77bcf86cd799439014",
  "message": "Your React and Node.js experience makes you perfect for this role!"
}`,
      response: `{
  "_id": "507f1f77bcf86cd799439015",
  "jobId": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Senior Full Stack Developer"
  },
  "employerId": "507f1f77bcf86cd799439011",
  "employeeId": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Jane Developer",
    "email": "jane@example.com"
  },
  "status": "pending",
  "message": "Your React and Node.js experience makes you perfect for this role!",
  "createdAt": "2024-01-17T11:20:00.000Z"
}`,
      example: `curl -X POST "http://localhost:3000/jobs/request-employee" \\
  -H "Authorization: Bearer <accessToken>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobId": "507f1f77bcf86cd799439012",
    "employeeId": "507f1f77bcf86cd799439014",
    "message": "Your React and Node.js experience makes you perfect for this role!"
  }'`
    },
    {
      icon: List,
      method: 'GET',
      path: '/jobs/my-requests',
      title: 'Get My Requests',
      description: 'Retrieve all employer requests sent',
      auth: 'Employer Only',
      response: `[
  {
    "_id": "507f1f77bcf86cd799439015",
    "jobId": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Full Stack Developer"
    },
    "employerId": "507f1f77bcf86cd799439011",
    "employeeId": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Developer",
      "email": "jane@example.com"
    },
    "status": "accepted",
    "message": "Your React and Node.js experience makes you perfect for this role!",
    "employeeResponse": "Thank you for reaching out! I'm very interested in this opportunity.",
    "createdAt": "2024-01-17T11:20:00.000Z",
    "updatedAt": "2024-01-18T09:45:00.000Z"
  }
]`,
      example: `curl -X GET "http://localhost:3000/jobs/my-requests" \\
  -H "Authorization: Bearer <accessToken>"`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Employer Request System Routes</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Proactively reach out to ideal candidates and track request status.
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map(({ icon: Icon, method, path, title, description, auth, body, response, example }) => (
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
                <span className="text-sm text-blue-600 dark:text-blue-400">{auth}</span>
              </div>
            </div>

            {body && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Request Body:</h4>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example:</h4>
