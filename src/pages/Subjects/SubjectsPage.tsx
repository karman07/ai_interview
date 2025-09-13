import React from "react";
import { SubjectsList } from "@/components/Subjects/SubjectsList";
const SubjectsPage: React.FC = () => {
  return (

      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Explore Our Subjects
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Discover comprehensive learning materials across various disciplines
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SubjectsList />
        </div>
      </div>

  );
};

export default SubjectsPage;