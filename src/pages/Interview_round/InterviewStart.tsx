import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/button";
import {
  Briefcase, Building2, FileText, Layers, Loader2, ArrowRight,
  Users, Code, Lightbulb, MessageCircle,
  Award, BarChart3, Eye, Upload, X, CheckCircle, Clock, TrendingUp, Zap, Lock
} from "lucide-react";
import { InterviewAnalyticsApi, type Analytics, type RoundStats } from "@/api/interviewAnalytics";
import { resumeService } from "@/api/resumeService";
import { type Resume } from "@/types/Resume";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing } from "@/contexts/PricingContext";
import { useResume } from "@/contexts/ResumeContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import { baseURL } from "@/api/http";

interface InterviewDetails {
  role: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  resumeUrl?: string;
  resumePath?: string;
  resumeFile?: File;
  jdFile?: File;
}

export default function InterviewStart() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setShowPricing } = usePricing();

  const preFilledData = location.state as {
    role?: string;
    company?: string;
    jobDescription?: string;
  } | undefined;

  const [details, setDetails] = useState<InterviewDetails>({
    role: preFilledData?.role || (preFilledData?.company ? "Software Engineer" : ""),
    company: preFilledData?.company || "",
    jobDescription: preFilledData?.jobDescription || "",
    resumeText: "",
  });
  const [loading, setLoading] = useState(false);
  const { resumes, uploadResume, isLoading: fetchingResumes } = useResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string>("");
  const [duration, setDuration] = useState<number>(15);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [universityLimits, setUniversityLimits] = useState<{ resumeLimit: number; interviewLimit: number } | null>(null);
  const [knowledgeDocId, setKnowledgeDocId] = useState<string | null>(null);
  const [topicData, setTopicData] = useState<any | null>(null);

  useEffect(() => {
    InterviewAnalyticsApi.getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  useEffect(() => {
    if ((user as any)?.role === 'student' && (user as any)?.universityId) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/universities/${(user as any).universityId}`)
          .then(res => setUniversityLimits({
            resumeLimit: res.data?.resumeLimit ?? 5,
            interviewLimit: res.data?.interviewLimit ?? 20,
          }))
          .catch(() => {});
      });
    }
  }, [(user as any)?.universityId]);

  useEffect(() => {
    if (preFilledData?.company) {
      import('@/api/http').then(({ default: http }) => {
        http.get(`/knowledge/topics/find-by-name?name=${preFilledData.company}`)
          .then(res => {
            if (res.data?._id) {
              setTopicData(res.data);
              if (res.data.jdFileId) {
                setKnowledgeDocId(res.data.jdFileId);
              } else {
                http.get(`/knowledge/topics/${res.data._id}/documents`)
                  .then(resDoc => {
                    if (resDoc.data?.length > 0) {
                      setKnowledgeDocId(resDoc.data[0]._id);
                    }
                  });
              }
            }
          });
      });
    }
  }, [preFilledData?.company]);

  const types = {
    technical: { icon: <Code className="w-6 h-6" />, color: "from-blue-500 to-indigo-600", title: "Technical Round", accent: "blue" },
    behavioral: { icon: <Users className="w-6 h-6" />, color: "from-indigo-500 to-blue-600", title: "Behavioral Round", accent: "indigo" },
    problem: { icon: <Lightbulb className="w-6 h-6" />, color: "from-blue-400 to-indigo-500", title: "Problem Solving Round", accent: "blue" },
    hr: { icon: <MessageCircle className="w-6 h-6" />, color: "from-indigo-600 to-blue-700", title: "HR Round", accent: "indigo" }
  };
  const info = types[type as keyof typeof types] || types.technical;

  const roundMap: Record<string, keyof Analytics> = { technical: 'technical', behavioral: 'behavioral', problem: 'problemSolving', hr: 'hr' };
  const roundData = analytics && type ? analytics[roundMap[type] as keyof Analytics] : null;
  const stats = (roundData && typeof roundData === 'object' && 'averageScore' in roundData) ? roundData as RoundStats : null;

  // Derive radar data from summary if available
  const radarData = useMemo(() => {
    if (!stats || !analytics?.overall) return null;
    return [
      { subject: 'Avg Score', A: (stats.averageScore || 0) * 10, fullMark: 100 },
      { subject: 'Best', A: (stats.bestScore || 0) * 10, fullMark: 100 },
      { subject: 'Success', A: ((stats.completedSessions || 0) / (stats.totalSessions || 1)) * 100, fullMark: 100 },
      { subject: 'Quality', A: (analytics.overall.overallAverageScore || 0) * 10, fullMark: 100 },
    ];
  }, [stats, analytics]);

  const interviewLimit = useMemo(() => {
    if ((user as any)?.role === 'student') return universityLimits?.interviewLimit ?? 20;
    if ((user?.subscriptionPlan as any)?.type === 'pay_as_you_go' && typeof user?.paygInterviewsLimit === 'number') return user.paygInterviewsLimit;
    if (typeof user?.interviewLimit === 'number' && user.interviewLimit > 0) return user.interviewLimit;
    
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const f = (user.subscriptionPlan as any).features?.find?.((f: any) => f.name === 'Interview Limit');
      if (f) return Number(f.value ?? f.limit ?? 3);
    }
    return 3; 
  }, [user, universityLimits]);

  const resumeLimit = useMemo(() => {
    if ((user as any)?.role === 'student') return universityLimits?.resumeLimit ?? 5;
    if ((user?.subscriptionPlan as any)?.type === 'pay_as_you_go' && typeof user?.paygResumesLimit === 'number') return user.paygResumesLimit;
    if (typeof user?.resumeLimit === 'number' && user.resumeLimit > 0) return user.resumeLimit;
    
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object') {
      const f = (user.subscriptionPlan as any).features?.find?.((f: any) => f.name === 'Resume Limit' || f.name === 'Resume Upload Limit');
      if (f) return Number(f.value ?? f.limit ?? 5);
    }
    return 5; 
  }, [user, universityLimits]);

  const isPayg = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go';
  // Use the user profile counters as source of truth for limit enforcement/usage UI.
  const totalInterviewsTaken = isPayg ? (user?.paygInterviewsUsed ?? 0) : (user?.interviewCount ?? 0);
  const isAtLimit = totalInterviewsTaken >= interviewLimit;
  
  const totalResumes = isPayg ? (user?.paygResumesUsed ?? 0) : (user?.resumeCount ?? resumes.length);
  const isAtResumeLimit = totalResumes >= resumeLimit;

  const isPaidUser = useMemo(() => {
    if ((user as any)?.role === 'student') return true;
    const planName = (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object')
      ? (user.subscriptionPlan as any).name
      : user?.subscriptionPlan;
    const normalizedPlanName = String(planName || '').toLowerCase();
    const isFreeTier = normalizedPlanName.startsWith('free_tier') || normalizedPlanName === 'free';
    return user?.subscriptionStatus === 'active' || (!!planName && !isFreeTier);
  }, [user]);

  // Free users are restricted to 15-minute sessions only
  useEffect(() => {
    if (!isPaidUser && duration !== 15) {
      setDuration(15);
    }
  }, [isPaidUser]);

  const bestResumeId = useMemo(() => {
    if (!resumes.length) return null;
    const scoredResumes = resumes.filter(r => (r.analytics?.cv_quality?.overall_score || 0) > 0);
    if (!scoredResumes.length) return null;
    return scoredResumes.reduce((best, current) => {
      const bestScore = best.analytics?.cv_quality?.overall_score || 0;
      const currentScore = current.analytics?.cv_quality?.overall_score || 0;
      return currentScore > bestScore ? current : best;
    }, scoredResumes[0])?.id || scoredResumes[0]?._id;
  }, [resumes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      const fileName = file.name.toLowerCase();
      const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!isValidType) {
        setError(`Invalid file type. Please upload PDF, DOCX, or TXT file.`);
        return;
      }
      // Resume file: free users get 5 MB, paid users get 15 MB
      if (fileType === 'resume') {
        const maxMB = isPaidUser ? 15 : 5;
        if (file.size > maxMB * 1024 * 1024) {
          if (!isPaidUser) {
            setError(`Your resume is ${(file.size / 1024 / 1024).toFixed(1)} MB. Free accounts support up to 5 MB (≈ 7 pages). Upgrade to upload larger resumes.`);
            setShowPricing(true);
          } else {
            setError(`File too large. Maximum size for your plan is 15 MB.`);
          }
          return;
        }
      } else {
        if (file.size > 10 * 1024 * 1024) {
          setError(`File too large. Maximum size is 10 MB.`);
          return;
        }
      }
      setError("");
      if (fileType === 'resume') {
        setDetails(prev => ({ ...prev, resumeFile: file }));
      } else {
        setDetails(prev => ({ ...prev, jdFile: file }));
      }
    }
  };

  const removeFile = (fileType: 'resume' | 'jd') => {
    if (fileType === 'resume') {
      setDetails(prev => ({ ...prev, resumeFile: undefined }));
    } else {
      setDetails(prev => ({ ...prev, jdFile: undefined }));
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResumeId(resume.id || resume._id);
    const text = resume.text || "";
    const url = resume.url || "";
    const path = resume.path || "";
    console.log('[InterviewStart] Selected resume text length:', text.length, '| URL:', url, '| path:', path);
    setDetails(prev => ({
      ...prev,
      resumeText: text,
      resumeUrl: url,
      resumePath: path,
      resumeFile: undefined
    }));
    setShowUploadModal(false);
    setError("");
  };

  const clearSelectedResume = () => {
    setSelectedResumeId("");
    setDetails(prev => ({ ...prev, resumeText: "" }));
  };

  const handleUploadNewResume = async () => {
    if (!uploadFile) return;
    setUploadingResume(true);
    setError("");
    try {
      const newResume = await uploadResume([uploadFile]);
      handleSelectResume(newResume);
      setShowUploadModal(false);
      setUploadFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStart = async () => {
    if (isAtLimit) {
      if ((user as any)?.role !== 'student') setShowPricing(true);
      return;
    }

    if (!details.role || !details.company) {
      setError("Please fill in role and company");
      return;
    }

    if (!details.resumeFile && !details.resumeText && !selectedResumeId && !preFilledData?.company) {
      setError("Please provide your resume (upload file or choose from history or enter text)");
      return;
    }

    if (!details.jdFile && !details.jobDescription && !preFilledData?.company) {
      setError("Please provide job description (upload file or enter text)");
      return;
    }

    if (!user?._id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let resumeText = details.resumeText;
      let jdText = details.jobDescription;
      let resumeUrl = details.resumeUrl || "";

      if (details.resumeFile && !resumeText) {
        // FileReader.readAsText only works properly for .txt files.
        // For PDF/DOCX, we pass the file name and rely on the backend to extract text.
        const ext = details.resumeFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'txt') {
          resumeText = await readFileAsText(details.resumeFile);
        } else {
          // Cannot read PDF/DOCX on the frontend — we'll send the file name as a hint
          // and rely on the Python backend extracting text from the stored file path.
          console.warn('[InterviewStart] Cannot read PDF/DOCX as text in browser. resumeText will be empty; backend must extract from file.');
          resumeText = '';
        }
      }
      if (details.jdFile && !jdText) {
        const ext = details.jdFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'txt') {
          jdText = await readFileAsText(details.jdFile);
        } else {
          jdText = '';
        }
      }

      const setupData = {
        resumeText: preFilledData?.company 
          ? `KNOWLEDGE-BASE ASSESSMENT: No personal resume provided. Context is derived strictly from the Job Description and specialized ${preFilledData.company} Knowledge Base. Evaluate based on technical expertise rather than personal history.`
          : resumeText,
        resumeUrl: details.resumeUrl || "",
        resumePath: details.resumePath || "",
        jdText: preFilledData?.company 
          ? `Specialized ${preFilledData.company} Interview Round (Knowledge Base Guided)` 
          : jdText,
        role: details.role,
        company: details.company,
        roundType: type || 'technical',
        userId: user._id,
        candidateName: "", // Leave empty so AI extracts name from resume itself
        duration,
      };

      console.log('[InterviewStart] Setup data:', JSON.stringify({
        ...setupData,
        resumeText: setupData.resumeText ? `[${setupData.resumeText.length} chars]` : '[EMPTY]',
        resumeUrl: setupData.resumeUrl || '[NO URL]',
      }));
      localStorage.setItem('ws_interview_setup', JSON.stringify(setupData));
      navigate(`/interview/room/${type}`);
    } catch (err: any) {
      setError(err.message || 'Failed to prepare interview');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200 dark:bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r ${info.color} text-white rounded-2xl mb-6 shadow-xl shadow-blue-500/20`}
          >
            {info.icon}
            <span className="font-bold tracking-tight">{info.title}</span>
          </motion.div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Prepare for Your <span className="text-blue-600">Interview</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Our Ai for jober will analyze your resume and the job description to provide a realistic, role-specific session.
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Analytics Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-blue-50 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${info.color}`}></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" /> Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats ? (
                  <>
                    <div className="h-[180px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData!}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <Radar
                            name="Performance"
                            dataKey="A"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-blue-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageScore?.toFixed(1) || '0.0'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-blue-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalSessions}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Capacity</span>
                        <span className={`text-[10px] font-black ${isAtLimit ? 'text-rose-500' : 'text-blue-600'}`}>
                          {totalInterviewsTaken} / {interviewLimit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((totalInterviewsTaken / interviewLimit) * 100, 100)}%` }}
                          className={`h-full transition-all duration-500 ${isAtLimit ? 'bg-rose-500' : 'bg-blue-600'}`}
                        />
                      </div>
                      {isAtLimit && (
                        <p className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> Upgrade to unlock unlimited
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                      <BarChart3 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Begin Your Journey</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Complete your first session to unlock personalized performance analytics.</p>
                  </div>
                )}
                <Link to="/interview/history" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Eye className="w-4 h-4" /> View History
                </Link>
              </CardContent>
            </Card>
          </div>


          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-blue-50 dark:border-slate-800 shadow-sm rounded-[2.5rem] overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${info.color}`}></div>
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Interview Parameters</CardTitle>
                <p className="text-slate-500 font-medium text-sm">Fine-tune the session for your target role</p>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                      <X className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-300">{error}</p>
                    </div>
                    <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600 mt-1.5">
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Role <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Senior Fullstack Developer"
                      value={details.role}
                      onChange={(e) => setDetails({ ...details, role: e.target.value })}
                      disabled={!!preFilledData?.company}
                      className={`h-14 border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        !!preFilledData?.company 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' 
                        : 'bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" /> Target Company <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Google / Startup / Meta"
                      value={details.company}
                      onChange={(e) => setDetails({ ...details, company: e.target.value })}
                      disabled={!!preFilledData?.company}
                      className={`h-14 border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        !!preFilledData?.company 
                        ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' 
                        : 'bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Resume Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Resume / CV <span className="text-rose-500">*</span>
                    </label>
                      {preFilledData?.company ? (
                        <div className="relative p-6 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl flex flex-col items-center justify-start text-center gap-3 transition-all hover:border-indigo-200 shadow-xl shadow-indigo-500/5 group/resume h-full min-h-[300px]">
                          {/* Top accent line */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 rounded-t-3xl" />
                          
                          <div className="relative pt-2">
                            <div className="absolute -inset-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl group-hover/resume:bg-indigo-500/20 transition-all duration-500 overflow-hidden" />
                            <div className="relative w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 transform group-hover/resume:scale-105 transition-transform duration-500">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          <div className="h-10 flex items-center justify-center mt-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                              Standardized Assessment
                            </p>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                            Personal resume is bypassed for this session. The AI will evaluate based on {preFilledData.company}'s core technical requirements.
                          </p>
                        </div>
                      ) : details.resumeFile ? (
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl flex items-center justify-between min-h-[120px]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{details.resumeFile.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">{(details.resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                            </div>
                          </div>
                          <button onClick={() => removeFile('resume')} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : selectedResumeId ? (
                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-3xl flex items-center justify-between min-h-[120px]">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                                {resumes.find(r => (r.id || r._id) === selectedResumeId)?.filename || 'Selected Resume'}
                              </p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pre-uploaded • Ready</p>
                            </div>
                          </div>
                          <button onClick={clearSelectedResume} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative h-[224px]">
                            <div onClick={() => setShowUploadModal(true)} className="cursor-pointer w-full h-full p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group">
                              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <FileText className="w-8 h-8 text-blue-500" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Select or Upload Resume</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                  {resumes.length > 0 ? `Choose from ${resumes.length} saved resumes or upload new` : 'PDF, DOCX, DOC • MAX 10MB'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* JD Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Job Description <span className="text-rose-500">*</span>
                    </label>
                    <div className="group relative h-full">
                      {preFilledData?.company ? (
                        <div className="relative p-6 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-start text-center gap-3 transition-all hover:border-blue-200 shadow-xl shadow-blue-500/5 group/jd h-full min-h-[300px]">
                          {/* Top accent line */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 rounded-t-3xl" />
                          
                          <div className="relative pt-2">
                            <div className="absolute -inset-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl group-hover/jd:bg-blue-500/20 transition-all duration-500" />
                            {topicData?.logoUrl ? (
                              <div className="relative w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-xl shadow-blue-500/10 border border-blue-50 dark:border-slate-800 flex items-center justify-center transform group-hover/jd:scale-105 transition-transform duration-500">
                                <img 
                                  src={`${baseURL}${topicData.logoUrl}`} 
                                  alt={preFilledData.company} 
                                  className="w-full h-full object-contain" 
                                />
                              </div>
                            ) : (
                              <div className="relative w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform group-hover/jd:scale-105 transition-transform duration-500">
                                <Zap className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="h-10 flex items-center justify-center mt-1">
                            <p className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                              {preFilledData.company} Round
                            </p>
                          </div>
                          
                          {topicData?.jdFileName && (
                            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                              <FileText className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{topicData.jdFileName}</span>
                            </div>
                          )}

                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                            Simulating the precise technical hiring patterns of {preFilledData.company}.
                          </p>

                          <div className="pt-1 flex flex-col gap-2 w-full mt-auto">
                            {knowledgeDocId && (
                              <Button 
                                variant="outline" 
                                className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all gap-2 px-3 py-1.5 h-9 text-[9px] uppercase tracking-widest"
                                onClick={() => window.open(`${baseURL}/knowledge/documents/${knowledgeDocId}/view`, '_blank')}
                              >
                                <Eye className="w-3 h-3" />
                                Review Source
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : details.jdFile ? (
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                              <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{details.jdFile.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">{(details.jdFile.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                            </div>
                          </div>
                          <button onClick={() => removeFile('jd')} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative h-[224px]">
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => handleFileChange(e, 'jd')}
                              accept=".pdf,.docx,.txt"
                            />
                            <div className="w-full h-full p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-4 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all duration-300">
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <Upload className="w-6 h-6 text-blue-500" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Upload Job Description</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, DOCX, TXT • MAX 10MB</p>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-x-4 top-0 -translate-y-1/2 flex justify-center">
                              <span className="px-2 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-300 uppercase tracking-widest translate-y-[-12px]">OR PASTE TEXT</span>
                            </div>
                            <Textarea
                              placeholder="Paste job description here..."
                              className="min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-blue-500/20"
                              value={details.jobDescription}
                              onChange={(e) => setDetails({ ...details, jobDescription: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-end gap-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="w-full lg:flex-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Session Duration
                    </label>
                    <div className="flex items-center gap-4">
                      {[15, 30, 45, 60].map((mins) => {
                        const isLocked = !isPaidUser && mins !== 15;
                        const isSelected = duration === mins;
                        return (
                          <button
                            key={mins}
                            onClick={() => {
                              if (isLocked) { setShowPricing(true); return; }
                              setDuration(mins);
                            }}
                            title={isLocked ? 'Upgrade to unlock longer sessions' : undefined}
                            className={`relative flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all ${
                              isLocked
                                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-pointer opacity-60'
                                : isSelected
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-200'
                            }`}
                          >
                            {isLocked && (
                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                                <Lock className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                            <span className="text-sm font-black">{mins}</span>
                            <span className="text-[8px] font-bold uppercase">Mins</span>
                          </button>
                        );
                      })}
                    </div>
                    {!isPaidUser && (
                      <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> 30, 45 & 60 min sessions require a paid plan.
                        <button onClick={() => setShowPricing(true)} className="underline hover:text-amber-700">Upgrade</button>
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:flex-[1.5]">
                    <Button
                      className={`w-full h-[72px] rounded-3xl text-sm font-black uppercase tracking-[0.2em] gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${isAtLimit ? 'bg-rose-600 text-white shadow-rose-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
                      onClick={handleStart}
                      disabled={loading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Initializing...</span>
                        </div>
                      ) : isAtLimit ? (
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 fill-current" />
                          <span>{(user as any)?.role === 'student' ? 'Interview Limit Reached' : 'Upgrade to Continue'}</span>
                          <ArrowRight className="w-5 h-5 opacity-50" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5" />
                          <span>Start Ai for job</span>
                          <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploadingResume && setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Select or Upload Resume</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Choose a saved resume from your vault or upload a new one.</p>
                </div>
                <button disabled={uploadingResume} onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Upload New */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Upload className="w-4 h-4 text-blue-500" /> Upload New
                      </h4>

                      {/* Resume Limits Indicator */}
                      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Limit</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isAtResumeLimit ? 'bg-rose-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                            {totalResumes} / {resumeLimit}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalResumes / resumeLimit) * 100, 100)}%` }}
                            className={`h-full transition-all duration-500 ${isAtResumeLimit ? 'bg-rose-500' : 'bg-blue-600'}`}
                          />
                        </div>
                      </div>

                      {isAtResumeLimit ? (
                        <div className="space-y-4">
                          <div className="text-center p-4">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">You've reached the maximum number of resumes you can securely store.</p>
                          </div>
                          {(user as any)?.role !== 'student' && (
                            <Button
                              onClick={() => {
                                setShowUploadModal(false);
                                setShowPricing(true);
                              }}
                              className="w-full h-12 rounded-xl font-bold gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-lg"
                            >
                              <TrendingUp className="w-5 h-5" />
                              Upgrade Plan
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.docx,.doc"
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                              className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                            />
                          </div>
                          <Button
                            disabled={!uploadFile || uploadingResume}
                            onClick={handleUploadNewResume}
                            className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg"
                          >
                            {uploadingResume ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                Upload & Select
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: History */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-indigo-500" /> Saved Resumes ({resumes.length})
                    </h4>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {resumes.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm font-bold text-slate-400">No resumes saved yet.</p>
                        </div>
                      ) : (
                        resumes.map((resume) => {
                          const resumeId = resume.id || resume._id;
                          const isBest = resumeId === bestResumeId;
                          const score = resume.analytics?.cv_quality?.overall_score || 0;

                          return (
                            <button
                              key={resumeId}
                              disabled={uploadingResume}
                              onClick={() => handleSelectResume(resume)}
                              className="w-full flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-2xl transition-all group shadow-sm text-left relative overflow-hidden"
                            >
                              {isBest && (
                                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                  <div className="absolute transform rotate-45 bg-[#ffc107] text-[8px] font-black uppercase tracking-widest text-amber-900 py-0.5 right-[-20px] top-[14px] w-[80px] text-center shadow-sm">
                                    Best
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-4 flex-1 pr-8">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isBest ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                  <FileText className={`w-5 h-5 ${isBest ? 'text-amber-500' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-900 dark:text-white truncate mb-0.5">{resume.filename}</p>
                                  <div className="flex items-center gap-2">
                                    {score > 0 && (
                                      <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${isBest ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                                        <Award className="w-3 h-3" /> {score}/100
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-500 flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all shrink-0">
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
