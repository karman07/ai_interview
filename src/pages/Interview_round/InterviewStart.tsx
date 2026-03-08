import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/button";
import {
  Briefcase, Building2, FileText, Layers, Loader2, ArrowRight,
  Users, Code, Lightbulb, MessageCircle,
  Award, BarChart3, Eye, Upload, X, CheckCircle, Clock, TrendingUp, Zap
} from "lucide-react";
import { InterviewAnalyticsApi, type Analytics, type RoundStats } from "@/api/interviewAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing } from "@/contexts/PricingContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";

interface InterviewDetails {
  role: string;
  company: string;
  jobDescription: string;
  resumeText: string;
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
    role: preFilledData?.role || "",
    company: preFilledData?.company || "",
    jobDescription: preFilledData?.jobDescription || "",
    resumeText: "",
  });
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    InterviewAnalyticsApi.getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

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
    const planName = (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object')
      ? (user.subscriptionPlan as any).name
      : user?.subscriptionPlan;

    if (user?.subscriptionStatus === 'active' || (planName && planName !== 'free_tier_in')) {
      if (planName?.toString().includes('pro_tier_200')) return 20;
      if (planName?.toString().includes('pro_tier_100')) return 10;
      if (planName?.toString().includes('enterprise')) return 1000;
    }

    return 3; // Default free tier
  }, [user]);

  const totalInterviewsTaken = analytics?.overall?.totalInterviews || 0;
  const isAtLimit = totalInterviewsTaken >= interviewLimit;

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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`File too large. Maximum size is 10MB.`);
        return;
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

  const handleStart = async () => {
    if (isAtLimit) {
      setShowPricing(true);
      return;
    }

    if (!details.role || !details.company) {
      setError("Please fill in role and company");
      return;
    }

    if (!details.resumeFile && !details.resumeText) {
      setError("Please provide your resume (upload file or enter text)");
      return;
    }

    if (!details.jdFile && !details.jobDescription) {
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

      if (details.resumeFile && !resumeText) {
        resumeText = await readFileAsText(details.resumeFile);
      }
      if (details.jdFile && !jdText) {
        jdText = await readFileAsText(details.jdFile);
      }

      const setupData = {
        resumeText,
        jdText,
        role: details.role,
        company: details.company,
        roundType: type || 'technical',
        userId: user._id,
        duration,
      };

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
            Our AI interviewer will analyze your resume and the job description to provide a realistic, role-specific session.
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
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Target Role
                    </label>
                    <Input
                      placeholder="e.g., Senior Fullstack Developer"
                      value={details.role}
                      onChange={(e) => setDetails({ ...details, role: e.target.value })}
                      className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" /> Target Company
                    </label>
                    <Input
                      placeholder="e.g., Google / Startup / Meta"
                      value={details.company}
                      onChange={(e) => setDetails({ ...details, company: e.target.value })}
                      className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-semibold focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Resume Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <FileText className="w-3.5 h-3.5 text-blue-500" /> Resume / CV
                    </label>
                    <div className="group relative">
                      {details.resumeFile ? (
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl flex items-center justify-between">
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
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => handleFileChange(e, 'resume')}
                              accept=".pdf,.docx,.txt"
                            />
                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-3 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all duration-300">
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <Upload className="w-6 h-6 text-blue-500" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Upload Resume</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, DOCX, TXT • MAX 10MB</p>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-x-4 top-0 -translate-y-1/2 flex justify-center">
                              <span className="px-2 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-300 uppercase tracking-widest translate-y-[-12px]">OR PASTE TEXT</span>
                            </div>
                            <Textarea
                              placeholder="Paste your resume content here..."
                              className="min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-blue-500/20"
                              value={details.resumeText}
                              onChange={(e) => setDetails({ ...details, resumeText: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JD Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Job Description
                    </label>
                    <div className="group relative">
                      {details.jdFile ? (
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
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => handleFileChange(e, 'jd')}
                              accept=".pdf,.docx,.txt"
                            />
                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-3 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all duration-300">
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
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setDuration(mins)}
                          className={`flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all ${duration === mins
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 scale-105'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-200'}`}
                        >
                          <span className="text-sm font-black">{mins}</span>
                          <span className="text-[8px] font-bold uppercase">Mins</span>
                        </button>
                      ))}
                    </div>
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
                          <span>Upgrade to Continue</span>
                          <ArrowRight className="w-5 h-5 opacity-50" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5" />
                          <span>Start AI Interview</span>
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
    </div>
  );
}
