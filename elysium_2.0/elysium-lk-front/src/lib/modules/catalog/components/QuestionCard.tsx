import React from "react";
import { useNavigation } from "../hooks/useNavigation";
import { stageColors } from "../utils/colors";
import Link from "next/link";

interface QuestionCardProps {
  text: string;
  stage: string;
  isAnswered: boolean;
  questionId: number;
  categoryId: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ text, stage, isAnswered, questionId, categoryId }) => {
  const { goToQuestion } = useNavigation();
  return (
    <li className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 rounded transition ${
      isAnswered 
        ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
        : 'hover:bg-gray-50'
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize ${stageColors[stage] || stageColors.default}`}
          >
            {stage}
          </span>
          <Link 
            href={`/catalog/${categoryId}/question/${questionId}`}
            className={`text-sm font-medium transition-all duration-200 cursor-pointer transform hover:scale-105 ${
              isAnswered 
                ? 'text-green-700 hover:text-green-800 hover:underline' 
                : 'text-blue-600 hover:text-blue-800 hover:underline'
            }`}
          >
            {text}
          </Link>
        </div>
        {isAnswered && (
          <div className="text-xs mt-1 text-green-600 font-medium">
            ✓ Ответ дан
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-xs rounded transition cursor-pointer hover:scale-105 hover:shadow ${
            isAnswered
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 animate-pulse hover:animate-none'
          }`}
          onClick={() => goToQuestion(categoryId, questionId)}
        >
          {isAnswered ? 'просмотреть' : 'записать ответ'}
        </button>
      </div>
    </li>
  );
};

export default QuestionCard; 