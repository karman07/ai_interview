type Props = {
  item: { question: string; answer: string; isCorrect: boolean; explanation: string; score: number };
};

export const ResultCard = ({ item }: Props) => (
  <div className="p-4 border rounded-xl bg-white shadow mb-4">
    <h3 className="font-semibold">{item.question}</h3>
    <p className="mt-2 text-gray-700"><strong>Your Answer:</strong> {item.answer}</p>
    <p className="mt-2"><strong>Correct?</strong> {item.isCorrect ? "✅ Yes" : "❌ No"}</p>
    <p className="mt-2 text-sm text-gray-600">{item.explanation}</p>
    <p className="mt-2"><strong>Score:</strong> {item.score}/10</p>
  </div>
);
