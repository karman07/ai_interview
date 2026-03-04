import React, { useState, useEffect } from 'react';
import ResumeTemplate from '../components/ResumeBuilder/templates/ResumeTemplate';
import ModernTemplate from '../components/ResumeBuilder/templates/ModernTemplate';
import MinimalistTemplate from '../components/ResumeBuilder/templates/MinimalistTemplate';
import ClassicTemplate from '../components/ResumeBuilder/templates/ClassicTemplate';
import CreativeTemplate from '../components/ResumeBuilder/templates/CreativeTemplate';
import CompactTemplate from '../components/ResumeBuilder/templates/CompactTemplate';
import ExecutiveTemplate from '../components/ResumeBuilder/templates/ExecutiveTemplate';
import CustomizationPanel from '../components/ResumeBuilder/panels/CustomizationPanel';
import ContentPanel from '../components/ResumeBuilder/panels/ContentPanel';
import { generatePDF } from '../utils/htmlPdfGenerator';
import { ResumeBuilderData, ResumeBuilderSettings } from '../types/ResumeBuilder';

const initialData: { status: string; resume_content: ResumeBuilderData } = {
    "status": "success",
    "resume_content": {
        "personal_info": {
            "name": "Your Name",
            "email": "email@example.com",
            "phone": "+91 0000000000",
            "location": "City, Country",
            "linkedin": "linkedin.com/in/username",
            "github": "github.com/username",
            "website": "portfolio.example.com"
        },
        "professional_summary": "Deeply experienced Full-Stack Developer with a focus on modern web technologies...",
        "skills": {
            "frontend": ["JavaScript", "TypeScript", "React"],
            "backend": ["Node.js", "Express.js", "FastAPI"],
            "tools_cloud": ["Git", "Docker", "AWS"]
        },
        "experience": [
            {
                "title": "Software Engineer",
                "company": "Tech Corp",
                "location": "Remote",
                "duration": "Jan 2023 - Present",
                "description": [
                    "Developed scalable web applications using React and Node.js.",
                    "Optimized database queries for improved performance."
                ],
                "technologies": ["React", "Node.js", "PostgreSQL"]
            }
        ],
        "projects": [
            {
                "name": "AI Tool",
                "description": "An AI-powered document analysis tool.",
                "technologies": ["Python", "FastAPI", "React"],
                "github": "https://github.com/username/project",
                "demo": "https://demo.com",
                "highlights": ["Built real-time processing engine", "Integrated LLMs"]
            }
        ],
        "education": [
            {
                "degree": "B.Tech in Computer Science",
                "field": "Engineering",
                "institution": "Tech University",
                "duration": "2019 - 2023",
                "gpa": "3.8/4.0"
            }
        ],
        "achievements": ["Won National Level Hackathon", "Published research paper on ML"],
        "certifications": [
            {
                "name": "AWS Certified Developer",
                "issuer": "Amazon",
                "date": "2026"
            }
        ],
        "languages": [
            { "language": "English", "proficiency": "Professional" }
        ]
    }
};

const ResumeBuilder: React.FC = () => {
    const [resumeData, setResumeData] = useState(initialData);
    const [activePanel, setActivePanel] = useState<'customize' | 'content'>('customize');
    const [settings, setSettings] = useState<ResumeBuilderSettings>({
        selectedTemplate: 'Standard',
        primaryColor: '#2563eb', // blue-600
        secondaryColor: '#4b5563', // gray-600
        fontFamily: 'Inter',
        headingSize: 'Medium'
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dataParam = params.get('data');
        const jsonParam = params.get('json');

        if (dataParam) {
            try {
                const parsed = JSON.parse(dataParam);
                if (parsed && typeof parsed === 'object') setResumeData(parsed);
            } catch (e) {
                console.error('Invalid JSON in data query parameter:', e);
            }
        } else if (jsonParam) {
            try {
                const parsed = JSON.parse(jsonParam);
                if (parsed && typeof parsed === 'object') setResumeData(parsed);
            } catch (e) {
                console.error('Invalid JSON in json query parameter:', e);
            }
        }
    }, []);

    const handleDownload = () => {
        generatePDF('resume-preview', `Resume_${resumeData.resume_content.personal_info.name.replace(/\s+/g, '_')}.pdf`);
    };

    const renderTemplate = () => {
        const props = { data: resumeData, settings };
        switch (settings.selectedTemplate) {
            case 'Modern': return <ModernTemplate {...props} />;
            case 'Minimalist': return <MinimalistTemplate {...props} />;
            case 'Classic': return <ClassicTemplate {...props} />;
            case 'Creative': return <CreativeTemplate {...props} />;
            case 'Compact': return <CompactTemplate {...props} />;
            case 'Executive': return <ExecutiveTemplate {...props} />;
            default: return <ResumeTemplate {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        {new URLSearchParams(window.location.search).get('mode') !== 'standalone' && (
                            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
                        )}
                        <div className="bg-white rounded-lg shadow p-1 flex">
                            <button
                                onClick={() => setActivePanel('customize')}
                                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activePanel === 'customize' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Customize
                            </button>
                            <button
                                onClick={() => setActivePanel('content')}
                                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activePanel === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Edit Content
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download PDF
                    </button>
                </header>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <aside className="w-full md:w-auto shrink-0 z-10 sticky top-8">
                        {activePanel === 'customize' ? (
                            <CustomizationPanel settings={settings} setSettings={setSettings} />
                        ) : (
                            // @ts-ignore - ContentPanel might need more thorough type fixing
                            <ContentPanel data={resumeData} setData={setResumeData} />
                        )}
                    </aside>

                    <main className="flex-grow overflow-auto flex justify-center pb-20 w-full">
                        <div className="bg-white shadow-2xl origin-top scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100 transition-transform">
                            {renderTemplate()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
