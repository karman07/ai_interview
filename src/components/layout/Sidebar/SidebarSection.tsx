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
            <div className="w-1 h-4 rounded bg-indigo-600 dark:bg-indigo-400" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
              {title}
            </h3>
          </div>
          <div className="h-px ml-3 bg-gray-300 dark:bg-gray-600 opacity-50" />
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}