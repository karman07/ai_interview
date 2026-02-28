import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils"; // optional utility to merge classes

type Variant = "primary" | "secondary" | "ghost" | "outline" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, variant = "primary", className = "", ...props }, ref) => {
    const base =
      "px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 inline-flex items-center justify-center relative overflow-hidden group transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-opacity-20";

    const variants: Record<Variant, string> = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 hover:shadow-blue-500/40 focus:ring-blue-500",
      secondary:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-gray-200 dark:shadow-gray-900 hover:shadow-gray-300 dark:hover:shadow-gray-800 focus:ring-gray-500",
      success:
        "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30",
      ghost:
        "bg-transparent text-blue-600 dark:text-blue-400 border-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 shadow-none focus:ring-blue-500",
      outline:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-gray-200 dark:shadow-gray-900 hover:shadow-blue-200 dark:hover:shadow-blue-900 focus:ring-blue-500",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        onClick={onClick}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm bg-gradient-to-r from-blue-500/20 to-blue-400/20 -z-10"></div>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
