import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${error ? 'border-red-400' : 'border-gray-200'} ${className ?? ''}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
});

export default Input;
