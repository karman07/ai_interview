import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardNavbar } from './components/layout/DashboardNavbar';
import { DashboardOverview } from './pages/DashboardOverview';
import { JobManagement } from './pages/JobManagement';
import { ApplicationManagement } from './pages/ApplicationManagement';
import { AICandidates } from './pages/AICandidates';
import { EmployerRequests } from './pages/EmployerRequests';
import { ProfileSettings } from './pages/ProfileSettings';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case 'jobs':
        return <JobManagement />;
      case 'applications':
        return <ApplicationManagement />;
      case 'candidates':
        return <AICandidates />;
      case 'requests':
        return <EmployerRequests />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNavbar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;