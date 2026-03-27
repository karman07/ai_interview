import { ReactNode } from "react";

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
            <div className="w-[3px] h-3 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-500">
              {title}
            </h3>
          </div>
          <div className="h-px ml-3 bg-slate-200 dark:bg-slate-800/50" />
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}