import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTheme, COLORS } from '../constants/colors';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Courses from './pages/Courses';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
  const theme = getTheme(isDarkMode);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/dashboard', 
      name: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      path: '/dashboard/analytics', 
      name: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ) 
    },
    { 
      path: '/dashboard/courses', 
      name: 'Courses', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ) 
    },
    { 
      path: '/dashboard/subscriptions', 
      name: 'Subscriptions', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) 
    },
    { 
      path: '/dashboard/payments', 
      name: 'Payments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.bg }}>
      {/* Sidebar */}
      <div 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} shadow-lg transition-all duration-300 flex flex-col`}
        style={{ backgroundColor: theme.sidebar }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                Analytics Panel
              </h1>
              <p className="text-sm" style={{ color: theme.text.muted }}>
                Welcome, {user?.name}
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
              style={{ color: theme.text.secondary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? ''
                        : 'hover:bg-opacity-10 hover:bg-gray-500'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? theme.sidebarActive : 'transparent',
                    color: isActive ? COLORS.primary[600] : theme.text.primary
                  })}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-t" style={{ borderColor: theme.border }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors border"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text.primary
            }}
          >
            {isDarkMode ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {isSidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {isSidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-t" style={{ borderColor: theme.border }}>
          <div className="flex items-center justify-between">
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} flex items-center space-x-3`}>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.primary[600] }}
              >
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                  {user?.name}
                </p>
                <p className="text-xs" style={{ color: theme.text.muted }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              style={{ color: theme.text.muted }}
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div 
          className="shadow-sm px-6 py-4 border-b"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              Dashboard
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                  style={{ color: theme.text.secondary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5v-6h5v6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: theme.bgSecondary }}>
          <Routes>
            <Route path="" element={<Overview isDarkMode={isDarkMode} />} />
            <Route path="analytics" element={<Analytics isDarkMode={isDarkMode} />} />
            <Route path="courses" element={<Courses isDarkMode={isDarkMode} />} />
            <Route path="subscriptions" element={<Subscriptions isDarkMode={isDarkMode} />} />
            <Route path="payments" element={<Payments isDarkMode={isDarkMode} />} />
            <Route path="settings" element={<Settings isDarkMode={isDarkMode} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;