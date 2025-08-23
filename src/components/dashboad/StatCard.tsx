import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from '../icons/Icons';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900">{Math.round(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default StatCard;
