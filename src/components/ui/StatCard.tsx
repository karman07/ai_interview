import React from "react";

interface StatCardProps {
  number: string;
  label: string;
  icon: React.ElementType;
}

export default function StatCard({ number, label, icon: Icon }: StatCardProps) {
  return (
    <div className="text-center group">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}
