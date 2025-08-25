export const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const percent = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
      <div
        className="bg-blue-600 h-3 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
