import React, { useState } from "react";
import {
  EyeIcon,
  FileText,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  BarChart3,
  Users,
  Brain,
  Award,
  Star,
  AlertCircle,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../dialog/dialog";
// import { baseURL } from "@/api/http";
import { resumeService } from "@/api/resumeService";
import { generateResumeReport } from "@/utils/pdfGenerator";

interface ResumeDetailsProps {
  resume: any;
}

const ResumeDetails: React.FC<ResumeDetailsProps> = ({ resume }) => {
  console.log('Resume object in Details:', resume);
  const [openJDDialog, setOpenJDDialog] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<"evaluation" | "improvement" | "jdMatch">("evaluation");
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedResumeUrl, setEnhancedResumeUrl] = useState<string | null>(null);

  const hasImprovement = Boolean(resume?.enhancement);
  const hasJDMatch = Boolean(resume?.analytics?.jd_match?.subscores?.length > 0);
  const overallScore = Math.round(resume.analytics?.overall_score || resume.analytics?.cv_quality?.overall_score || 0);
  const sections = resume.analytics?.sections || resume.analytics?.cv_quality?.subscores || [];
  const strengths = resume.analytics?.strengths || resume.analytics?.key_takeaways?.green_flags || [];
  const weaknesses = resume.analytics?.weaknesses || resume.analytics?.key_takeaways?.red_flags || [];

  const handleDownloadEnhancedResume = async () => {
    setIsDownloadingResume(true);
    setShowProgressDialog(true);
    setProgress(0);
    setEnhancedResumeUrl(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch(`${import.meta.env.VITE_AI_INTERVIEW_API}/v1/resume/final-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });

      if (!response.ok) throw new Error('Failed to generate enhanced resume');

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);

      const resumeBuilderUrl = import.meta.env.VITE_RESUME_BUILDER_URL || 'http://localhost:5173';
      const queryParams = new URLSearchParams({ data: JSON.stringify(data) }).toString();
      const fullUrl = `${resumeBuilderUrl}?${queryParams}`;
      setEnhancedResumeUrl(fullUrl);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error downloading enhanced resume:', error);
      alert('Failed to generate enhanced resume. Please try again.');
      setShowProgressDialog(false);
    } finally {
      setIsDownloadingResume(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-sm flex-shrink-0">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {resume?.filename}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm">
                    Resume Analysis Dashboard
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white">
                  {overallScore}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mt-1">
                  Overall Score
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Performance Rating
                </span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${overallScore >= 80
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : overallScore >= 60
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                      : overallScore >= 40
                        ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                    }`}
                >
                  {overallScore >= 80
                    ? "Excellent"
                    : overallScore >= 60
                      ? "Good"
                      : overallScore >= 40
                        ? "Average"
                        : "Needs Improvement"}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(overallScore, 100)}%` }}
                    transition={{ duration: 1 }}
                    className={`h-3 rounded-full relative ${overallScore >= 80
                      ? "bg-green-500"
                      : overallScore >= 60
                        ? "bg-blue-500"
                        : overallScore >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                  >
                    <div className="absolute right-0 top-0 w-1 h-3 bg-white/40 rounded-full"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            icon={<EyeIcon className="w-5 h-5 text-blue-600" />}
            title="View Resume"
            subtitle={
              <a
                href={`${import.meta.env.VITE_API_BASE_URL}/${resume?.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Open Document →
              </a>
            }
            color="blue"
          />

          <ActionCard
            icon={<Play className="w-5 h-5 text-purple-600" />}
            title="Start AI Interview"
            subtitle={
              <span className="text-purple-600 text-sm font-medium">
                Practice Interview →
              </span>
            }
            color="gray"
            clickable
            onClick={() => window.location.href = `/interview_round`}
          />

          {!hasImprovement && (
            <>
              <ActionCard
                icon={<Upload className="w-5 h-5 text-green-600" />}
                title="Upload Job Description"
                subtitle={
                  <span className="text-green-600 text-sm font-medium">
                    Enhance Resume →
                  </span>
                }
                color="green"
                clickable
                onClick={() => setOpenJDDialog(true)}
              />

              <Dialog open={openJDDialog} onOpenChange={setOpenJDDialog}>
                <DialogContent className="w-full max-w-5xl mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Upload Job Description
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${jdFile ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                      <Upload className={`w-10 h-10 mx-auto mb-3 ${jdFile ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="jd-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setJdFile(file);
                        }}
                      />
                      {jdFile ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-400">{jdFile.name}</span>
                          </div>
                          <label htmlFor="jd-upload" className="cursor-pointer inline-block">
                            <span className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">Choose different file</span>
                          </label>
                        </div>
                      ) : (
                        <label htmlFor="jd-upload" className="cursor-pointer block">
                          <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Click to select or drag & drop</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT (max 10MB)</div>
                        </label>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Or paste job description text:
                      </label>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Job Description: We are looking for a Senior Software Engineer with 5+ years experience in Node.js, React, and MongoDB..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {uploadError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{uploadError}</p>
                      </div>
                    )}

                    {isUploading && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Processing your request...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={async () => {
                        if (!jdFile && !jdText.trim()) return;

                        setIsUploading(true);
                        setUploadError('');

                        try {
                          const result = await resumeService.improveResume(
                            resume._id,
                            jdText.trim() || undefined,
                            jdFile || undefined
                          );

                          console.log('Upload successful:', result);
                          setOpenJDDialog(false);
                          setJdFile(null);
                          setJdText('');
                          window.location.reload();
                        } catch (error: any) {
                          console.error('Failed to improve resume:', error);
                          setUploadError(
                            error?.response?.data?.message ||
                            error?.message ||
                            'Failed to upload. Please try again.'
                          );
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      disabled={(!jdFile && !jdText.trim()) || isUploading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUploading ? 'Processing...' : 'Process & Enhance'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {hasImprovement && (
            <ActionCard
              icon={<Download className="w-5 h-5 text-indigo-600" />}
              title="Download Enhanced Resume"
              subtitle={
                <button
                  onClick={handleDownloadEnhancedResume}
                  disabled={isDownloadingResume}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline text-left disabled:opacity-50"
                >
                  {isDownloadingResume ? 'Generating...' : 'Get Enhanced Resume →'}
                </button>
              }
              color="gray"
            />
          )}

          {/* Progress Dialog */}
          <Dialog open={showProgressDialog} onOpenChange={(open) => {
            if (!isDownloadingResume) setShowProgressDialog(open);
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {enhancedResumeUrl ? 'Resume Ready!' : 'Generating Enhanced Resume'}
                </DialogTitle>
              </DialogHeader>

              {!enhancedResumeUrl ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-indigo-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Please wait while we generate your enhanced resume...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    Your enhanced resume has been generated successfully!
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        window.open(enhancedResumeUrl, '_blank');
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Open Resume
                    </Button>
                    <Button
                      onClick={() => {
                        setShowProgressDialog(false);
                        setEnhancedResumeUrl(null);
                        setProgress(0);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <ActionCard
            icon={<Download className="w-5 h-5 text-gray-600" />}
            title="Export Report"
            subtitle={
              <button
                onClick={() => generateResumeReport(resume)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium hover:underline text-left"
              >
                Download PDF Report →
              </button>
            }
            color="gray"
          />
        </div>

        {/* Tabs + Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <TabButton
                label="Resume Evaluation"
                icon={<BarChart3 className="w-4 h-4" />}
                active={activeTab === "evaluation"}
                onClick={() => setActiveTab("evaluation")}
              />
              {hasJDMatch && (
                <TabButton
                  label="JD Match Analysis"
                  icon={<Brain className="w-4 h-4" />}
                  active={activeTab === "jdMatch"}
                  onClick={() => setActiveTab("jdMatch")}
                />
              )}
              {hasImprovement && (
                <TabButton
                  label="AI Enhancement"
                  icon={<Award className="w-4 h-4" />}
                  active={activeTab === "improvement"}
                  onClick={() => setActiveTab("improvement")}
                />
              )}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "evaluation" && <EvaluationTab resume={resume} sections={sections} strengths={strengths} weaknesses={weaknesses} />}
            {activeTab === "jdMatch" && hasJDMatch && <JDMatchTab resume={resume} />}
            {activeTab === "improvement" && hasImprovement && (
              <ImprovementTab resume={resume} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Helper Components ---------------- */

const ActionCard = ({
  icon,
  title,
  subtitle,
  color,
  clickable = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  color: "blue" | "green" | "gray";
  clickable?: boolean;
  onClick?: () => void;
}) => {
  if (clickable) {
    return (
      <motion.div whileHover={{ scale: 1.02 }}>
        <button
          onClick={onClick}
          className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-shadow text-left cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${color === "blue"
                ? "bg-blue-50 dark:bg-blue-900/20"
                : color === "green"
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-gray-50 dark:bg-gray-700"
                }`}
            >
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <div>{subtitle}</div>
            </div>
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-shadow">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-lg ${color === "blue"
              ? "bg-blue-50 dark:bg-blue-900/20"
              : color === "green"
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-gray-50 dark:bg-gray-700"
              }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <div>{subtitle}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const TabButton = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${active
      ? "border-blue-500 text-blue-600 dark:text-blue-400"
      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
  >
    <div className="flex items-center gap-2">{icon} {label}</div>
  </button>
);

interface EvaluationTabProps {
  resume: any;
  sections: any[];
  strengths: string[];
  weaknesses: string[];
}

const EvaluationTab: React.FC<EvaluationTabProps> = ({ resume, sections, strengths, weaknesses }) => {
  return (
    <div className="space-y-8">
      {/* CV Quality Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          CV Quality Assessment
        </h3>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Dimension
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Evidence/Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {Array.isArray(sections) ? sections.map((sub: any, idx: number) => {
                  const percentage = (sub.score / sub.max_score) * 100;
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                        {sub.dimension.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{sub.score}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {sub.max_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative w-full">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.7 }}
                              className={`h-3 rounded-full ${percentage >= 80
                                ? "bg-green-500"
                                : percentage >= 60
                                  ? "bg-blue-500"
                                  : percentage >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="space-y-1">
                          {sub.evidence?.map((ev: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                }) : Object.entries(sections).map(([key, section]: [string, any], idx: number) => {
                  const percentage = (section.score / 10) * 100;
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{section.score.toFixed(1)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ 10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative w-full">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.7 }}
                              className={`h-3 rounded-full ${percentage >= 80
                                ? "bg-green-500"
                                : percentage >= 60
                                  ? "bg-blue-500"
                                  : percentage >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{section.feedback}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* JD Match - Fit Score */}
      {resume?.enhancement?.fit_score && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Match Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {resume.enhancement.fit_score}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Job Fit Score</div>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Matching Skills</h4>
              <div className="flex flex-wrap gap-2">
                {resume.enhancement.matching_skills?.slice(0, 5).map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <InsightsCard
          title="Strengths"
          count={strengths.length}
          color="green"
          icon={<Star className="w-4 h-4" />}
          items={strengths}
          itemIcon={<CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
        />
        <InsightsCard
          title="Areas for Improvement"
          count={weaknesses.length}
          color="red"
          icon={<AlertCircle className="w-4 h-4" />}
          items={weaknesses}
          itemIcon={<XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
        />
      </div>
    </div>
  );
};

const InsightsCard = ({
  title,
  count,
  color,
  icon,
  items,
  itemIcon,
}: {
  title: string;
  count: number;
  color: "green" | "red";
  icon: React.ReactNode;
  items: string[];
  itemIcon: React.ReactNode;
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <div
      className={`px-4 py-3 border-b ${color === "green"
        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}
    >
      <h4
        className={`font-semibold flex items-center gap-2 ${color === "green"
          ? "text-green-900 dark:text-green-100"
          : "text-red-900 dark:text-red-100"
          }`}
      >
        {icon} {title} ({count})
      </h4>
    </div>
    <div className="p-4 space-y-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-900">
      {items.map((flag, idx) => (
        <div key={idx} className="flex items-start gap-2 text-sm">
          {itemIcon}
          <span className="text-gray-700 dark:text-gray-300">{flag}</span>
        </div>
      ))}
    </div>
  </div>
);

const JDMatchTab = ({ resume }: { resume: any }) => {
  const jdMatchData = resume?.analytics?.jd_match;

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Job Description Match Score
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your resume's compatibility with the job requirements
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {jdMatchData.overall_score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">out of 100</div>
          </div>
        </div>
      </div>

      {/* Match Analysis Table */}
      <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800">
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" /> Detailed Match Analysis
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Match Dimension
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white w-64">
                  Match Strength
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Evidence & Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {jdMatchData.subscores.map((sub: any, idx: number) => {
                const percentage = (sub.score / sub.max_score) * 100;
                return (
                  <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${percentage >= 80 ? "bg-indigo-500" :
                          percentage >= 60 ? "bg-blue-500" :
                            percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {sub.dimension.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                        <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{sub.score}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">/ {sub.max_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="relative w-full">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-4 rounded-full shadow-sm ${percentage >= 80
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                                : percentage >= 60
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  : percentage >= 40
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-red-500 to-pink-500"
                                }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${percentage >= 80 ? "text-indigo-600 dark:text-indigo-400" :
                            percentage >= 60 ? "text-blue-600 dark:text-blue-400" :
                              percentage >= 40 ? "text-yellow-600 dark:text-yellow-400" :
                                "text-red-600 dark:text-red-400"
                            }`}>
                            {percentage >= 80 ? "Excellent Match" :
                              percentage >= 60 ? "Good Match" :
                                percentage >= 40 ? "Moderate Match" : "Needs Improvement"}
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {Array.isArray(sub.evidence) ? (
                        <ul className="space-y-2">
                          {sub.evidence.map((ev: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{ev}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300">{sub.evidence}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ImprovementTab = ({ resume }: { resume: any }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Enhanced Content</h3>

      {resume.enhancement?.tailored_resume?.summary && (
        <ImprovementCard
          title="Professional Summary"
          color="blue"
          icon={<Users className="w-4 h-4" />}
          content={resume.enhancement.tailored_resume.summary}
        />
      )}

      {resume.enhancement?.tailored_resume?.experience && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              <Award className="w-4 h-4" /> Experience Highlights
            </h4>
          </div>
          <div className="p-4 space-y-2">
            {resume.enhancement.tailored_resume.experience.map((exp: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{exp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.enhancement?.tailored_resume?.skills && (
        <ImprovementSkills
          title="Key Skills"
          color="purple"
          icon={<Brain className="w-4 h-4" />}
          skills={resume.enhancement.tailored_resume.skills}
        />
      )}

      {resume.enhancement?.tailored_resume?.projects && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
              <Star className="w-4 h-4" /> Project Highlights
            </h4>
          </div>
          <div className="p-4 space-y-2">
            {resume.enhancement.tailored_resume.projects.map((proj: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{proj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.enhancement?.top_1_percent_gap && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Award className="w-4 h-4" /> Top 1% Gap Analysis
            </h4>
          </div>
          <div className="p-4 space-y-4">
            {resume.enhancement.top_1_percent_gap.strengths && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Strengths</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.enhancement.top_1_percent_gap.gaps && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Gaps</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.gaps.map((g: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.enhancement.top_1_percent_gap.actionable_next_steps && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Actionable Next Steps</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.actionable_next_steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {resume.enhancement?.cover_letter && (
        <ImprovementCard
          title="Tailored Cover Letter"
          color="indigo"
          icon={<FileText className="w-4 h-4" />}
          content={
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                {typeof resume.enhancement.cover_letter === 'object'
                  ? resume.enhancement.cover_letter.content
                  : resume.enhancement.cover_letter}
              </pre>
            </div>
          }
        />
      )}
    </div>
  );
};

const ImprovementCard = ({
  title,
  color,
  icon,
  content,
}: {
  title: string;
  color: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <div
      className={`px-4 py-3 border-b bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}
    >
      <h4 className={`font-semibold text-${color}-900 dark:text-${color}-100 flex items-center gap-2`}>
        {icon} {title}
      </h4>
    </div>
    <div className="p-4 text-gray-700 dark:text-gray-300 leading-relaxed">{content}</div>
  </div>
);

const ImprovementSkills = ({
  title,
  color,
  icon,
  skills,
}: {
  title: string;
  color: string;
  icon: React.ReactNode;
  skills: string[];
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <div
      className={`px-4 py-3 border-b bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}
    >
      <h4 className={`font-semibold text-${color}-900 dark:text-${color}-100 flex items-center gap-2`}>
        {icon} {title}
      </h4>
    </div>
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {skills?.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-600"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default ResumeDetails;
