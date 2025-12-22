import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'} ${className ?? ''}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500 dark:text-red-400">{error}</span>}
    </label>
  );
});

export default Input;
