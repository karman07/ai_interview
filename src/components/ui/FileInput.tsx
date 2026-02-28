import { ChangeEvent } from "react";

export default function FileInput({
  label,
  onChange,
  accept,
  className = "",
}: {
  label: string;
  accept?: string;
  onChange: (file: File) => void;
  className?: string;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };

  return (
    <div className={`block ${className}`}>
      <span className="mb-2 block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</span>
      <input
        type="file"
        onChange={handle}
        accept={accept}
        className="block w-full text-sm font-medium text-gray-500 file:mr-6 file:rounded-xl file:border-0 file:bg-gray-100 dark:file:bg-gray-800 file:px-6 file:py-3.5 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-700 transition-all cursor-pointer"
      />
    </div>
  );
}