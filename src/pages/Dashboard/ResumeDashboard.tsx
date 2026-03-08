import React, { useState, useRef, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";

import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import StatCard from "@/components/dashboad/StatCard";
import { usePricing } from "@/contexts/PricingContext";
import DetailedResumeCard from "@/components/dashboad/DetailedResumeCard";
import ResumeDetails from "@/components/dashboad/ResumeDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog/dialog";

import { Resume } from '@/types/Resume';

// (StatCard and DetailedResumeCard props live in their component files)

// Icons (simple SVG replacements)
const CloudArrowUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// Eye and trending-down icons are provided by the centralized Icons file when needed.

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BriefcaseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ResumeDashboard: React.FC = () => {
  const { resumes, uploadResume } = useResume();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { setShowPricing } = usePricing();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJDFile] = useState<File | null>(null);
  const [jdText, setJDText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  // Chart colors
  // Vibrant & Diverse Palette for Charts
  const COLORS = [
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#EF4444', // Rose
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899'  // Pink
  ];

  // Safe wrapper in case context provides undefined
  const safeResumes: Resume[] = Array.isArray(resumes) ? resumes : [];

  // Calculate statistics
  const totalResumes = safeResumes.length;
  const totalFlags = totalResumes ? safeResumes.reduce((acc, r) => acc + ((r.analytics?.key_takeaways?.green_flags?.length || 0) + (r.analytics?.key_takeaways?.red_flags?.length || 0)), 0) : 0;

  // Chart data preparation
  const performanceData = safeResumes.map((r, index) => {
    const cvQualityScore = Math.round(r.analytics?.cv_quality?.overall_score || 0);
    const jdMatchScore = Math.round(r.analytics?.jd_match?.overall_score || 0);
    const greenFlags = r.analytics?.key_takeaways?.green_flags?.length || 0;
    const redFlags = r.analytics?.key_takeaways?.red_flags?.length || 0;
    return {
      name: `Resume ${index + 1}`,
      date: new Date(r.createdAt).toLocaleDateString(),
      cvQuality: cvQualityScore,
      jdMatch: jdMatchScore,
      greenFlags: greenFlags,
      redFlags: redFlags
    };
  });

  const radarData = safeResumes.length > 0 && safeResumes[0].analytics?.cv_quality?.subscores ? safeResumes[0].analytics.cv_quality.subscores.map(sub => ({
    dimension: sub.dimension.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: (sub.score / sub.max_score) * 100,
    maxScore: 100,
    evidence: sub.evidence
  })) : [];

  const pieData = safeResumes.length > 0 ? [
    { name: 'CV Quality', value: safeResumes[0].analytics?.cv_quality?.overall_score || 0, color: COLORS[0] },
    { name: 'JD Match', value: safeResumes[0].analytics?.jd_match?.overall_score || 0, color: COLORS[2] },
    { name: 'Green Flags', value: (safeResumes[0].analytics?.key_takeaways?.green_flags?.length || 0) * 10, color: COLORS[1] },
    { name: 'Red Flags', value: (safeResumes[0].analytics?.key_takeaways?.red_flags?.length || 0) * 10, color: COLORS[3] }
  ].filter(d => d.value > 0) : [];

  // Calculate resume limit from subscription plan features
  const resumeLimit = useMemo(() => {
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const limitFeature = user.subscriptionPlan.features.find(f => f.name.toLowerCase().includes('resume upload limit'));
      if (limitFeature && typeof limitFeature.value === 'number') {
        return limitFeature.value;
      }
    }

    // Fallback logic based on specific plan names
    const planName = (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object')
      ? (user.subscriptionPlan as any).name
      : user?.subscriptionPlan;

    if (user?.subscriptionStatus === 'active' || (planName && planName !== 'free_tier_in')) {
      if (planName?.toString().includes('pro_tier_200')) return 40;
      if (planName?.toString().includes('pro_tier_100')) return 15;
      if (planName?.toString().includes('enterprise')) return 1000;
    }

    return 5; // Default free tier
  }, [user]);

  const isAtLimit = totalResumes >= resumeLimit;

  const handleUpload = async (): Promise<void> => {
    if (!resumeFile) return;
    try {
      const files: File[] = [resumeFile];
      if (jdFile) files.push(jdFile);
      const uploadedResumeData = await uploadResume(files, jdText);

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Resume uploaded successfully',
        message: `${resumeFile.name} has been analyzed and processed.`,
      });

      // Close upload modal and open detailed view with the uploaded resume
      setIsUploadOpen(false);
      setResumeFile(null);
      setJDFile(null);
      setJDText('');

      // Show the detailed resume view (same as clicking eye button)
      setSelectedResume(uploadedResumeData);
    } catch (err: any) {
      console.error('Upload failed', err);

      // Check for limit exhaustion (400 error)
      if (err.response?.status === 400 || err.status === 400) {
        const errorMsg = err.response?.data?.message || err.message || '';

        // Show pricing if it's a limit error
        if (errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('plan')) {
          setIsUploadOpen(false);
          setShowPricing(true);
          addNotification({
            type: 'error',
            title: 'Limit Reached',
            message: 'You have reached your resume upload limit. Please upgrade your plan to continue.',
          });
          return;
        }
      }

      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: 'Failed to upload and analyze resume. Please try again.',
      });
    }
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setResumeFile(droppedFile);
  };

  const handleJDDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setJDFile(droppedFile);
  };

  const handleDownload = (format: string = 'json'): void => {
    let data: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        const csvData = safeResumes.map(r => ({
          filename: r.filename,
          date: new Date(r.createdAt).toLocaleDateString(),
          cv_quality: r.analytics?.cv_quality?.overall_score || 0,
          jd_match: r.analytics?.jd_match?.overall_score || 0,
          green_flags: r.analytics?.key_takeaways?.green_flags?.length || 0,
          red_flags: r.analytics?.key_takeaways?.red_flags?.length || 0
        }));
        const csvContent = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');
        data = csvContent;
        filename = 'resume-analysis.csv';
        mimeType = 'text/csv';
        break;
      default:
        data = JSON.stringify(resumes, null, 2);
        filename = 'resume-analysis.json';
        mimeType = 'application/json';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ...inline components removed - using imported `StatCard` and `DetailedResumeCard`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Resume Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">Transform your career with data-driven insights</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Usage Indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interview Capacity</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isAtLimit ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {totalResumes} / {resumeLimit}
                  </span>
                </div>
                <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isAtLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min((totalResumes / resumeLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <select
                    onChange={(e) => handleDownload(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Download Data</option>
                    <option value="json">JSON Format</option>
                    <option value="csv">CSV Format</option>
                  </select>
                  <ArrowDownTrayIcon className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                <button
                  onClick={() => isAtLimit ? setShowPricing(true) : setIsUploadOpen(true)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md ${isAtLimit
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  title={isAtLimit ? "You've reached your plan limit. Upgrade for more storage." : "Upload New Resume"}
                >
                  {isAtLimit ? <TrendingUpIcon className="w-5 h-5" /> : <CloudArrowUpIcon className="w-5 h-5" />}
                  {isAtLimit ? 'Upgrade Plan' : 'Upload Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Resumes"
            value={totalResumes}
            icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
            subtitle="Uploaded & analyzed"
          />
          <StatCard
            title="Total Flags"
            value={totalFlags}
            icon={<StarIcon className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
            subtitle="Combined insights"
          />
          <StatCard
            title="CV Quality"
            value={safeResumes[0]?.analytics?.cv_quality?.overall_score || 0}
            icon={<AcademicCapIcon className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
            subtitle="Content & structure"
          />
          <StatCard
            title="JD Match"
            value={safeResumes[0]?.analytics?.jd_match?.overall_score || 0}
            icon={<BriefcaseIcon className="w-5 h-5 text-orange-600" />}
            color="bg-orange-50"
            subtitle="Requirements alignment"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 sm:mb-8 w-full sm:w-fit overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'performance', label: 'Performance', icon: TrendingUpIcon },
            { id: 'details', label: 'Detailed Analysis', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Performance Trends */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-3">
                <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                Performance Trends
              </h3>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorCV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorJD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="cvQuality" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCV)" strokeWidth={3} name="CV Quality Score" />
                    <Area type="monotone" dataKey="jdMatch" stroke="#10B981" fillOpacity={1} fill="url(#colorJD)" strokeWidth={3} name="JD Match Score" />
                    <Area type="monotone" dataKey="greenFlags" stroke="#F59E0B" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={3} name="Green Flags" />
                    <Area type="monotone" dataKey="redFlags" stroke="#EF4444" fillOpacity={1} fill="url(#colorRed)" strokeWidth={3} name="Red Flags" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No performance data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Score Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Score Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && radarData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Skills Radar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">CV Quality Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Scores */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Detailed Breakdown</h3>
              <div className="space-y-4">
                {radarData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.dimension}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(item.score)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6 sm:space-y-8">
            {resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {safeResumes.map((resume) => (
                  <DetailedResumeCard key={resume.id || resume._id} resume={resume} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Resumes Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first resume to get started with analysis</p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => setIsUploadOpen(false)} />
              <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 mx-4">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-white mb-2">
                      Upload Resume & JD
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Upload your resume in PDF, DOC, or DOCX format for analysis. Optionally, upload a Job Description file or paste JD text for better matching.
                    </p>

                    {/* Resume File Input */}
                    <div
                      className={`mt-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : isAtLimit
                          ? 'border-red-100 dark:border-red-900/20 bg-red-50/10 dark:bg-red-900/5 cursor-not-allowed'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      onClick={() => !isAtLimit && resumeInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleResumeDrop}
                    >
                      <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                      {resumeFile ? (
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">{resumeFile.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Click to choose a different file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Drop your resume here
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            or click to browse • PDF, DOC, DOCX up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>

                    {/* JD File Input */}
                    <div
                      className={`mt-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      onClick={() => jdInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleJDDrop}
                    >
                      <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-blue-400 dark:text-blue-500" />
                      {jdFile ? (
                        <div>
                          <p className="text-lg font-medium text-gray-900">{jdFile.name}</p>
                          <p className="text-sm text-gray-500">Click to choose a different file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop JD file here (optional)
                          </p>
                          <p className="text-sm text-gray-500">
                            or click to browse • PDF, DOC, DOCX up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={jdInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setJDFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>

                    {/* JD Text Input */}
                    <div className="mt-4">
                      <label htmlFor="jdText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Paste JD Text (optional)
                      </label>
                      <textarea
                        id="jdText"
                        value={jdText}
                        onChange={(e) => setJDText(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Paste job description text here for better matching..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={!resumeFile}
                    className="inline-flex justify-center w-full px-6 py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Upload & Analyze
                  </button>
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    className="inline-flex justify-center w-full px-6 py-3 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Detail View */}
        <Dialog open={!!selectedResume} onOpenChange={(open) => !open && setSelectedResume(null)}>
          <DialogContent className="max-w-none w-[95vw] max-h-[96vh] overflow-y-auto p-0 bg-white dark:bg-[#0D1117] border-none shadow-2xl">
            <div className="sr-only">
              <DialogHeader>
                <DialogTitle>Resume Details</DialogTitle>
                <DialogDescription>
                  Detailed analysis and scoring of the selected resume.
                </DialogDescription>
              </DialogHeader>
            </div>
            {selectedResume && <ResumeDetails resume={selectedResume} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumeDashboard;