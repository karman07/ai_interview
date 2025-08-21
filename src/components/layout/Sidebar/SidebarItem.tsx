import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}

export default function SidebarItem({ icon, label, badge, active }: SidebarItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors",
        active ? "bg-primary text-white" : "text-text hover:bg-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="ml-2 text-xs font-semibold bg-secondary text-white px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
  );
}
