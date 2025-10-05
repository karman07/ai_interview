import React, { useState, useEffect } from 'react';
import { apiService, DashboardData } from '../../services/api';
import { getTheme, COLORS } from '../../constants/colors';

interface OverviewProps {
  isDarkMode?: boolean;
}

const Overview: React.FC<OverviewProps> = ({ isDarkMode = false }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = getTheme(isDarkMode);

  // Date range for last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getDashboardData(startDate, endDate);
        const unwrap = (r: any) => (r && typeof r === 'object' && 'data' in r ? r.data : r);
        const payload = unwrap(res) || res || null;
        setDashboardData(payload as DashboardData | null);
      } catch (err: any) {
        console.error('Dashboard API Error:', err);
        // Provide more specific error messages
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Unable to connect to analytics server. Please ensure the backend server is running on http://localhost:3000');
        } else {
          setError(err.message || 'Failed to fetch dashboard data');
        }
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary[600] }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4" style={{ backgroundColor: theme.error, borderColor: theme.border }}>
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>Error</h3>
            <div className="mt-2 text-sm" style={{ color: theme.text.secondary }}>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  
  const overviewCards = [
    {
      title: 'Total Page Views',
      value: stats?.totalPageViews?.toLocaleString() || '0',
      change: '+12.5%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Unique Visitors',
      value: stats?.uniqueVisitors?.toLocaleString() || '0',
      change: '+8.2%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Total Sessions',
      value: stats?.totalSessions?.toLocaleString() || '0',
      change: '+15.3%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Pages Per Session',
      value: stats?.pagesPerSession?.toFixed(1) || '0',
      change: '+2.1%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Overview</h1>
        <p className="mt-2" style={{ color: theme.text.secondary }}>
          Your analytics dashboard for the last 30 days
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <div
            key={index}
            className="p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: COLORS.primary[600] }}>{card.icon}</span>
              <span className="text-sm font-medium" style={{ color: COLORS.green[600] }}>{card.change}</span>
            </div>
            <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
              {card.title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Duration */}
        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span style={{ color: theme.text.secondary }}>Average Session Duration</span>
              <span className="font-semibold" style={{ color: theme.text.primary }}>
                {Math.round((stats?.averageSessionDuration || 0) / 60)} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: theme.text.secondary }}>Bounce Rate</span>
              <span className="font-semibold" style={{ color: theme.text.primary }}>
                {((stats?.bounceRate || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: theme.text.secondary }}>Pages Per Session</span>
              <span className="font-semibold" style={{ color: theme.text.primary }}>
                {stats?.pagesPerSession?.toFixed(1) || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Top Pages</h3>
          <div className="space-y-3">
            {dashboardData?.topPages?.slice(0, 5).map((page, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text.primary }}>
                    {page.path}
                  </p>
                  <p className="text-xs" style={{ color: theme.text.muted }}>
                    {page.uniqueVisitors} unique visitors
                  </p>
                </div>
                <div className="ml-4 text-sm font-semibold" style={{ color: theme.text.primary }}>
                  {page.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.success }}>
            <div className="mb-2" style={{ color: COLORS.green[600] }}>
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.green[800] }}>API Status</p>
            <p className="text-xs" style={{ color: COLORS.green[600] }}>Operational</p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.info }}>
            <div className="mb-2" style={{ color: COLORS.primary[600] }}>
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.primary[800] }}>Database</p>
            <p className="text-xs" style={{ color: COLORS.primary[600] }}>Connected</p>
          </div>
          {/* Real-time card intentionally removed per user request */}
        </div>
      </div>
    </div>
  );
};

export default Overview;