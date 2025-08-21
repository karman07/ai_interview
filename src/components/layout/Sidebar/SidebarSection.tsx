import { ReactNode } from "react";

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mt-4">
      {title && (
        <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2 ml-2">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
