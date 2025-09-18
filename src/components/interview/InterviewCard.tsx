import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type Props = { type: string; description: string };

export default function InterviewCard({ type, description }: Props) {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
      <h2 className="text-2xl font-bold text-gray-800">{type}</h2>
      <p className="text-gray-600 mt-3">{description}</p>
      <button
        onClick={() => navigate(`/interview/start/${type.toLowerCase()}`)}
        className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Start <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
