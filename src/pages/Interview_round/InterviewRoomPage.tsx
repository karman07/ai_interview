import { useParams } from "react-router-dom";
import InterviewRoom from "@/components/interview/InterviewRoom";

export default function InterviewRoomPage() {
  const { type } = useParams();
  if (!type) return <div>No round selected</div>;
  return <InterviewRoom round={type} />;
}
