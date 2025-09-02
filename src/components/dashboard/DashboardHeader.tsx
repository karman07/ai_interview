import React from "react";
import { CloudArrowUpIcon, ArrowDownTrayIcon } from "./DashboardIcons";

interface DashboardHeaderProps {
  onUploadClick: () => void;
  onDownload: (format: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onUploadClick, onDownload }) => (
  <div className="mb-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
          Resume Analytics Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Transform your career with data-driven insights</p>
      </div>
      <div className="flex gap-3">
        <div className="relative">
          <select 
            onChange={(e) => onDownload(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Download Data</option>
            <option value="json">JSON Format</option>
            <option value="csv">CSV Format</option>
          </select>
          <ArrowDownTrayIcon className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={onUploadClick}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          Upload Resume
        </button>
      </div>
    </div>
  </div>
);

export default DashboardHeader;
