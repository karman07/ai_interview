import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/button";
import {
  Briefcase, Building2, FileText, Layers, Loader2, ArrowRight,
  Users, Code, Lightbulb, MessageCircle,
  Award, BarChart3, Eye, Upload, X, CheckCircle, Clock
} from "lucide-react";
import { InterviewAnalyticsApi, type Analytics, type RoundStats } from "@/api/interviewAnalytics";
import { useAuth } from "@/contexts/AuthContext";

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
    technical: { icon: <Code className="w-6 h-6" />, color: "from-blue-500 to-blue-600", title: "Technical Round" },
    behavioral: { icon: <Users className="w-6 h-6" />, color: "from-emerald-500 to-emerald-600", title: "Behavioral Round" },
    problem: { icon: <Lightbulb className="w-6 h-6" />, color: "from-amber-500 to-orange-500", title: "Problem Solving Round" },
    hr: { icon: <MessageCircle className="w-6 h-6" />, color: "from-purple-500 to-purple-600", title: "HR Round" }
  };
  const info = types[type as keyof typeof types] || types.technical;

  const roundMap: Record<string, keyof Analytics> = { technical: 'technical', behavioral: 'behavioral', problem: 'problemSolving', hr: 'hr' };
  const roundData = analytics && type ? analytics[roundMap[type] as keyof Analytics] : null;
  const stats = (roundData && typeof roundData === 'object' && 'averageScore' in roundData) ? roundData as RoundStats : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'jd') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
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

  const handleStart = async () => {
    // Validation
    if (!details.role || !details.company) {
      setError("Please fill in role and company");
      return;
    }

    // Either resume file/text is required
    if (!details.resumeFile && !details.resumeText) {
      setError("Please provide your resume (upload file or enter text)");
      return;
    }

    // Either JD file/text is required
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
      // Extract text from files if needed
      let resumeText = details.resumeText;
      let jdText = details.jobDescription;

      if (details.resumeFile && !resumeText) {
        resumeText = await readFileAsText(details.resumeFile);
      }
      if (details.jdFile && !jdText) {
        jdText = await readFileAsText(details.jdFile);
      }

      // Save raw setup data for the Python WebSocket backend
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

      // Navigate to the interview room
      navigate(`/interview/room/${type}`);
    } catch (err: any) {
      setError(err.message || 'Failed to prepare interview');
      setLoading(false);
    }
  };

  // Helper to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${info.color} text-white rounded-2xl mb-6 shadow-xl`}>
            {info.icon}
            <span className="font-semibold text-lg">{info.title}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Prepare for Your Interview</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Analytics Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <div className={`h-2 bg-gradient-to-r ${info.color}`}></div>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <BarChart3 className="w-5 h-5" /> Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Best</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.bestScore?.toFixed(1)}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalSessions}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No data yet</p>
                  </div>
                )}
                <Link to="/interview/history" className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                  <Eye className="w-4 h-4" /> View History
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <div className={`h-2 bg-gradient-to-r ${info.color}`}></div>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                    </div>
                    <button onClick={() => setError("")} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Role <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={details.role}
                      onChange={(e) => setDetails({ ...details, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Google"
                      value={details.company}
                      onChange={(e) => setDetails({ ...details, company: e.target.value })}
                    />
                  </div>
                </div>

                {/* Resume Upload Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resume <span className="text-red-500">*</span>
                  </label>

                  {!details.resumeFile ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileChange(e, 'resume')}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50"
                        >
                          <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Upload Resume (PDF, DOCX, TXT)
                          </span>
                        </label>
                      </div>
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>
                      <Textarea
                        placeholder="Paste your resume text here..."
                        value={details.resumeText}
                        onChange={(e) => setDetails({ ...details, resumeText: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{details.resumeFile.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(details.resumeFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('resume')}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Description Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Job Description <span className="text-red-500">*</span>
                  </label>

                  {!details.jdFile ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileChange(e, 'jd')}
                          className="hidden"
                          id="jd-upload"
                        />
                        <label
                          htmlFor="jd-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50"
                        >
                          <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Upload Job Description (PDF, DOCX, TXT)
                          </span>
                        </label>
                      </div>
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>
                      <Textarea
                        placeholder="Paste job description here..."
                        value={details.jobDescription}
                        onChange={(e) => setDetails({ ...details, jobDescription: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{details.jdFile.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(details.jdFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('jd')}
                        className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Interview Duration
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 15, label: '⚡ 15 min', desc: 'Quick round' },
                      { value: 30, label: '⏱️ 30 min', desc: 'Standard' },
                      { value: 0, label: '🎯 No Limit', desc: 'Full interview' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDuration(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${duration === opt.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-xs opacity-70">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleStart}
                  disabled={loading || !details.role || !details.company || (!details.resumeFile && !details.resumeText) || (!details.jdFile && !details.jobDescription)}
                  className={`w-full flex items-center justify-center gap-3 ${details.role && details.company && (details.resumeFile || details.resumeText) && (details.jdFile || details.jobDescription)
                    ? `bg-gradient-to-r ${info.color}`
                    : 'bg-gray-300'
                    } text-white font-bold py-4 rounded-2xl`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6" />
                      Starting Interview with AI...
                    </>
                  ) : (
                    <>
                      <span>Start AI Interview</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
