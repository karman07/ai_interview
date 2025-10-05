import React, { useState, useEffect } from 'react';
import { apiService, TimeSeriesData, AnalyticsStats, TopPage } from '../../services/api';
import { getTheme, COLORS } from '../../constants/colors';

interface AnalyticsProps {
  isDarkMode?: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ isDarkMode = false }) => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<'day' | 'hour'>('day');
  const [dateRange, setDateRange] = useState(30); // days

  const theme = getTheme(isDarkMode);

  // Calculate date range
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Prefer the consolidated dashboard endpoint which contains stats, topPages and timeSeries.
        // The API service may return either raw objects or a wrapper; unwrap safely.
        const unwrap = (res: any) => (res && typeof res === 'object' && 'data' in res ? res.data : res);

        try {
          const dashboardRes = await apiService.getDashboardData(startDate, endDate);
          const dashboard = unwrap(dashboardRes) || dashboardRes || {};

          if (dashboard.stats) setStats(dashboard.stats as AnalyticsStats);
          if (Array.isArray(dashboard.timeSeries)) setTimeSeriesData(dashboard.timeSeries as TimeSeriesData[]);
          if (Array.isArray(dashboard.topPages)) setTopPages(dashboard.topPages as TopPage[]);
          // do not set or render realtime data per user request
        } catch (dashErr) {
          // Fallback to individual endpoints if dashboard fails
          const [timeSeriesRes, statsRes, topPagesRes] = await Promise.all([
            apiService.getTimeSeriesData(startDate, endDate, interval),
            apiService.getAnalyticsStats(startDate, endDate),
            apiService.getTopPages(startDate, endDate)
          ]);

          setTimeSeriesData(Array.isArray(timeSeriesRes) ? timeSeriesRes : []);
          setStats(statsRes as AnalyticsStats);
          setTopPages(Array.isArray(topPagesRes) ? topPagesRes : []);
        }
        
      } catch (err: any) {
        console.error('❌ Analytics API Error:', err);
        console.error('🔍 Error details:', {
          message: err.message,
          code: err.code,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Provide more specific error messages
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          setError('Unable to connect to analytics server. Please ensure the backend server is running on http://localhost:3000');
        } else {
          setError(err.message || 'Failed to fetch analytics data');
        }
        
        // Set mock data for demonstration
        const mockTimeSeriesData = [
          { _id: '1', timestamp: '2024-10-01', pageViews: 245, uniqueVisitors: 89, sessions: 67 },
          { _id: '2', timestamp: '2024-10-02', pageViews: 312, uniqueVisitors: 156, sessions: 89 },
          { _id: '3', timestamp: '2024-10-03', pageViews: 189, uniqueVisitors: 78, sessions: 45 }
        ];
        
        const mockStats = {
          startDate,
          endDate,
          uniqueVisitors: 127,
          totalPageViews: 543,
          totalSessions: 89,
          averageSessionDuration: 245,
          bounceRate: 0.42,
          newVisitors: 67,
          returningVisitors: 60,
          pagesPerSession: 3.2
        };
        
        setTimeSeriesData(mockTimeSeriesData);
        setStats(mockStats);
  setTopPages([]);
        
        console.log('📝 Using mock analytics data:');
        console.log('📈 Mock time series:', mockTimeSeriesData);
        console.log('📊 Mock stats:', mockStats);
        
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [startDate, endDate, interval, dateRange]);

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

  // Ensure timeSeriesData is always an array
  const safeTimeSeriesData = Array.isArray(timeSeriesData) ? timeSeriesData : [];
  
  // Calculate max values for chart scaling
  const maxViews = safeTimeSeriesData.length > 0 ? Math.max(...safeTimeSeriesData.map(d => d.pageViews || 0), 0) : 0;
  const maxVisitors = safeTimeSeriesData.length > 0 ? Math.max(...safeTimeSeriesData.map(d => d.uniqueVisitors || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Analytics</h1>
          <p className="mt-2" style={{ color: theme.text.secondary }}>
            Detailed analytics and trends
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text.primary
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value as 'day' | 'hour')}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text.primary
            }}
          >
            <option value="day">Daily</option>
            <option value="hour">Hourly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.primary[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.green[100], color: COLORS.green[700] }}>
              +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>Total Page Views</h3>
          <p className="text-3xl font-bold" style={{ color: theme.text.primary }}>
            {stats?.totalPageViews?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.green[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.green[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.green[100], color: COLORS.green[700] }}>
              +8.2%
            </span>
          </div>
          <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>Unique Visitors</h3>
          <p className="text-3xl font-bold" style={{ color: theme.text.primary }}>
            {stats?.uniqueVisitors?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.orange[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.orange[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.green[100], color: COLORS.green[700] }}>
              +5.1%
            </span>
          </div>
          <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>Avg Session</h3>
          <p className="text-3xl font-bold" style={{ color: theme.text.primary }}>
            {Math.round((stats?.averageSessionDuration || 0) / 60)}m
          </p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.purple[100] }}>
              <svg className="w-6 h-6" style={{ color: COLORS.purple[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.red[100], color: COLORS.red[700] }}>
              -2.1%
            </span>
          </div>
          <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>Bounce Rate</h3>
          <p className="text-3xl font-bold" style={{ color: theme.text.primary }}>
            {stats?.bounceRate?.toFixed(1) || '0'}%
          </p>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-semibold mb-6" style={{ color: theme.text.primary }}>
          Views and Visitors Over Time
        </h3>
        
        {/* Simple Bar Chart */}
        <div className="h-80 flex items-end justify-center space-x-2 overflow-x-auto p-4" style={{ backgroundColor: theme.bgSecondary }}>
          {safeTimeSeriesData.length > 0 ? safeTimeSeriesData.slice(-15).map((data, index) => {
            const viewsHeight = maxViews > 0 ? (data.pageViews / maxViews) * 240 : 2;
            const visitorsHeight = maxVisitors > 0 ? (data.uniqueVisitors / maxVisitors) * 240 : 2;
            
            return (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1 max-w-12">
                {/* Views and Visitors Bars */}
                <div className="w-full flex justify-center items-end space-x-1 mb-3">
                  <div
                    className="w-4 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      backgroundColor: COLORS.primary[500],
                      height: `${Math.max(viewsHeight, 2)}px`,
                    }}
                    title={`Views: ${data.pageViews.toLocaleString()}`}
                  ></div>
                  <div
                    className="w-4 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      backgroundColor: COLORS.green[500],
                      height: `${Math.max(visitorsHeight, 2)}px`,
                    }}
                    title={`Visitors: ${data.uniqueVisitors.toLocaleString()}`}
                  ></div>
                </div>
                
                {/* Date Label */}
                <span className="text-xs text-center whitespace-nowrap transform -rotate-45 origin-center" style={{ color: theme.text.muted }}>
                  {new Date(data.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          }) : (
            <div className="w-full h-64 flex items-center justify-center" style={{ color: theme.text.muted }}>
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">for the selected period</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center items-center space-x-8 mt-6 pt-4 border-t" style={{ borderColor: theme.border }}>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.primary[500] }}></div>
            <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Page Views</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.bgSecondary, color: theme.text.muted }}>
              {safeTimeSeriesData.reduce((sum, d) => sum + (d.pageViews || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.green[500] }}></div>
            <span className="text-sm font-medium" style={{ color: theme.text.secondary }}>Unique Visitors</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: theme.bgSecondary, color: theme.text.muted }}>
              {safeTimeSeriesData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: theme.text.primary }}>Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.primary[100] }}>
                    <svg className="w-4 h-4" style={{ color: COLORS.primary[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span style={{ color: theme.text.secondary }}>Total Sessions</span>
                </div>
                <span className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {stats?.totalSessions?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.green[100] }}>
                    <svg className="w-4 h-4" style={{ color: COLORS.green[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span style={{ color: theme.text.secondary }}>Conversion Rate</span>
                </div>
                <span className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {((stats?.bounceRate || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.orange[100] }}>
                    <svg className="w-4 h-4" style={{ color: COLORS.orange[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span style={{ color: theme.text.secondary }}>Avg Session</span>
                </div>
                <span className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {Math.round((stats?.averageSessionDuration || 0) / 60)} min
                </span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: COLORS.red[100] }}>
                    <svg className="w-4 h-4" style={{ color: COLORS.red[600] }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span style={{ color: theme.text.secondary }}>Bounce Rate</span>
                </div>
                <span className="text-xl font-bold" style={{ color: theme.text.primary }}>
                  {stats?.bounceRate?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Data Summary</h3>
          <div className="space-y-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.info }}>
              <div className="mb-2" style={{ color: COLORS.primary[600] }}>
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: COLORS.primary[800] }}>Total Data Points</p>
              <p className="text-lg font-bold" style={{ color: COLORS.primary[900] }}>{safeTimeSeriesData.length}</p>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: theme.success }}>
              <div className="mb-2" style={{ color: COLORS.green[600] }}>
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: COLORS.green[800] }}>Tracking Period</p>
              <p className="text-lg font-bold" style={{ color: COLORS.green[900] }}>{dateRange} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="p-6 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Top Pages</h3>
        {topPages && topPages.length > 0 ? (
          <div className="space-y-3">
            {topPages.map((page, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 px-4 rounded-md" style={{ backgroundColor: theme.bgSecondary }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: theme.text.primary }}>{page.title || page.path}</div>
                  <div className="text-xs" style={{ color: theme.text.muted }}>{page.path}</div>
                </div>
                <div className="text-right">
                  <div style={{ color: theme.text.primary }} className="font-semibold">{page.views?.toLocaleString()}</div>
                  <div style={{ color: theme.text.secondary }} className="text-xs">{Math.round(page.averageTimeOnPage || 0)}s avg</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-center" style={{ color: theme.text.muted }}>No top pages available for the selected period</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;