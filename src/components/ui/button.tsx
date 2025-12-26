import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils"; // optional utility to merge classes

type Variant = "primary" | "secondary" | "ghost" | "outline";

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
        "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/40 focus:ring-indigo-500 before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10",
      secondary:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-gray-200 dark:shadow-gray-900 hover:shadow-gray-300 dark:hover:shadow-gray-800 focus:ring-gray-500",
      ghost:
        "bg-transparent text-indigo-600 dark:text-indigo-400 border-0 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 hover:text-indigo-700 dark:hover:text-indigo-300 shadow-none hover:shadow-lg focus:ring-indigo-500",
      outline:
        "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950 dark:hover:to-purple-950 shadow-gray-200 dark:shadow-gray-900 hover:shadow-indigo-200 dark:hover:shadow-indigo-900 focus:ring-indigo-500 before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-5",
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
        <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10"></div>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
