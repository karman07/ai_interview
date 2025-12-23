import { useAuth } from '../contexts/AuthContext';

export const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  
  const checkToken = () => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    
    console.log('=== AUTH DEBUG ===');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Access Token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null');
    console.log('Stored User:', storedUser ? JSON.parse(storedUser) : 'null');
    console.log('==================');
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
        Authentication Debug
      </h3>
      <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
        <p>Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p>User: {user?.name || 'None'}</p>
        <p>Email: {user?.email || 'None'}</p>
      </div>
      <button
        onClick={checkToken}
        className="mt-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
      >
        Check Console
      </button>
    </div>
  );
};