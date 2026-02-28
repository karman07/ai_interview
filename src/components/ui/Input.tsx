import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, icon, className, ...props }, ref) => {
  return (
    <div className={`block w-full ${className ?? ''}`}>
      {label && <span className="mb-2 block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</span>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-2xl border bg-white dark:bg-gray-800 px-6 py-4 ${icon ? 'pl-14' : ''} text-gray-900 dark:text-white shadow-sm outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 ${error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
          {...props}
        />
      </div>
      {error && <span className="mt-2 ml-1 block text-xs font-bold text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
});

export default Input;
