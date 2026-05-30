import type { Category } from "../types/categories";

export interface Question { id: number; text: string; }
export interface Topic { id: number; name: string; questions: Question[]; }

export function getProgressInfo(category: Category) {
  const totalQuestions = category.topics.reduce((sum: number, t) => sum + t.questions.length, 0);
  const answered = Object.entries(category.userProgress).reduce(
    (sum: number, [_, count]) => sum + Number(count),
    0
  );
  const percent = totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);
  let colorClass = "bg-gray-200";
  switch (true) {
    case percent === 100:
      colorClass = "bg-green-400";
      break;
    case percent > 70:
      colorClass = "bg-blue-400";
      break;
    case percent > 0:
      colorClass = "bg-yellow-400";
      break;
    default:
      colorClass = "bg-gray-200";
  }
  return { percent, colorClass, answered, totalQuestions };
} 