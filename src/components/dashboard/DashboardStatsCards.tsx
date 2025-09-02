import React from "react";
import { DocumentTextIcon, StarIcon, AcademicCapIcon, BriefcaseIcon } from "./DashboardIcons";
import StatCard from "@/components/dashboad/StatCard";

interface DashboardStatsCardsProps {
  totalResumes: number;
  avgFitIndex: number;
  avgCVQuality: number;
  avgJDMatch: number;
}

const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ totalResumes, avgFitIndex, avgCVQuality, avgJDMatch }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard
      title="Total Resumes"
      value={totalResumes}
      icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />}
      color="bg-blue-50"
      subtitle="Uploaded & analyzed"
    />
    <StatCard
      title="Avg Fit Index"
      value={avgFitIndex}
      icon={<StarIcon className="w-5 h-5 text-green-600" />}
      color="bg-green-50"
      subtitle="Job compatibility"
    />
    <StatCard
      title="Avg CV Quality"
      value={avgCVQuality}
      icon={<AcademicCapIcon className="w-5 h-5 text-purple-600" />}
      color="bg-purple-50"
      subtitle="Content & structure"
    />
    <StatCard
      title="Avg JD Match"
      value={avgJDMatch}
      icon={<BriefcaseIcon className="w-5 h-5 text-orange-600" />}
      color="bg-orange-50"
      subtitle="Requirements alignment"
    />
  </div>
);

export default DashboardStatsCards;
