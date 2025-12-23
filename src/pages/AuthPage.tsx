import { Shield, LogIn, RefreshCw, LogOut } from 'lucide-react';

export const AuthPage = () => {
  const endpoints = [
    {
      icon: Shield,
      method: 'POST',
      path: '/auth/register',
      title: 'Register Employer',
      description: 'Register a new employer account',
      auth: 'No Auth Required',
      body: `{
  "name": "John Employer",
  "email": "john@company.com",
  "password": "securePassword123",
  "role": "employer",
  "company": "Tech Corp",
  "industry": "Technology"
}`,
      example: `curl -X POST "http://localhost:3000/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Employer",
    "email": "john@company.com",
    "password": "securePassword123",
    "role": "employer",
    "company": "Tech Corp",
    "industry": "Technology"
  }'`
    },
    {
      icon: LogIn,
      method: 'POST',
      path: '/auth/login',
      title: 'Login',
      description: 'Authenticate employer and get tokens',
      auth: 'No Auth Required',
      body: `{
  "email": "john@company.com",
  "password": "securePassword123"
}`,
      response: `{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Employer",
    "email": "john@company.com",
    "role": "employer",
    "company": "Tech Corp"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
      example: `curl -X POST "http://localhost:3000/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@company.com",
    "password": "securePassword123"
  }'`
    },
    {
      icon: RefreshCw,
      method: 'POST',
      path: '/auth/refresh',
      title: 'Refresh Token',
      description: 'Get new access and refresh tokens',
      auth: 'Refresh Token Required',
      example: `curl -X POST "http://localhost:3000/auth/refresh" \\
  -H "Authorization: Bearer <refreshToken>"`
    },
    {
      icon: LogOut,
      method: 'POST',
      path: '/auth/logout',
      title: 'Logout',
      description: 'Invalidate current session',
      auth: 'Access Token Required',
      example: `curl -X POST "http://localhost:3000/auth/logout" \\
  -H "Authorization: Bearer <accessToken>"`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Authentication Routes</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Secure JWT-based authentication system for employers with refresh token support.
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

            {body && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Request Body:</h4>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example:</h4>
