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
  DialogDescription,
} from "../dialog/dialog";
import { resumeService } from "@/api/resumeService";
import aiHttp from "@/api/aiHttp";
import { generateResumeReport } from "@/utils/pdfGenerator";
import { usePricing } from "@/contexts/PricingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ResumeBuilder from "@/pages/ResumeBuilder";

interface ResumeDetailsProps {
  resume: any;
}

const ResumeDetails: React.FC<ResumeDetailsProps> = ({ resume }) => {
  const { setShowPricing } = usePricing();
  const { addNotification } = useNotification();
  const [openJDDialog, setOpenJDDialog] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<"evaluation" | "improvement" | "jdMatch">("evaluation");
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedResumeData, setEnhancedResumeData] = useState<any>(null);
  const [showBuilderModal, setShowBuilderModal] = useState(false);

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
    setEnhancedResumeData(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await aiHttp.post('/api/v1/resume/final-enhanced', resume);
      const data = response.data;

      clearInterval(progressInterval);
      setProgress(100);

      setEnhancedResumeData(data);

      addNotification({
        type: 'success',
        title: 'Success!',
        message: 'Your enhanced resume is ready for the builder.',
      });
    } catch (error: any) {
      clearInterval(progressInterval);

      const errorMsgRaw = error?.response?.data?.detail || error?.message || 'Failed to generate enhanced resume.';
      const errorMsg = typeof errorMsgRaw === 'object' ? JSON.stringify(errorMsgRaw) : errorMsgRaw;

      addNotification({
        type: 'error',
        title: 'Enhancement Failed',
        message: errorMsg,
      });
      setShowProgressDialog(false);
    } finally {
      setIsDownloadingResume(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0D1117] p-2 sm:p-10">
      <div className="max-w-none mx-auto space-y-6 sm:space-y-12">
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
            icon={<Play className="w-5 h-5 text-blue-600" />}
            title="Start AI Interview"
            subtitle={
              <span className="text-blue-600 text-sm font-medium">
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
                    <DialogDescription>
                      Upload a JD file or paste the text to get a tailored resume analysis and enhancement.
                    </DialogDescription>
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

                          setOpenJDDialog(false);
                          setJdFile(null);
                          setJdText('');
                          window.location.reload();
                        } catch (error: any) {
                          const errorMsg = error?.response?.data?.message || error?.message || '';

                          if ((error?.response?.status === 400 || error?.status === 400) && (errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('plan'))) {
                            setOpenJDDialog(false);
                            setShowPricing(true);
                            addNotification({
                              type: 'error',
                              title: 'Limit Reached',
                              message: 'You have reached your limit. Please upgrade your plan to continue.',
                            });
                          } else {
                            setUploadError(errorMsg || 'Failed to upload. Please try again.');
                          }
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
              icon={<Download className="w-5 h-5 text-blue-600" />}
              title="Download Enhanced Resume"
              subtitle={
                <button
                  onClick={handleDownloadEnhancedResume}
                  disabled={isDownloadingResume}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline text-left disabled:opacity-50"
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
                  {enhancedResumeData ? 'Resume Ready!' : 'Generating Enhanced Resume'}
                </DialogTitle>
                <DialogDescription>
                  {enhancedResumeData
                    ? 'Your AI-powered resume has been generated and is ready for use.'
                    : 'We are using AI to optimize your resume content based on the target job profile.'}
                </DialogDescription>
              </DialogHeader>

              {!enhancedResumeData ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
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
                        setShowProgressDialog(false);
                        setShowBuilderModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Open Resume Editor
                    </Button>
                    <Button
                      onClick={() => {
                        setShowProgressDialog(false);
                        setEnhancedResumeData(null);
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

          {/* Builder Modal */}
          <Dialog open={showBuilderModal} onOpenChange={setShowBuilderModal}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 m-0 overflow-y-auto bg-gray-100 flex flex-col pt-10">
              {enhancedResumeData && (
                <div className="relative min-h-full">
                  <ResumeBuilder initialResumeData={enhancedResumeData} />
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
    </div >
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
        <div className="bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {Array.isArray(sections) ? sections.map((sub: any, idx: number) => {
              const percentage = (sub.score / sub.max_score) * 100;
              return (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white capitalize">
                      {sub.dimension.replace(/_/g, " ")}
                    </h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <span className="text-lg font-black text-gray-900 dark:text-white">{sub.score}</span>
                      <span className="text-[10px] font-black text-gray-400">/ {sub.max_score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-2 rounded-full ${percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-blue-500" : percentage >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evidence / Feedback</p>
                    <ul className="space-y-2">
                      {sub.evidence?.map((ev: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }) : Object.entries(sections).map(([key, section]: [string, any], idx: number) => {
              const percentage = (section.score / 10) * 100;
              return (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white capitalize">
                      {key.replace(/_/g, " ")}
                    </h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <span className="text-lg font-black text-gray-900 dark:text-white">{section.score.toFixed(1)}</span>
                      <span className="text-[10px] font-black text-gray-400">/ 10</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-2 rounded-full ${percentage >= 80 ? "bg-green-500" : percentage >= 60 ? "bg-blue-500" : percentage >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{section.feedback}</p>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border border-gray-200 dark:border-gray-700 rounded-[2rem] overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-[15%] px-6 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Dimension
                  </th>
                  <th className="w-[12%] px-6 py-6 text-center text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Score
                  </th>
                  <th className="w-[23%] px-6 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Progress
                  </th>
                  <th className="w-[50%] px-10 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Evidence / Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {Array.isArray(sections) ? sections.map((sub: any, idx: number) => {
                  const percentage = (sub.score / sub.max_score) * 100;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-8 align-top font-bold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                        {sub.dimension.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-8 text-center align-top">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                          <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{sub.score}</span>
                          <span className="text-[10px] font-black text-gray-400 mt-1">/ {sub.max_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-8 align-top">
                        <div className="relative w-full min-w-[120px]">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
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
                          <div className="text-[10px] font-black text-gray-400 mt-2 text-right tracking-widest uppercase">
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 align-top">
                        <ul className="space-y-3">
                          {sub.evidence?.map((ev: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-3 group/ev">
                              <div className="mt-1 p-1 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover/ev:bg-green-100 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              </div>
                              <span className="leading-relaxed font-medium break-words whitespace-normal">{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                }) : Object.entries(sections).map(([key, section]: [string, any], idx: number) => {
                  const percentage = (section.score / 10) * 100;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-8 align-top font-bold text-gray-900 dark:text-white capitalize whitespace-nowrap">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-8 text-center align-top">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                          <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{section.score.toFixed(1)}</span>
                          <span className="text-[10px] font-black text-gray-400 mt-1">/ 10</span>
                        </div>
                      </td>
                      <td className="px-6 py-8 align-top">
                        <div className="relative w-full min-w-[120px]">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
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
                          <div className="text-[10px] font-black text-gray-400 mt-2 text-right tracking-widest uppercase">
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 align-top">
                        <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium block">{section.feedback}</span>
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/20 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Brain className="w-4 h-4 text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">AI Logic Core</span>
            </div>
            <div>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
                Job Match Analytics
              </h3>
              <p className="text-blue-100/70 text-xs font-black uppercase tracking-[0.2em] max-w-md">
                Synthesized Compatibility Matrix
              </p>
            </div>
          </div>
          <div className="relative text-right">
            <div className="text-8xl font-black text-white drop-shadow-2xl tabular-nums leading-none">
              {jdMatchData.overall_score}
            </div>
            <div className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mt-3 mr-2">Fit Score Index</div>
          </div>
        </div>
      </div>

      {/* Match Analysis Table */}
      <div className="bg-white dark:bg-[#0D1117] shadow-xl shadow-blue-500/5 overflow-hidden">
        {/* Mobile View for JD Match */}
        <div className="md:hidden space-y-4">
          {jdMatchData.subscores.map((sub: any, idx: number) => {
            const percentage = (sub.score / sub.max_score) * 100;
            return (
              <div key={idx} className="border border-blue-100 dark:border-blue-800/50 rounded-2xl p-5 bg-white dark:bg-blue-900/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${percentage >= 80 ? "bg-blue-500" : percentage >= 60 ? "bg-blue-500" : percentage >= 40 ? "bg-yellow-500" : "bg-red-500"}`} />
                    <h4 className="font-bold text-gray-900 dark:text-white capitalize text-sm">
                      {sub.dimension.replace(/_/g, " ")}
                    </h4>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50">
                    <span className="text-lg font-black text-blue-700 dark:text-blue-400">{sub.score}</span>
                    <span className="text-[10px] font-black text-gray-400">/ {sub.max_score}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-2 rounded-full ${percentage >= 80 ? "bg-blue-500" : percentage >= 60 ? "bg-blue-500" : percentage >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-4">
                  <span className={percentage >= 80 ? "text-blue-600" : percentage >= 60 ? "text-blue-600" : percentage >= 40 ? "text-yellow-600" : "text-red-600"}>
                    {percentage >= 80 ? "Excellent Match" : percentage >= 60 ? "Good Match" : percentage >= 40 ? "Moderate Match" : "Needs Improvement"}
                  </span>
                  <span className="text-gray-400">{Math.round(percentage)}%</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evidence & Details</p>
                  {Array.isArray(sub.evidence) ? (
                    <ul className="space-y-2">
                      {sub.evidence.map((ev: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{ev}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{sub.evidence}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border border-blue-100 dark:border-blue-800/50 rounded-[2.5rem] overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50/50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/20 border-b border-blue-100 dark:border-blue-800/50">
            <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 flex items-center gap-3 tracking-tighter uppercase">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              Detailed Match Analysis
            </h4>
          </div>
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-blue-50/30 to-blue-50/30 dark:from-blue-900/10 dark:to-blue-900/10">
              <tr>
                <th className="w-[15%] px-6 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Match Dimension
                </th>
                <th className="w-[12%] px-6 py-6 text-center text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Score
                </th>
                <th className="w-[23%] px-6 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Match Strength
                </th>
                <th className="w-[50%] px-10 py-6 text-left text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Evidence & Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {jdMatchData.subscores.map((sub: any, idx: number) => {
                const percentage = (sub.score / sub.max_score) * 100;
                return (
                  <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors border-b border-gray-50/50 dark:border-gray-800/50 last:border-none">
                    <td className="px-6 py-10 align-top">
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)] mt-2 flex-shrink-0 ${percentage >= 80 ? "bg-blue-500" :
                          percentage >= 60 ? "bg-blue-500" :
                            percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        <span className="text-base font-bold text-gray-900 dark:text-white capitalize tracking-tight whitespace-nowrap">
                          {sub.dimension.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-10 text-center align-top">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                        <span className="text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums leading-none">{sub.score}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">/ {sub.max_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-10 align-top">
                      <div className="space-y-3">
                        <div className="relative w-full">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-4 rounded-full ${percentage >= 80
                                ? "bg-gradient-to-r from-blue-500 to-blue-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                : percentage >= 60
                                  ? "bg-gradient-to-r from-blue-500 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                  : percentage >= 40
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                    : "bg-gradient-to-r from-red-500 to-pink-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${percentage >= 80 ? "text-blue-600 dark:text-blue-400" :
                            percentage >= 60 ? "text-blue-600 dark:text-blue-400" :
                              percentage >= 40 ? "text-yellow-600 dark:text-yellow-400" :
                                "text-red-600 dark:text-red-400"
                            }`}>
                            {percentage >= 80 ? "Excellent Match" :
                              percentage >= 60 ? "Good Match" :
                                percentage >= 40 ? "Moderate Match" : "Needs Improvement"}
                          </span>
                          <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-tighter">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-10 align-top">
                      {Array.isArray(sub.evidence) ? (
                        <ul className="space-y-4">
                          {sub.evidence.map((ev: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-sm group/ev">
                              <div className="mt-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover/ev:bg-blue-100 dark:group-hover/ev:bg-blue-900/40 transition-colors shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold break-words whitespace-normal">{ev}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold block break-words whitespace-normal">{sub.evidence}</span>
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

const safeText = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.name || item.description || item.title || item.text || item.content || JSON.stringify(item);
  }
  return String(item);
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
            {resume.enhancement.tailored_resume.experience.map((exp: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{safeText(exp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.enhancement?.tailored_resume?.skills && (
        <ImprovementSkills
          title="Key Skills"
          color="blue"
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
            {resume.enhancement.tailored_resume.projects.map((proj: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{safeText(proj)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.enhancement?.top_1_percent_gap && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="px-4 py-3 border-b bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Award className="w-4 h-4" /> Top 1% Gap Analysis
            </h4>
          </div>
          <div className="p-4 space-y-4">
            {resume.enhancement.top_1_percent_gap.strengths && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Strengths</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.strengths.map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{safeText(s)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.enhancement.top_1_percent_gap.gaps && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Gaps</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.gaps.map((g: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{safeText(g)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.enhancement.top_1_percent_gap.actionable_next_steps && (
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Actionable Next Steps</h5>
                <div className="space-y-1">
                  {resume.enhancement.top_1_percent_gap.actionable_next_steps.map((step: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{safeText(step)}</span>
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
          color="blue"
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
        {skills?.map((skill: any, idx: number) => (
          <span
            key={idx}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-600"
          >
            {safeText(skill)}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default ResumeDetails;
