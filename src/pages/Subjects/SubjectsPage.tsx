import React from "react";
import { SubjectsList } from "@/components/Subjects/SubjectsList";
const SubjectsPage: React.FC = () => {
  return (

    <div className="min-h-screen bg-white dark:bg-[#0B0F19]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Immersive Header */}
      <div className="relative pt-20 pb-12 border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Curriculum <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Accelerate your professional growth with specialized curricula curated for high-impact AI careers.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <SubjectsList />
      </div>
    </div>

  );
};

export default SubjectsPage;