import { useState } from "react";
import { Briefcase, FileText, HelpCircle, User, Users, Target, Menu, X } from "lucide-react";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import colors from "@/constants/colors";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";

export default function ResponsiveNavbar() {
  const [activeItem, setActiveItem] = useState('Resume Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleItemClick = (itemLabel: string) => {
    setActiveItem(itemLabel);
    setIsMobileMenuOpen(false);
    navigate(`/${itemLabel.replace(/\s+/g, '-').toLowerCase()}`);
    console.log(`Navigating to: ${itemLabel}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    {
      section: "Core Features",
      items: [
        {
          icon: <User size={18} />,
          label: "Dashboard",
          description: "Tells about you resume"
        },
        {
          icon: <HelpCircle size={18} />,
          label: "AI Quiz",
          description: "Practice with AI interviewer"
        },
        {
          icon: <Users size={18} />,
          label: "Preparation Hub",
          description: "Resources & study materials"
        },
        {
          icon: <FileText size={18} />,
          label: "AI Resume Builder",
          description: "Smart resume optimization"
        }
      ]
    },
    {
      section: "Advanced Tools",
      items: [
        {
          icon: <FileText size={18} />,
          label: "AI Material Generator",
          description: "Custom content creation"
        },
        {
          icon: <Briefcase size={18} />,
          label: "AI Job Hunter",
          badge: "Beta",
          description: "Automated job matching"
        },
        {
          icon: <User size={18} />,
          label: "AI Career Coach",
          description: "Personalized guidance"
        },
        {
          icon: <Users size={18} />,
          label: "Speak with Recruiters",
          description: "Connect with industry experts"
        },
        {
          icon: <FileText size={18} />,
          label: "AI Salary Calculator",
          description: "Market-based estimates"
        },
        {
          icon: <HelpCircle size={18} />,
          label: "Interview Question Bank",
          description: "Curated question database"
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <Target size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              AI Coach
            </h2>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{ backgroundColor: colors.background }}
      >
        <div className="border-r border-gray-200 h-full">
          <div className="p-6 pt-20">
            {/* Header Info */}
            <div className="mb-8">
              <p className="text-sm" style={{ color: colors.sectionTitle }}>
                AI-powered interview platform
              </p>
            </div>

            {/* Navigation Sections */}
            {navigationItems.map((section, sectionIndex) => (
              <SidebarSection key={sectionIndex} title={section.section}>
                {section.items.map((item, itemIndex) => (
                  <SidebarItem
                    key={itemIndex}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={activeItem === item.label}
                    description={item.description}
                    onClick={() => handleItemClick(item.label)}
                  />
                ))}
              </SidebarSection>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 min-h-screen border-r border-gray-200" style={{ backgroundColor: colors.background }}>
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

          {/* Navigation Sections */}
          {navigationItems.map((section, sectionIndex) => (
            <SidebarSection key={sectionIndex} title={sectionIndex === 0 ? undefined : section.section}>
              {sectionIndex === 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.sectionTitle }}>
                    {section.section}
                  </span>
                </div>
              )}
              {section.items.map((item, itemIndex) => (
                <SidebarItem
                  key={itemIndex}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  active={activeItem === item.label}
                  description={item.description}
                  onClick={() => handleItemClick(item.label)}
                />
              ))}
            </SidebarSection>
          ))}
        </div>
      </div>
    </>
  );
}