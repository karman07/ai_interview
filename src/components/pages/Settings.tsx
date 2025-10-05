import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, HealthStatus, DatabaseStatus, VisitorStats, Session } from '../../services/api';
import { getTheme, COLORS } from '../../constants/colors';

interface SettingsProps {
  isDarkMode?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode = false }) => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const theme = getTheme(isDarkMode);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      const [health, db, visStats, sessions] = await Promise.all([
        apiService.getHealthStatus(),
        apiService.getDatabaseStatus(),
        apiService.getMyVisitorStats(),
        apiService.getSessions(5, 0) // Get first 5 sessions
      ]);
      setHealthStatus(health);
      setDbStatus(db);
      setVisitorStats(visStats);
      setRecentSessions(sessions.sessions);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Settings</h1>
        <p className="mt-2" style={{ color: theme.text.secondary }}>
          System configuration and account settings
        </p>
      </div>

      {/* User Profile */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Profile Information</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: COLORS.primary[600] }}
            >
              <span className="text-white font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-medium" style={{ color: theme.text.primary }}>{user?.name}</h4>
              <p style={{ color: theme.text.secondary }}>{user?.email}</p>
              <p className="text-sm" style={{ color: theme.text.muted }}>Admin User</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>System Health</h3>
            <p className="text-sm" style={{ color: theme.text.secondary }}>Monitor system status and connectivity</p>
          </div>
          <button
            onClick={checkSystemHealth}
            disabled={loading}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: COLORS.primary[600] }}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border rounded-lg" style={{ borderColor: theme.border }}>
              <div className={`mb-4 ${
                healthStatus?.status === 'healthy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {healthStatus?.status === 'healthy' ? (
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h4 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>API Health</h4>
              <p className={`text-sm ${
                healthStatus?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthStatus?.status || 'Unknown'}
              </p>
            </div>
            
            <div className="text-center p-6 border rounded-lg" style={{ borderColor: theme.border }}>
              <div className={`mb-4 ${
                dbStatus?.connected ? 'text-green-500' : 'text-red-500'
              }`}>
                {dbStatus?.connected ? (
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h4 className="text-lg font-medium mb-2" style={{ color: theme.text.primary }}>Database</h4>
              <p className={`text-sm ${
                dbStatus?.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {dbStatus?.connected ? 'Connected' : 'Disconnected'}
              </p>
              {dbStatus?.latency && (
                <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>
                  Latency: {dbStatus.latency}ms
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Statistics */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Visitor Statistics</h3>
          <p className="text-sm" style={{ color: theme.text.secondary }}>Overview of your visitor data</p>
        </div>
        <div className="p-6">
          {visitorStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {visitorStats.total.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: theme.text.secondary }}>Total Visitors</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {visitorStats.unique.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: theme.text.secondary }}>Unique Visitors</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {visitorStats.newVisitors.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: theme.text.secondary }}>New Visitors</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                  {visitorStats.returning.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: theme.text.secondary }}>Returning</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: theme.text.secondary }}>
              Loading visitor statistics...
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Recent Sessions</h3>
          <p className="text-sm" style={{ color: theme.text.secondary }}>Latest user sessions</p>
        </div>
        <div className="p-6">
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary[100] }}>
                      <svg className="w-5 h-5" style={{ color: COLORS.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: theme.text.primary }}>
                        Session {session.sessionId}
                      </div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {session.country} • {session.device} • {session.browser}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {session.pageViews} pages
                    </div>
                    <div className="text-xs" style={{ color: theme.text.secondary }}>
                      {new Date(session.startTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: theme.text.secondary }}>
              Loading session data...
            </div>
          )}
        </div>
      </div>

      {/* API Configuration */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>API Configuration</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                API Base URL
              </label>
              <input
                type="text"
                value="http://localhost:3000"
                readOnly
                className="w-full px-3 py-2 border rounded-md"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                  color: theme.text.secondary
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>
                Environment
              </label>
              <input
                type="text"
                value="Development"
                readOnly
                className="w-full px-3 py-2 border rounded-md"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                  color: theme.text.secondary
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Endpoints */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Available API Endpoints</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { method: 'GET', path: '/analytics/stats', description: 'Get analytics statistics' },
              { method: 'GET', path: '/analytics/pages/top', description: 'Get top pages by views' },
              { method: 'GET', path: '/analytics/realtime', description: 'Get real-time analytics' },
              { method: 'GET', path: '/analytics/timeseries', description: 'Get time series data' },
              { method: 'GET', path: '/analytics/dashboard', description: 'Get complete dashboard data' },
              { method: 'GET', path: '/analytics/visitors/me', description: 'Get visitors data' },
              { method: 'GET', path: '/analytics/visitors/me/stats', description: 'Get visitor statistics' },
              { method: 'GET', path: '/analytics/health', description: 'Health check endpoint' },
              { method: 'GET', path: '/analytics/db-check', description: 'Database connection check' }
            ].map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm" style={{ color: theme.text.primary }}>{endpoint.path}</code>
                </div>
                <span className="text-sm" style={{ color: theme.text.secondary }}>{endpoint.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: theme.border }}>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>About</h3>
        </div>
        <div className="p-6">
          <div className="text-sm space-y-2" style={{ color: theme.text.secondary }}>
            <p><strong style={{ color: theme.text.primary }}>Application:</strong> Analytics Admin Panel</p>
            <p><strong style={{ color: theme.text.primary }}>Version:</strong> 1.0.0</p>
            <p><strong style={{ color: theme.text.primary }}>Framework:</strong> React 18 with TypeScript</p>
            <p><strong style={{ color: theme.text.primary }}>Styling:</strong> Tailwind CSS</p>
            <p><strong style={{ color: theme.text.primary }}>API Client:</strong> Axios</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;