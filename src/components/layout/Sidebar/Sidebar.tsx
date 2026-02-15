import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Zap,
  BookOpen,
  Target,
  Layers,
  X,
  Menu,
  Moon,
  Sun,
  Briefcase,
} from "lucide-react";

import { cn } from "@/utils/cn";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { useTheme } from "@/contexts/ThemeContext";

const sidebarRoutes = [
  {
    section: "Core Features",
    items: [
      {
        label: "Dashboard",
        icon: <Home size={18} />,
        description: "Tells about your resume",
        path: "/dashboard",
      },
      {
        label: "AI interview",
        icon: <Zap size={18} />,
        description: "Practice with AI interviewer",
        path: "/interview_round",
      },
      {
        label: "Preparation Hub",
        icon: <BookOpen size={18} />,
        description: "Resources & study materials",
        path: "/subjects",
      },
      {
        label: "Resources",
        icon: <Layers size={18} />,
        description: "Resources & study materials",
        path: "/resources",
      }
      ,
      {
        label: "Job Portal",
        icon: <Briefcase size={18} />,
        description: "Browse jobs & applications",
        path: "/employee",
      },
    ],
  },
];

export default function Sidebar() {
  const [_, setActiveItem] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    setActiveItem(path);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary">
            <Target size={18} className="text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            AI Coach
          </h2>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} className="text-gray-900 dark:text-white" /> : <Menu size={24} className="text-gray-900 dark:text-white" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto bg-white dark:bg-gray-900",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 pt-20">
          {sidebarRoutes.map((section, sectionIndex) => (
            <SidebarSection key={sectionIndex} title={section.section}>
              {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  active={location.pathname === item.path}
                  onClick={() => handleItemClick(item.path)}
                />
              ))}
            </SidebarSection>
          ))}

          {/* Theme Toggle */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 border border-transparent transition-all duration-200"
            >
              <div className="flex-shrink-0 p-1.5 rounded-md text-gray-600 dark:text-gray-400">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Switch to {theme === 'dark' ? 'light' : 'dark'} theme
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary shadow-sm">
              <Target size={18} className="text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              AI Coach
            </h2>
          </div>

          {sidebarRoutes.map((section, sectionIndex) => (
            <SidebarSection key={sectionIndex} title={section.section}>
              {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  active={location.pathname === item.path}
                  onClick={() => handleItemClick(item.path)}
                />
              ))}
            </SidebarSection>
          ))}

          {/* Theme Toggle */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 border border-transparent transition-all duration-200"
            >
              <div className="flex-shrink-0 p-1.5 rounded-md text-gray-600 dark:text-gray-400">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Switch to {theme === 'dark' ? 'light' : 'dark'} theme
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
