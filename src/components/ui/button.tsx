import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export default function Button({ children, onClick, variant = "primary", className = "" }: ButtonProps) {
  const base = "px-6 py-2 rounded-2xl font-medium shadow-md transition-all duration-300 inline-flex items-center justify-center";
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-amber-500 text-white hover:bg-amber-600",
    ghost: "bg-transparent text-indigo-600 border border-indigo-200 hover:bg-indigo-50",
  };

  return (
    <button className={`${base} ${variants[variant] ?? variants.primary} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
