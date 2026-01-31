import { useParams } from "react-router-dom";
import InterviewRoomV2 from "@/components/interview/InterviewRoomV2";

export default function InterviewRoomPage() {
  const { type } = useParams();
  if (!type) return <div>No round selected</div>;
  return <InterviewRoomV2 round={type} />;
}
