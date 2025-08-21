import { Briefcase, FileText, HelpCircle, User, Users } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-background border-r border-gray-200 p-4">
      {/* Header */}
      <h2 className="text-lg font-bold text-primary mb-6">Final Round</h2>

      {/* Interview Section */}
      <SidebarSection>
        <SidebarItem icon={<User size={18} />} label="Interview Copilot" active />
        <SidebarItem icon={<HelpCircle size={18} />} label="Mock Interview" />
        <SidebarItem icon={<Users size={18} />} label="Preparation Hub" />
        <SidebarItem icon={<FileText size={18} />} label="AI Resume Builder" />
      </SidebarSection>

      {/* Stealth Mode */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
        <p className="text-sm font-semibold text-primary">Stealth Mode is now available</p>
        <p className="text-xs text-gray-600">
          Keep Interview Copilot invisible in any screen share.
        </p>
        <button className="mt-2 text-xs bg-secondary text-white px-2 py-1 rounded">
          Access Now
        </button>
      </div>

      {/* Tools */}
      <SidebarSection title="Tools">
        <SidebarItem icon={<FileText size={18} />} label="AI Material Generator" />
        <SidebarItem icon={<Briefcase size={18} />} label="AI Job Hunter" badge="Beta" />
        <SidebarItem icon={<User size={18} />} label="AI Career Coach" />
        <SidebarItem icon={<Users size={18} />} label="Speak with Recruiters" />
        <SidebarItem icon={<FileText size={18} />} label="AI Salary Calculator" />
        <SidebarItem icon={<HelpCircle size={18} />} label="Interview Question Bank" />
      </SidebarSection>
    </div>
  );
}
