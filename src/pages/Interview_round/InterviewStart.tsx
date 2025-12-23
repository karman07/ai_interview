import  { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/button";
import { 
  Briefcase, Building2, FileText, Layers, Loader2, ArrowRight,
  Users, Code, Lightbulb, MessageCircle, Upload, CheckCircle2,
  Award, BarChart3, Eye
} from "lucide-react";
import { InterviewAnalyticsApi, type Analytics, type RoundStats } from "@/api/interviewAnalytics";

interface InterviewDetails {
  role: string;
  company: string;
  jobDescription: string;
  experience: string;
  cvFile?: File;
  jdFile?: File;
}

export default function InterviewStart() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<InterviewDetails>({
    role: "", company: "", jobDescription: "", experience: "", cvFile: undefined, jdFile: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

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

  const handleStart = () => {
    if (!details.role || !details.company || !details.jobDescription || !details.experience) {
      alert("Please fill in all fields"); return;
    }
    setLoading(true);
    localStorage.setItem("interview_details", JSON.stringify({ ...details, industry: 'Technology', hasCV: !!details.cvFile, hasJD: !!details.jdFile }));
    setTimeout(() => navigate(`/interview/room/${type}`), 500);
  };

  const FileUpload = ({ file, setFile, label }: { file: File | null; setFile: (f: File | null) => void; label: string }) => (
    <div className="border-2 border-dashed rounded-lg p-4 text-center bg-white dark:bg-gray-800">
      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" id={`${label}-upload`} 
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
      {file ? (
        <div><CheckCircle2 className="w-4 h-4 inline text-green-600" /> <span className="text-sm">{file.name}</span></div>
      ) : (
        <label htmlFor={`${label}-upload`} className="cursor-pointer">
          <div className="text-sm text-gray-700 dark:text-gray-300">Upload {label}</div>
        </label>
      )}
    </div>
  );

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
                <Link to="/interview/analytics" className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                  <Eye className="w-4 h-4" /> View Analytics
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Role
                    </label>
                    <Input placeholder="e.g., Senior Developer" value={details.role} onChange={(e) => setDetails({...details, role: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Company
                    </label>
                    <Input placeholder="e.g., Google" value={details.company} onChange={(e) => setDetails({...details, company: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Experience
                  </label>
                  <Input placeholder="e.g., 5 years in full-stack" value={details.experience} onChange={(e) => setDetails({...details, experience: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Job Description
                  </label>
                  <Textarea placeholder="Paste job description..." value={details.jobDescription} onChange={(e) => setDetails({...details, jobDescription: e.target.value})} className="min-h-[100px]" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FileUpload file={details.cvFile || null} setFile={(f) => setDetails({...details, cvFile: f || undefined})} label="CV" />
                  <FileUpload file={details.jdFile || null} setFile={(f) => setDetails({...details, jdFile: f || undefined})} label="JD" />
                </div>
                <Button onClick={handleStart} disabled={loading || !details.role || !details.company || !details.jobDescription || !details.experience}
                  className={`w-full flex items-center justify-center gap-3 ${details.role && details.company && details.jobDescription && details.experience ? `bg-gradient-to-r ${info.color}` : 'bg-gray-300'} text-white font-bold py-4 rounded-2xl`}>
                  {loading ? <><Loader2 className="animate-spin w-6 h-6" /> Preparing...</> : <><span>Start Interview</span><ArrowRight className="w-6 h-6" /></>}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
