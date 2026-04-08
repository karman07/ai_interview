import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Zap,
  Target,
  Layers,
  X,
  Menu,
  Moon,
  Sun,
  Briefcase,
  User,
  LogOut,
  FileText,
} from "lucide-react";

import { cn } from "@/utils/cn";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePricing } from "@/contexts/PricingContext";

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
        label: "Interview with AI",
        icon: <Zap size={18} />,
        description: "Practice interviews with AI",
        path: "/interview_round",
      },
           {
        label: "Cover Letter AI",
        icon: <FileText size={18} />,
        description: "Generate AI-powered cover letters",
        path: "/cover-letter",
      },
      // {
      //   label: "Preparation Hub",
      //   icon: <BookOpen size={18} />,
      //   description: "Resources & study materials",
      //   path: "/subjects",
      // },
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

      {
        label: "Profile",
        icon: <User size={18} />,
        description: "Manage your account",
        path: "/profile",
      },
    ],
  },
];

export default function Sidebar() {
  const [_, setActiveItem] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { setShowPricing } = usePricing();
  const navigate = useNavigate();
  const location = useLocation();

  const planName = (user?.subscriptionPlan && typeof user.subscriptionPlan === 'object')
    ? (user.subscriptionPlan as any).name
    : user?.subscriptionPlan;
  const normalizedPlanName = String(planName || '').toLowerCase();
  const role = String(user?.role || '').toLowerCase();
  const subscriptionStatus = String(user?.subscriptionStatus || '').toLowerCase();
  const isStudent = role === 'student' || role.includes('student');
  const isPayg = (user?.subscriptionPlan as any)?.type === 'pay_as_you_go' || normalizedPlanName.includes('payg_');
  const isPaidNamedPlan = ['pro_tier', 'career', 'professional', 'enterprise'].some((token) => normalizedPlanName.includes(token));
  const isClearlyFreeStatus = !subscriptionStatus || ['free', 'trial', 'inactive', 'expired'].includes(subscriptionStatus);
  const isClearlyPaidStatus = subscriptionStatus === 'active';
  // Show Upgrade for free/unknown non-student users, even if plan metadata is inconsistent.
  const shouldShowUpgrade = !isStudent && !isPayg && (isClearlyFreeStatus || !isClearlyPaidStatus || !isPaidNamedPlan);

  const handleItemClick = (path: string) => {
    setActiveItem(path);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 px-4 h-16 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-14">
            <img src="/logo.png" alt="ai for job" className="h-full w-auto object-contain dark:invert" />
          </div>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
          "lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto bg-white dark:bg-slate-950 border-r border-transparent dark:border-slate-800",
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

          {!isStudent && (
            <div className="mt-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 px-1 mb-2">
                Subscription
              </p>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowPricing(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-200 group"
              >
                <div className="flex-shrink-0 p-1.5 rounded-md text-blue-500 dark:text-blue-400">
                  <Target size={18} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {shouldShowUpgrade ? "Upgrade Plan" : "View Plans"}
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {shouldShowUpgrade ? "Unlock higher limits" : "Compare plans & billing"}
                  </p>
                </div>
                {shouldShowUpgrade && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Pro
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white dark:hover:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700 border border-transparent transition-all duration-200"
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

          {/* Logout Button */}
          <div className="mt-2 border-t border-gray-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-transparent transition-all duration-200"
            >
              <div className="flex-shrink-0 p-1.5 rounded-md text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                <LogOut size={18} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                  Logout
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sign out of your account
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <aside
          className="fixed top-0 left-0 w-64 h-screen border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto no-scrollbar"
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-10 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="h-25 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
                <img src="/logo.png" alt="ai for job" className="h-full w-auto object-contain dark:invert" />
              </div>
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

            {!isStudent && (
              <div className="mt-3 mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 px-1 mb-2">
                  Subscription
                </p>
                <button
                  onClick={() => setShowPricing(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 p-1.5 rounded-md text-blue-500 dark:text-blue-400">
                    <Target size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {shouldShowUpgrade ? "Upgrade Plan" : "View Plans"}
                    </span>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {shouldShowUpgrade ? "Unlock higher limits" : "Compare plans & billing"}
                    </p>
                  </div>
                  {shouldShowUpgrade && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Pro
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 p-1 rounded-lg text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                    {theme === 'dark' ? 'Light Appearance' : 'Night Mode'}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Toggle system theme
                  </p>
                </div>
              </button>
            </div>

            {/* Logout Button */}
            <div className="mt-2 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 p-1 rounded-lg text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-transform duration-300">
                  <LogOut size={20} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition-colors duration-300">
                    Logout
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Exit current session
                  </p>
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
