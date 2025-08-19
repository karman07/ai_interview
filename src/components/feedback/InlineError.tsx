export default function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
