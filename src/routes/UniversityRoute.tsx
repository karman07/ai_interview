import { Navigate, Outlet } from 'react-router-dom';
import routes from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function UniversityRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    );
  }

  // If user is not university-affiliated, redirect to main dashboard
  if (!user?.universityId) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return <Outlet />;
}
