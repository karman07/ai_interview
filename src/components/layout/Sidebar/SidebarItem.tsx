import { ReactNode } from "react";
import { cn } from "@/utils/cn";


interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  description?: string;
  onClick?: () => void;
}

export default function SidebarItem({
  icon,
  label,
  badge,
  active,
  description,
  onClick
}: SidebarItemProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-300",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
      )}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={cn(
              "flex-shrink-0 p-1 rounded-lg transition-transform duration-300 group-hover:scale-110",
              active ? "text-white" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[13px] font-bold tracking-tight transition-colors duration-300",
                  active ? "text-white" : "text-slate-700 dark:text-slate-200"
                )}
              >
                {label}
              </span>

              {badge && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white uppercase tracking-tighter">
                  {badge}
                </span>
              )}
            </div>
            {description && !active && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium mt-0.5 group-hover:text-slate-500 transition-colors">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
