import { User, Edit } from 'lucide-react';

export const ProfilePage = () => {
  const endpoints = [
    {
      icon: User,
      method: 'GET',
      path: '/users/profile',
      title: 'Get Profile',
      description: 'Retrieve current user profile information',
      auth: 'Access Token Required',
      response: `{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Employer",
  "email": "john@company.com",
  "role": "employer",
  "company": "Tech Corp",
  "industry": "Technology",
  "profileImageUrl": "/uploads/profile-images/profile_1234567890.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}`,
      example: `curl -X GET "http://localhost:3000/users/profile" \\
  -H "Authorization: Bearer <accessToken>"`
    },
    {
      icon: Edit,
      method: 'PATCH',
      path: '/users/profile',
      title: 'Update Profile',
      description: 'Update user profile with optional image upload',
      auth: 'Access Token Required',
      contentType: 'multipart/form-data',
      fields: `{
  "name": "string (optional)",
  "company": "string (optional)",
  "industry": "string (optional)",
  "jobDescription": "string (optional)",
  "profileImage": "File (optional)"
}`,
      example: `curl -X PATCH "http://localhost:3000/users/profile" \\
  -H "Authorization: Bearer <accessToken>" \\
  -F "name=John Updated" \\
  -F "company=Updated Tech Corp" \\
  -F "industry=Software Development" \\
  -F "profileImage=@profile.jpg"`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">User Profile Routes</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage employer profiles with support for image uploads and company information.
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
                    method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
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
