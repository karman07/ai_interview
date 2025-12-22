import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/common/Input";
import { Textarea } from "@/components/ui/Textarea";
import Button from "@/components/ui/button";
import { 
  Briefcase,
  Building2,
  FileText,
  Layers,
  Loader2,
  ArrowRight,
  CheckCircle,
  Users,
  Code,
  Lightbulb,
  MessageCircle,
  Upload,
  CheckCircle2
} from "lucide-react";

interface InterviewDetails {
  role: string;
  company: string;
  jobDescription: string;
  experience: string;
  cvFile?: File;
  jdFile?: File;
}

interface InterviewInfo {
  icon: JSX.Element;
  color: string;
  title: string;
  description: string;
}

export default function InterviewStart(): JSX.Element {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<InterviewDetails>({
    role: "",
    company: "",
    jobDescription: "",
    experience: "",
    cvFile: undefined,
    jdFile: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Get interview type info
  const getInterviewInfo = (interviewType: string | undefined): InterviewInfo => {
    const types: Record<string, InterviewInfo> = {
      technical: {
        icon: <Code className="w-6 h-6" />,
        color: "from-blue-500 to-blue-600",
        title: "Technical Round",
        description: "Coding challenges, system design, and technical expertise evaluation"
      },
      behavioral: {
        icon: <Users className="w-6 h-6" />,
        color: "from-emerald-500 to-emerald-600",
        title: "Behavioral Round",
        description: "Culture fit assessment and experience-based questions"
      },
      problem: {
        icon: <Lightbulb className="w-6 h-6" />,
        color: "from-amber-500 to-orange-500",
        title: "Problem Solving Round",
        description: "Analytical thinking and logical reasoning challenges"
      },
      hr: {
        icon: <MessageCircle className="w-6 h-6" />,
        color: "from-purple-500 to-purple-600",
        title: "HR Round",
        description: "Final discussion about role expectations and compensation"
      }
    };
    return types[interviewType || 'technical'] || types.technical;
  };

  const interviewInfo: InterviewInfo = getInterviewInfo(type);

  const handleStart = (): void => {
    if (
      !details.role ||
      !details.company ||
      !details.jobDescription ||
      !details.experience
    ) {
      alert("Please fill in all fields before starting the interview.");
      return;
    }
    setLoading(true);

    // Create a serializable version of details for localStorage
    const serializableDetails = {
      role: details.role,
      company: details.company,
      jobDescription: details.jobDescription,
      experience: details.experience,
      industry: 'Technology', // Default industry
      // Note: Files cannot be stored in localStorage, they'll be handled differently
      hasCV: !!details.cvFile,
      hasJD: !!details.jdFile
    };

    // Store basic details in localStorage
    localStorage.setItem("interview_details", JSON.stringify(serializableDetails));
    
    // Store files in sessionStorage as base64 if they exist
    if (details.cvFile) {
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('cvFile', JSON.stringify({
          name: details.cvFile!.name,
          type: details.cvFile!.type,
          data: reader.result
        }));
      };
      reader.readAsDataURL(details.cvFile);
    }
    
    if (details.jdFile) {
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('jdFile', JSON.stringify({
          name: details.jdFile!.name,
          type: details.jdFile!.type,
          data: reader.result
        }));
      };
      reader.readAsDataURL(details.jdFile);
    }

    console.log("Interview details saved:", type, serializableDetails);

    setTimeout(() => {
      navigate(`/interview/room/${type}`);
    }, 500);
  };

  // File upload component
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
      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : file ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'}`} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const files = e.dataTransfer.files; if (files.length > 0 && validateFile(files[0])) { setFile(files[0]); } }}>
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : file ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
        <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" id={`${label.toLowerCase()}-upload`} onChange={(e) => { const selectedFile = e.target.files?.[0]; if (selectedFile && validateFile(selectedFile)) { setFile(selectedFile); } }} />
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="font-medium text-green-800 dark:text-green-400 text-sm">{file.name}</span></div>
            <label htmlFor={`${label.toLowerCase()}-upload`} className="cursor-pointer inline-block"><span className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">Choose different file</span></label>
          </div>
        ) : (
          <label htmlFor={`${label.toLowerCase()}-upload`} className="cursor-pointer block">
            <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">{isDragOver ? 'Drop file here' : `Upload ${label} File`}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT (max 10MB)</div>
          </label>
        )}
      </div>
    );
  };

  const isFormValid: boolean = !!(details.role && details.company && details.jobDescription && details.experience);

  const handleInputChange = (field: keyof InterviewDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setDetails({ ...details, [field]: e.target.value });
  };

  const formFields = [
    { field: 'role' as keyof InterviewDetails, label: 'Role' },
    { field: 'company' as keyof InterviewDetails, label: 'Company' },
    { field: 'experience' as keyof InterviewDetails, label: 'Experience' },
    { field: 'jobDescription' as keyof InterviewDetails, label: 'Job Description' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${interviewInfo.color} text-white rounded-2xl mb-6 shadow-lg`}>
            {interviewInfo.icon}
            <span className="font-semibold text-lg">{interviewInfo.title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Prepare for Your Interview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {interviewInfo.description}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <Card className="overflow-hidden">
          {/* Progress indicator */}
          <div className={`h-2 bg-gradient-to-r ${interviewInfo.color}`}></div>
          
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Interview Details
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Provide information about the role to get personalized questions
                </p>
              </div>
              <div className="hidden md:block">
                <div className={`w-16 h-16 bg-gradient-to-br ${interviewInfo.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {interviewInfo.icon}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Target Role
                </label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={details.role}
                  onChange={handleInputChange('role')}
                  className="group-hover:border-blue-300"
                />
              </div>

              {/* Company */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  Company Name
                </label>
                <Input
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  value={details.company}
                  onChange={handleInputChange('company')}
                  className="group-hover:border-emerald-300"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Your Experience
              </label>
              <Input
                placeholder="e.g., 5 years in full-stack development with React and Node.js"
                value={details.experience}
                onChange={handleInputChange('experience')}
                className="group-hover:border-purple-300"
              />
            </div>

            {/* Job Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Job Description
              </label>
              <div className="space-y-3">
                <FileUploadBox 
                  file={details.jdFile || null} 
                  setFile={(file) => setDetails({...details, jdFile: file || undefined})} 
                  label="JD" 
                />
                <Textarea
                  placeholder="Or paste the complete job description here. Include responsibilities, requirements, and qualifications to get more relevant questions..."
                  value={details.jobDescription}
                  onChange={handleInputChange('jobDescription')}
                  className="min-h-[150px] group-hover:border-orange-300"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Upload a JD file or paste text - the more detailed, the more personalized your interview questions will be
              </p>
            </div>

            {/* CV Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Upload Your CV (Optional)
              </label>
              <FileUploadBox 
                file={details.cvFile || null} 
                setFile={(file) => setDetails({...details, cvFile: file || undefined})} 
                label="CV" 
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                📄 Upload your resume for more personalized questions based on your background
              </p>
            </div>

            {/* Form validation indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              {formFields.map((item) => (
                <div key={item.field} className="flex items-center gap-2">
                  <CheckCircle 
                    className={`w-4 h-4 ${details[item.field] ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} 
                  />
                  <span className={`text-sm ${details[item.field] ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <CheckCircle 
                  className={`w-4 h-4 ${details.cvFile ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} 
                />
                <span className={`text-sm ${details.cvFile ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  CV File
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle 
                  className={`w-4 h-4 ${details.jdFile ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} 
                />
                <span className={`text-sm ${details.jdFile ? 'text-green-700 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  JD File
                </span>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                className={`w-full flex items-center justify-center gap-3 ${
                  isFormValid 
                    ? `bg-gradient-to-r ${interviewInfo.color} hover:shadow-2xl` 
                    : 'bg-gray-300'
                } text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
                onClick={handleStart}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    <span>Preparing Interview...</span>
                  </>
                ) : (
                  <>
                    <span>Start {interviewInfo.title}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
              
              {!isFormValid && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-3">
                  Please complete all fields to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`w-2 h-2 bg-gradient-to-r ${interviewInfo.color} rounded-full`}></div>
            <span>Your information is used only to personalize the interview experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}