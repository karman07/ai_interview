import { ChangeEvent } from "react";

export default function FileInput({
  label,
  onChange,
  accept,
}: {
  label: string;
  accept?: string;
  onChange: (file: File) => void;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };
  
  return (
    <div className="">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type="file"
        onChange={handle}
        accept={accept}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
      />
    </div>
  );
}