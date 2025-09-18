import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  HelpCircle,
  Users,
  FileText,
  Briefcase,
  Target,
  X,
  Menu,
  Home,
  Zap,
  BookOpen,
  Layers,
} from "lucide-react";
import colors from "@/constants/colors";
import { cn } from "@/utils/cn";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";

// Define static routes with no params
const sidebarRoutes = [
  {
    section: "Core Features",
    items: [
      {
    label: "Dashboard",
    icon: <Home size={18} />, // represents home / overview
    description: "Tells about your resume",
    path: "/dashboard",
  },
  {
    label: "AI Quiz",
    icon: <Zap size={18} />, // represents action / challenge / AI quiz
    description: "Practice with AI interviewer",
    path: "/interview_round",
  },
  {
    label: "Preparation Hub",
    icon: <BookOpen size={18} />, // represents learning / study materials
    description: "Resources & study materials",
    path: "/subjects",
  },
  {
    label: "Resources",
    icon: <Layers size={18} />, // represents resources / organized content
    description: "Resources & study materials",
    path: "/resources",
  },
  {
    label: "Job Search",
    icon: <Briefcase size={18} />, // represents career / jobs
    description: "Job Search",
    path: "/jobs",
  },
    ],
  },
  {
    section: "Advanced Tools",
    items: [
      { label: "AI Material Generator", icon: <FileText size={18} />, description: "Custom content creation", path: "/ai-material-generator" },
      { label: "AI Job Hunter", icon: <Briefcase size={18} />, badge: "Beta", description: "Automated job matching", path: "/ai-job-hunter" },
      { label: "AI Career Coach", icon: <User size={18} />, description: "Personalized guidance", path: "/ai-career-coach" },
      { label: "Speak with Recruiters", icon: <Users size={18} />, description: "Connect with industry experts", path: "/speak-with-recruiters" },
      { label: "AI Salary Calculator", icon: <FileText size={18} />, description: "Market-based estimates", path: "/ai-salary-calculator" },
      { label: "Interview Question Bank", icon: <HelpCircle size={18} />, description: "Curated question database", path: "/interview-question-bank" },
    ],
  },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  console.log(activeItem)
  const handleItemClick = (path: string) => {
    setActiveItem(path);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <Target size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: colors.text }}>AI Coach</h2>
        </div>
        <button onClick={toggleMobileMenu} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />}

      {/* Mobile Sidebar */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ backgroundColor: colors.background }}>
        <div className="p-6 pt-20">
          {sidebarRoutes.map((section, sectionIndex) => (
            <SidebarSection key={sectionIndex} title={section.section}>
              {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  description={item.description}
                  active={location.pathname === item.path}
                  onClick={() => handleItemClick(item.path)}
                />
              ))}
            </SidebarSection>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen border-r border-gray-200" style={{ backgroundColor: colors.background }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <Target size={16} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: colors.text }}>AI Coach</h2>
          </div>

          {sidebarRoutes.map((section, sectionIndex) => (
            <SidebarSection key={sectionIndex} title={section.section}>
              {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  description={item.description}
                  active={location.pathname === item.path}
                  onClick={() => handleItemClick(item.path)}
                />
              ))}
            </SidebarSection>
          ))}
        </div>
      </div>
    </>
  );
}
