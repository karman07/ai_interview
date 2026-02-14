import React from "react";
import { SubjectsList } from "@/components/Subjects/SubjectsList";
const SubjectsPage: React.FC = () => {
  return (

    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Explore Our Subjects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover comprehensive learning materials across various disciplines
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900">
        <SubjectsList />
      </div>
    </div>

  );
};

export default SubjectsPage;