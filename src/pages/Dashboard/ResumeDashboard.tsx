import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

const AlertCircle: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle2: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRight: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const ResumeDashboard: React.FC = () => {
  const { resumes, uploadResume, isLoading } = useResume();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { setShowPricing } = usePricing();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [autoOpenBuilder, setAutoOpenBuilder] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJDFile] = useState<File | null>(null);
  const [jdText, setJDText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  // University data for student users
  const [universityLimits, setUniversityLimits] = useState<{ resumeLimit: number; interviewLimit: number; name: string } | null>(null);
  useEffect(() => {
    if (user?.role === 'student' && user?.universityId) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/universities/${user.universityId}`)
          .then(res => {
            if (res.data?.resumeLimit != null) {
              setUniversityLimits({
                resumeLimit: res.data.resumeLimit,
                interviewLimit: res.data.interviewLimit,
                name: res.data.name,
              });
            }
          })
          .catch(() => { /* silently ignore — fallback to plan limits */ });
      });
    }
  }, [user?.role, user?.universityId]);

  // Track hovered chart point for stable open-button below chart
  const [hoveredPoint, setHoveredPoint] = useState<{ resumeIndex: number; fullName: string; cvQuality: number; jdMatch: number } | null>(null);

  // Double-click detection for chart points
  const lastClickRef = useRef<{ resumeIndex: number; time: number } | null>(null);

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
    const shortName = (r.filename || `Resume ${index + 1}`).replace(/\.[^/.]+$/, '').slice(0, 16) + ((r.filename || '').replace(/\.[^/.]+$/, '').length > 16 ? '…' : '');
    return {
      name: shortName,
      fullName: r.filename || `Resume ${index + 1}`,
      date: new Date(r.createdAt).toLocaleDateString(),
      cvQuality: cvQualityScore,
      jdMatch: jdMatchScore,
      greenFlags: greenFlags,
      redFlags: redFlags,
      resumeIndex: index,
    };
  });

  const radarData = safeResumes.length > 0 && safeResumes[0].analytics?.cv_quality?.subscores ? safeResumes[0].analytics.cv_quality.subscores.map(sub => ({
    dimension: sub.dimension.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: (sub.score / sub.max_score) * 100,
    maxScore: 100,
    evidence: sub.evidence
  })) : [];

  // Score distribution: one slice per resume, sized by CV quality score
  const pieData = safeResumes.map((r, i) => ({
    name: (r.filename || `Resume ${i + 1}`).replace(/\.[^/.]+$/, '').slice(0, 20),
    value: Math.round(r.analytics?.cv_quality?.overall_score || 0) || 1,
    color: COLORS[i % COLORS.length],
    resumeIndex: i,
  }));

  // Calculate resume limit from subscription plan features (or university for students)
  const resumeLimit = useMemo(() => {
    // Students: use their university's configured limit
    if (user?.role === 'student') {
      return universityLimits?.resumeLimit ?? 5;
    }

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
  }, [user, universityLimits]);

  const isAtLimit = totalResumes >= resumeLimit;

  // Determine if user is on a paid plan (students are treated as paid within their university limits)
  const isPaidUser = useMemo(() => {
    if (user?.role === 'student') return true;
    const planName = (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object')
      ? (user.subscriptionPlan as any).name
      : user?.subscriptionPlan;
    return user?.subscriptionStatus === 'active' || (planName && planName !== 'free_tier_in');
  }, [user]);

  // Free users: 5 MB cap · Paid users: 15 MB cap
  const MAX_RESUME_MB = isPaidUser ? 15 : 5;
  const MAX_RESUME_BYTES = MAX_RESUME_MB * 1024 * 1024;

  /** Validate file size before setting. Returns false and shows notification if invalid. */
  const validateAndSetResumeFile = (file: File | null | undefined): void => {
    if (!file) return;
    if (file.size > MAX_RESUME_BYTES) {
      if (!isPaidUser) {
        addNotification({
          type: 'warning',
          title: `Resume too large for free plan (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
          message: `Free accounts support resumes up to 5 MB (≈ 7 pages). Upgrade to Pro to upload files up to 15 MB and resumes with up to 20 pages.`,
        });
        setShowPricing(true);
      } else {
        addNotification({
          type: 'error',
          title: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
          message: `Maximum allowed file size is 15 MB.`,
        });
      }
      return;
    }
    setResumeFile(file);
  };

  const handleUpload = async (): Promise<void> => {
    if (!resumeFile) return;
    setIsUploading(true);
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

      // Check for page/size limit errors from backend or AI
      const rawMsg: string = err.response?.data?.message || err.response?.data?.detail || err.message || '';
      const isPageLimit = /page|7 page|20 page|maximum allowed length/i.test(rawMsg);
      const isSizeLimit = /size|5\s*mb|15\s*mb|too large/i.test(rawMsg);

      if (isPageLimit && !isPaidUser) {
        addNotification({
          type: 'warning',
          title: 'Resume exceeds free plan page limit',
          message: 'Free accounts support resumes up to 7 pages. Upgrade to Pro to process resumes up to 20 pages.',
        });
        setIsUploadOpen(false);
        setShowPricing(true);
        return;
      }
      if (isSizeLimit && !isPaidUser) {
        addNotification({
          type: 'warning',
          title: 'Resume too large for free plan',
          message: 'Free accounts support resumes up to 5 MB. Upgrade to Pro for up to 15 MB.',
        });
        setIsUploadOpen(false);
        setShowPricing(true);
        return;
      }

      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: rawMsg || 'Failed to upload and analyze resume. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetResumeFile(droppedFile);
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
      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Resume Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">Transform your career with data-driven insights</p>
              {/* University badge for students */}
              {user?.role === 'student' && universityLimits && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {universityLimits.name} · Student Account
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Usage Indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resume Limit</span>
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
                  onClick={() => {
                    if (!isAtLimit) { setIsUploadOpen(true); return; }
                    if (user?.role !== 'student') setShowPricing(true);
                  }}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md ${isAtLimit
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  title={isAtLimit ? (user?.role === 'student' ? "You've reached your university's resume limit." : "You've reached your plan limit. Upgrade for more storage.") : "Upload New Resume"}
                >
                  {isAtLimit ? <TrendingUpIcon className="w-5 h-5" /> : <CloudArrowUpIcon className="w-5 h-5" />}
                  {isAtLimit ? (user?.role === 'student' ? 'Limit Reached' : 'Upgrade Plan') : 'Upload Resume'}
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

        {/* Loader for empty state while fetching */}
        {isLoading && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Analytics...</p>
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && resumes.length === 0 && activeTab !== 'details' && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase">No Data Found</h3>
            <p className="text-gray-500 mb-6">Upload your first resume to see performance insights.</p>
          </div>
        )}

        {(resumes.length > 0) && activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              {/* Performance Trends */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <TrendingUpIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    Performance Trends
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Click a point → open resume</span>
                </div>
                {performanceData.length > 0 ? (
                  <>
                  <div className="h-[220px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={performanceData}
                        onClick={(e: any) => {
                          const idx = e?.activePayload?.[0]?.payload?.resumeIndex;
                          if (idx == null) return;
                          const now = Date.now();
                          if (lastClickRef.current?.resumeIndex === idx && now - lastClickRef.current.time < 400) {
                            setSelectedResume(safeResumes[idx]);
                            lastClickRef.current = null;
                          } else {
                            lastClickRef.current = { resumeIndex: idx, time: now };
                          }
                        }}
                        onMouseMove={(e: any) => {
                          const p = e?.activePayload?.[0]?.payload;
                          if (p?.resumeIndex != null) {
                            setHoveredPoint({ resumeIndex: p.resumeIndex, fullName: p.fullName, cvQuality: p.cvQuality, jdMatch: p.jdMatch });
                          }
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <defs>
                          <linearGradient id="colorCV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorJD" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="resumeIndex"
                          stroke="#9CA3AF"
                          fontSize={11}
                          tick={{ fill: '#6B7280', fontWeight: 600 }}
                          tickFormatter={(v) => `#${Number(v) + 1}`}
                          interval={0}
                          height={28}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={10} width={28} domain={[0, 100]} tick={{ fill: '#6B7280' }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 text-xs min-w-[180px]">
                                <p className="font-bold text-gray-900 dark:text-white mb-2 truncate max-w-[200px]">{d.fullName}</p>
                                <p className="text-gray-400 dark:text-gray-500 mb-2">{d.date}</p>
                                {payload.map((p: any) => (
                                  <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
                                    <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                                      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                      {p.name}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white">{p.value}</span>
                                  </div>
                                ))}
                                <p className="text-gray-400 dark:text-gray-500 mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">See open button below ↓</p>
                              </div>
                            );
                          }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="cvQuality" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCV)" strokeWidth={2.5} name="CV Quality" dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="jdMatch" stroke="#10B981" fillOpacity={1} fill="url(#colorJD)" strokeWidth={2.5} name="JD Match" dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stable hover-open bar — never disappears when cursor moves */}
                  <div className={`mt-3 transition-all duration-150 ${hoveredPoint ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                      onClick={() => hoveredPoint && setSelectedResume(safeResumes[hoveredPoint.resumeIndex])}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{hoveredPoint?.fullName}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">CV: <strong className="text-blue-600 dark:text-blue-400">{hoveredPoint?.cvQuality}</strong></span>
                        {(hoveredPoint?.jdMatch ?? 0) > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">JD: <strong className="text-emerald-600 dark:text-emerald-400">{hoveredPoint?.jdMatch}</strong></span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">Open Resume →</span>
                    </button>
                  </div>
                </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No performance data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Leaderboard */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Resume Leaderboard
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">CV Quality score</span>
                </div>
                {pieData.length > 0 ? (
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[340px] pr-1">
                    {[...pieData]
                      .sort((a, b) => b.value - a.value)
                      .map((entry, rank) => {
                        const pct = Math.min((entry.value / 100) * 100, 100);
                        const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;
                        return (
                          <button
                            key={entry.resumeIndex}
                            onClick={() => setSelectedResume(safeResumes[entry.resumeIndex])}
                            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left w-full"
                          >
                            {/* rank */}
                            <span className="w-6 text-center text-xs font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                              {medal ?? `#${rank + 1}`}
                            </span>
                            {/* color dot */}
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                            {/* name */}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1 min-w-0">{entry.name}</span>
                            {/* bar */}
                            <div className="w-20 sm:w-28 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: entry.color }}
                              />
                            </div>
                            {/* score */}
                            <span className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color: entry.color }}>{entry.value}</span>
                            <ArrowRight className="w-3 h-3 text-gray-200 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <p>No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Red Flags & Insights Section (New) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-8">
              {/* Red Flags Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 dark:border-rose-900/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-rose-600" />
                    </div>
                    Critical Insights (Red Flags)
                  </h3>
                  <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-black rounded-full uppercase tracking-widest">
                    {safeResumes[0].analytics?.key_takeaways?.red_flags?.length || 0} Issues
                  </span>
                </div>

                {safeResumes[0].analytics?.key_takeaways?.red_flags?.length > 0 ? (
                  <div className="space-y-4">
                    {safeResumes[0].analytics.key_takeaways.red_flags.map((flag: string, idx: number) => (
                      <div key={idx} className="group p-4 bg-rose-50/30 dark:bg-rose-900/5 rounded-2xl border border-rose-50 dark:border-rose-900/10 hover:border-rose-200 dark:hover:border-rose-900/30 transition-all">
                        <div className="flex gap-3">
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                              {flag}
                            </p>
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer" onClick={() => setSelectedResume(safeResumes[0])}>
                              View Detailed Guidance <ArrowRight className="w-3 h-3" />
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-gray-500 font-medium italic">No critical issues detected.</p>
                  </div>
                )}
              </div>

              {/* Green Flags Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 dark:border-emerald-900/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <StarIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    Competitive Advantages
                  </h3>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-full uppercase tracking-widest">
                    {safeResumes[0].analytics?.key_takeaways?.green_flags?.length || 0} Strengths
                  </span>
                </div>

                {safeResumes[0].analytics?.key_takeaways?.green_flags?.length > 0 ? (
                  <div className="space-y-4">
                    {safeResumes[0].analytics.key_takeaways.green_flags.map((flag: string, idx: number) => (
                      <div key={idx} className="p-4 bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl border border-emerald-50 dark:border-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all">
                        <div className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                            {flag}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-500 font-medium italic">Syncing analysis data...</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'performance' && radarData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Skills Radar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">CV Quality Breakdown</h3>
              <div className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid strokeOpacity={0.5} />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fontWeight: 500 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
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
            {isLoading && resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">Retrieving Your Resumes...</p>
              </div>
            ) : resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {safeResumes.map((resume) => (
                  <DetailedResumeCard
                    key={resume.id || resume._id}
                    resume={resume}
                    isPremium={isPaidUser}
                    onViewDetails={() => { setAutoOpenBuilder(false); setSelectedResume(resume); }}
                    onEnhance={() => {
                      setAutoOpenBuilder(!!(resume as any)?.builder_data);
                      setSelectedResume(resume);
                    }}
                    onUpgrade={() => setShowPricing(true)}
                  />
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
                            {isPaidUser
                              ? 'or click to browse • PDF, DOC, DOCX up to 15 MB · 20 pages'
                              : 'or click to browse • PDF, DOC, DOCX up to 5 MB · 7 pages (upgrade for larger resumes)'}
                          </p>
                        </div>
                      )}
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => validateAndSetResumeFile(e.target.files?.[0])}
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
                    disabled={!resumeFile || isUploading}
                    className="inline-flex justify-center w-full px-6 py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isUploading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        Upload & Analyze
                      </>
                    )}
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
            {selectedResume && (
              <ResumeDetails
                resume={selectedResume}
                autoOpenBuilder={autoOpenBuilder}
                onBuilderDataSaved={(data) =>
                  setSelectedResume(prev => prev ? { ...prev, builder_data: data } : prev)
                }
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div >
  );
};

export default ResumeDashboard;