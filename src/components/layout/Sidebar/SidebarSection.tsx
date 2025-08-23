import { ReactNode } from "react";
import colors from "@/constants/colors";

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-8 first:mb-6">
      {title && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded" style={{ backgroundColor: colors.primary }} />
            <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.sectionTitle }}>
              {title}
            </h3>
          </div>
          <div className="h-px ml-3" style={{ backgroundColor: colors.sectionTitle, opacity: 0.2 }} />
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}