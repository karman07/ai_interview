import React, { useState } from "react";
import {
  EyeIcon,
  FileText,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  BarChart3,
  Target,
  Users,
  Clock,
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
import { baseURL } from "@/api/http";
import { resumeService } from "@/api/resumeService";
import { startInterviewWithResume } from "@/api/aiInterview";

interface ResumeDetailsProps {
  resume: any;
}

const ResumeDetails: React.FC<ResumeDetailsProps> = ({ resume }) => {
  const [openJDDialog, setOpenJDDialog] = useState(false);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [interviewData, setInterviewData] = useState({
    roleTitle: '',
    companyName: '',
    industry: '',
    roundType: 'full' as 'technical' | 'behavioral' | 'hr' | 'full'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [interviewError, setInterviewError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<"evaluation" | "improvement">(
    "evaluation"
  );
  
  const hasImprovement = Boolean(resume?.improvement_resume);

  const handleDownload = () => {
    let content = `Resume Report for ${resume?.filename}\n\n`;
    content += `Overall Score: ${overallScore}\n\n`;

    if (resume?.stats?.cv_quality?.subscores) {
      content += "=== Quality Assessment ===\n";
      resume.stats.cv_quality.subscores.forEach((sub: any) => {
        content += `\n${sub.dimension.replace(/_/g, " ")}: ${sub.score}/${sub.max_score}\nEvidence:\n${sub.evidence.map((e: string) => "- " + e).join("\n")}\n`;
      });
    }

    content += "\n=== Strengths ===\n";
    (resume?.stats?.key_takeaways?.green_flags || []).forEach((g: string) => {
      content += "- " + g + "\n";
    });

    content += "\n=== Areas for Improvement ===\n";
    (resume?.stats?.key_takeaways?.red_flags || []).forEach((r: string) => {
      content += "- " + r + "\n";
    });

    if (hasImprovement) {
      content += "\n=== AI-Enhanced Content ===\n";
      content += "\nSummary:\n" + resume.improvement_resume.tailored_resume.summary + "\n";
      content += "\nExperience Highlights:\n";
      resume.improvement_resume.tailored_resume.experience.forEach((exp: string) => {
        content += "- " + exp + "\n";
      });
      content += "\nSkills:\n";
      resume.improvement_resume.tailored_resume.skills.forEach((s: string) => {
        content += "- " + s + "\n";
      });
      content += "\nProjects:\n";
      resume.improvement_resume.tailored_resume.projects.forEach((p: string) => {
        content += "- " + p + "\n";
      });
      content += "\nCover Letter:\n" + resume.improvement_resume.cover_letter + "\n";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume?.filename || "resume-report"}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const overallScore = Math.round(resume.stats?.cv_quality?.overall_score);

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
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    overallScore >= 80
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
                    className={`h-3 rounded-full relative ${
                      overallScore >= 80
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : overallScore >= 60
                        ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : overallScore >= 40
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
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
                href={`${baseURL}/${resume?.path}`}
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
            onClick={() => setOpenInterviewDialog(true)}
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
                    <UploadBox jdFile={jdFile} setJdFile={setJdFile} />
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
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
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
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

          {/* Interview Dialog */}
          <Dialog open={openInterviewDialog} onOpenChange={setOpenInterviewDialog}>
            <DialogContent className="w-full max-w-4xl mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Start AI Interview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Role Title *</label>
                    <input type="text" value={interviewData.roleTitle} onChange={(e) => setInterviewData({...interviewData, roleTitle: e.target.value})} placeholder="Software Engineer" className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                    <input type="text" value={interviewData.companyName} onChange={(e) => setInterviewData({...interviewData, companyName: e.target.value})} placeholder="Tech Corp" className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Industry *</label>
                    <input type="text" value={interviewData.industry} onChange={(e) => setInterviewData({...interviewData, industry: e.target.value})} placeholder="Technology" className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Round Type</label>
                    <select value={interviewData.roundType} onChange={(e) => setInterviewData({...interviewData, roundType: e.target.value as any})} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                      <option value="full">Full Interview</option>
                      <option value="technical">Technical Only</option>
                      <option value="behavioral">Behavioral Only</option>
                      <option value="hr">HR Only</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload CV (Optional)</label>
                  <FileUploadBox file={cvFile} setFile={setCvFile} label="CV" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Description *</label>
                  <FileUploadBox file={jdFile} setFile={setJdFile} label="JD" />
                  <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Or paste job description text here..." className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                {interviewError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600">{interviewError}</p></div>}
                {isStartingInterview && <div className="space-y-3"><div className="flex items-center gap-3"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div><span className="text-sm text-gray-600">Starting interview...</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div></div></div>}
                <Button onClick={async () => { if (!interviewData.roleTitle || !interviewData.companyName || (!jdFile && !jdText.trim())) return; setIsStartingInterview(true); setInterviewError(''); try { const sessionId = `session_${Date.now()}`; const userId = 'user123'; await startInterviewWithResume({ resume: cvFile || new File([resume.filename], resume.filename, { type: 'text/plain' }), jd_file: jdFile || undefined, user_id: userId, session_id: sessionId, role_title: interviewData.roleTitle, company_name: interviewData.companyName, industry: interviewData.industry, jd: jdText.trim() || 'Job description from uploaded file', round_type: interviewData.roundType }); setOpenInterviewDialog(false); window.location.href = `/interview/${sessionId}`; } catch (error: any) { setInterviewError(error?.response?.data?.message || error?.message || 'Failed to start interview. Please try again.'); } finally { setIsStartingInterview(false); } }} disabled={!interviewData.roleTitle || !interviewData.companyName || (!jdFile && !jdText.trim()) || isStartingInterview} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50">{isStartingInterview ? 'Starting...' : 'Start Interview'}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <ActionCard
            icon={<Download className="w-5 h-5 text-gray-600" />}
            title="Export Report"
            subtitle={
              <button
                onClick={handleDownload}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Download TXT →
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
            {activeTab === "evaluation" && <EvaluationTab resume={resume} />}
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
              className={`p-3 rounded-lg ${
                color === "blue"
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
            className={`p-3 rounded-lg ${
              color === "blue"
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

const FileUploadBox = ({ file, setFile, label }: { file: File | null; setFile: (file: File | null) => void; label: string; }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const validateFile = (file: File) => {
    const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(fileExtension)) { alert('Please select a valid file type: PDF, DOC, DOCX, or TXT'); return false; }
    if (file.size > maxSize) { alert('File size must be less than 10MB'); return false; }
    return true;
  };
  return (
    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${isDragOver ? 'border-purple-400 bg-purple-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const files = e.dataTransfer.files; if (files.length > 0 && validateFile(files[0])) { setFile(files[0]); } }}>
      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-purple-500' : file ? 'text-green-500' : 'text-gray-400'}`} />
      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" id={`${label.toLowerCase()}-upload`} onChange={(e) => { const selectedFile = e.target.files?.[0]; if (selectedFile && validateFile(selectedFile)) { setFile(selectedFile); } }} />
      {file ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="font-medium text-green-800 text-sm">{file.name}</span></div>
          <label htmlFor={`${label.toLowerCase()}-upload`} className="cursor-pointer inline-block"><span className="text-xs text-purple-600 hover:text-purple-700 underline">Choose different file</span></label>
        </div>
      ) : (
        <label htmlFor={`${label.toLowerCase()}-upload`} className="cursor-pointer block">
          <div className="font-medium text-gray-700 text-sm">{isDragOver ? 'Drop file here' : `Upload ${label} File`}</div>
          <div className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (max 10MB)</div>
        </label>
      )}
    </div>
  );
};

const UploadBox = ({
  jdFile,
  setJdFile,
}: {
  jdFile: File | null;
  setJdFile: (file: File | null) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setJdFile(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please select a valid file type: PDF, DOC, DOCX, or TXT');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : jdFile
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className={`w-10 h-10 mx-auto mb-3 ${
        isDragOver ? 'text-blue-500' : jdFile ? 'text-green-500' : 'text-gray-400'
      }`} />
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        id="jd-upload"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && validateFile(file)) {
            setJdFile(file);
          }
        }}
      />
      
      {jdFile ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-400">{jdFile.name}</span>
          </div>
          <label htmlFor="jd-upload" className="cursor-pointer inline-block">
            <span className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
              Choose different file
            </span>
          </label>
        </div>
      ) : (
        <label htmlFor="jd-upload" className="cursor-pointer block">
          <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isDragOver ? 'Drop file here' : 'Click to select or drag & drop'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT (max 10MB)</div>
        </label>
      )}
    </div>
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
    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
      active
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
    }`}
  >
    <div className="flex items-center gap-2">{icon} {label}</div>
  </button>
);

interface EvaluationTabProps {
  resume: any;
}


const EvaluationTab: React.FC<EvaluationTabProps> = ({ resume }) => {
  const showJDMatch = Boolean(resume?.stats?.jd_match);

  return (
    <div className="space-y-8">
      {/* CV Quality Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quality Assessment
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
                  Evidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {resume?.stats?.cv_quality?.subscores?.map((sub: any, idx: number) => {
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
                            className={`h-3 rounded-full ${
                              percentage >= 80
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : percentage >= 60
                                ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                : percentage >= 40
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : "bg-gradient-to-r from-red-400 to-red-500"
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
                        {sub.evidence.map((ev: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* JD Match Table */}
      {showJDMatch && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description Match</h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-hidden">
              <table className="w-full min-w-[700px]">
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
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {resume?.stats?.jd_match?.subscores?.map((sub: any, idx: number) => {
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
                              className={`h-3 rounded-full ${
                                percentage >= 80
                                  ? "bg-gradient-to-r from-green-400 to-green-500"
                                  : percentage >= 60
                                  ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                  : percentage >= 40
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                  : "bg-gradient-to-r from-red-400 to-red-500"
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
                          {sub.evidence.map((ev: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <InsightsCard
          title="Strengths"
          count={resume?.stats?.key_takeaways?.green_flags?.length || 0}
          color="green"
          icon={<Star className="w-4 h-4" />}
          items={resume?.stats?.key_takeaways?.green_flags || []}
          itemIcon={<CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
        />
        <InsightsCard
          title="Areas for Improvement"
          count={resume?.stats?.key_takeaways?.red_flags?.length || 0}
          color="red"
          icon={<AlertCircle className="w-4 h-4" />}
          items={resume?.stats?.key_takeaways?.red_flags || []}
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
      className={`px-4 py-3 border-b ${
        color === "green" 
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      }`}
    >
      <h4
        className={`font-semibold flex items-center gap-2 ${
          color === "green" 
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

const ImprovementTab = ({ resume }: { resume: any }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Enhanced Content</h3>

    {/* Summary */}
    <ImprovementCard
      title="Professional Summary"
      color="blue"
      icon={<Users className="w-4 h-4" />}
      content={resume.improvement_resume.tailored_resume.summary}
    />

    {/* Experience */}
    <ImprovementList
      title="Experience Highlights"
      color="green"
      icon={<Clock className="w-4 h-4" />}
      items={resume.improvement_resume.tailored_resume.experience}
      bulletColor="green"
    />

    {/* Skills */}
    <ImprovementSkills
      title="Key Skills"
      color="purple"
      icon={<Brain className="w-4 h-4" />}
      skills={resume.improvement_resume.tailored_resume.skills}
    />

    {/* Projects */}
    <ImprovementList
      title="Project Highlights"
      color="orange"
      icon={<Target className="w-4 h-4" />}
      items={resume.improvement_resume.tailored_resume.projects}
      bulletColor="orange"
    />

    {/* Cover Letter */}
    <ImprovementCard
      title="Tailored Cover Letter"
      color="indigo"
      icon={<FileText className="w-4 h-4" />}
      content={
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed font-sans">
            {resume.improvement_resume.cover_letter}
          </pre>
        </div>
      }
    />
  </div>
);

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

const ImprovementList = ({
  title,
  color,
  icon,
  items,
  bulletColor,
}: {
  title: string;
  color: string;
  icon: React.ReactNode;
  items: string[];
  bulletColor: string;
}) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <div
      className={`px-4 py-3 border-b bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}
    >
      <h4 className={`font-semibold text-${color}-900 dark:text-${color}-100 flex items-center gap-2`}>
        {icon} {title}
      </h4>
    </div>
    <div className="p-4 space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <div
            className={`w-2 h-2 bg-${bulletColor}-500 rounded-full mt-2 flex-shrink-0`}
          ></div>
          <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
        </div>
      ))}
    </div>
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
        {skills.map((skill, idx) => (
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
