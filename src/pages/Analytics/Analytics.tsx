import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Dashboard Removed
          </h1>
          <p className="text-gray-600 mb-4">
            The analytics dashboard has been removed as requested. 
            Analytics tracking is still active in the background with improved rate limiting.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Improvements made:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• API calls now have 1-minute cooldown to prevent excessive requests</li>
              <li>• Page views are counted only once per actual page change</li>
              <li>• Duplicate tracking prevention implemented</li>
              <li>• Better session management and rate limiting</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;