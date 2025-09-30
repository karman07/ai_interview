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
  MessageCircle
} from "lucide-react";

interface InterviewDetails {
  role: string;
  company: string;
  jobDescription: string;
  experience: string;
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

    // Store locally so InterviewRoom can access
    localStorage.setItem("interview_details", JSON.stringify(details));
    console.log("Interview details saved:", type, details);

    setTimeout(() => {
      navigate(`/interview/room/${type}`);
    }, 500);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${interviewInfo.color} text-white rounded-2xl mb-6 shadow-lg`}>
            {interviewInfo.icon}
            <span className="font-semibold text-lg">{interviewInfo.title}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Prepare for Your Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Interview Details
                </CardTitle>
                <p className="text-gray-600 mt-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Job Description
              </label>
              <Textarea
                placeholder="Paste the complete job description here. Include responsibilities, requirements, and qualifications to get more relevant questions..."
                value={details.jobDescription}
                onChange={handleInputChange('jobDescription')}
                className="min-h-[150px] group-hover:border-orange-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 The more detailed the job description, the more personalized your interview questions will be
              </p>
            </div>

            {/* Form validation indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl">
              {formFields.map((item) => (
                <div key={item.field} className="flex items-center gap-2">
                  <CheckCircle 
                    className={`w-4 h-4 ${details[item.field] ? 'text-green-500' : 'text-gray-300'}`} 
                  />
                  <span className={`text-sm ${details[item.field] ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
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
                <p className="text-center text-gray-500 text-sm mt-3">
                  Please complete all fields to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
            <div className={`w-2 h-2 bg-gradient-to-r ${interviewInfo.color} rounded-full`}></div>
            <span>Your information is used only to personalize the interview experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}