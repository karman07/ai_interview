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
        "group relative rounded-lg px-3 py-3 cursor-pointer transition-all duration-200",
        "border border-transparent",
        active
          ? "border-gray-300 dark:border-gray-600 shadow-sm bg-primary/10 dark:bg-primary/20"
          : "hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600"
      )}
      onClick={onClick}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-primary" />
      )}

      <div className="relative flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon container */}
          <div
            className={`flex-shrink-0 p-1.5 rounded-md ${active ? 'text-primary dark:text-primary' : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-sm font-medium truncate ${active ? 'text-primary dark:text-primary' : 'text-gray-900 dark:text-white'
                  }`}
              >
                {label}
              </span>

              {/* Badge */}
              {badge && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white bg-secondary"
                >
                  {badge}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p
                className={`text-xs leading-relaxed ${active ? 'text-primary dark:text-primary' : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}