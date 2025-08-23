import { Briefcase, FileText, HelpCircle, User, Users, Target } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import colors from "@/constants/colors";

export default function Sidebar() {
  return (
    <div
      className="w-64 min-h-screen border-r"
      style={{ 
        backgroundColor: colors.background,
        borderColor: '#e5e7eb'
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <Target size={16} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
              AI Coach
            </h2>
          </div>
          <p className="text-sm" style={{ color: colors.sectionTitle }}>
            AI-powered interview platform
          </p>
        </div>

        {/* Main Features Section */}
        <SidebarSection>
          <div className="mb-3">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.sectionTitle }}>
              Core Features
            </span>
          </div>
          
          <div className="space-y-1">
            <SidebarItem 
              icon={<User size={18} />} 
              label="Resume Dashboard" 
              active 
              description="Tells about you resume"
            />
            <SidebarItem 
              icon={<HelpCircle size={18} />} 
              label="Mock Interview" 
              description="Practice with AI interviewer"
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              label="Preparation Hub" 
              description="Resources & study materials"
            />
            <SidebarItem 
              icon={<FileText size={18} />} 
              label="AI Resume Builder" 
              description="Smart resume optimization"
            />
          </div>
        </SidebarSection>

        {/* Tools Section */}
        <SidebarSection title="Advanced Tools">
          <div className="space-y-1">
            <SidebarItem 
              icon={<FileText size={18} />} 
              label="AI Material Generator" 
              description="Custom content creation"
            />
            <SidebarItem 
              icon={<Briefcase size={18} />} 
              label="AI Job Hunter" 
              badge="Beta" 
              description="Automated job matching"
            />
            <SidebarItem 
              icon={<User size={18} />} 
              label="AI Career Coach" 
              description="Personalized guidance"
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              label="Speak with Recruiters" 
              description="Connect with industry experts"
            />
            <SidebarItem 
              icon={<FileText size={18} />} 
              label="AI Salary Calculator" 
              description="Market-based estimates"
            />
            <SidebarItem 
              icon={<HelpCircle size={18} />} 
              label="Interview Question Bank" 
              description="Curated question database"
            />
          </div>
        </SidebarSection>
      </div>
    </div>
  );
}