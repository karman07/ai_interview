import { Shield, Users, Briefcase, Bot, FileText, Zap } from 'lucide-react';

export const OverviewPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Authentication',
      description: 'Secure JWT-based authentication with refresh tokens'
    },
    {
      icon: Users,
      title: 'Profile Management',
      description: 'Complete user profile management with file uploads'
    },
    {
      icon: Briefcase,
      title: 'Job Management',
      description: 'Create, manage, and track job postings with file support'
    },
    {
      icon: Bot,
      title: 'AI-Powered Matching',
      description: 'Intelligent candidate ranking using AI resume matching'
    },
    {
      icon: FileText,
      title: 'Application Tracking',
      description: 'Comprehensive application management system'
    },
    {
      icon: Zap,
      title: 'Proactive Recruitment',
      description: 'Direct employee outreach and request system'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Complete Employer API Documentation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Complete guide for employers including authentication, job management, candidate management, and AI-powered features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Integration</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Automatic job upload to AI matcher service</li>
              <li>• Intelligent resume-job compatibility scoring</li>
              <li>• Missing keywords identification</li>
              <li>• Improvement suggestions for candidates</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">File Support</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• PDF and Markdown job descriptions</li>
              <li>• Profile image uploads</li>
              <li>• Automatic URL generation</li>
              <li>• Secure file handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};