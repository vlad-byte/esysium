'use client'

import React, { useState } from "react";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { normalizeQuestions } from "../utils/questions";
import { useGetTopicByIdQuery } from "@/lib/services/topicsApi";
import { useGetTopicProgressQuery } from "@/lib/services/userAnswersApi";
import { useAuth } from "@/lib/components/AuthClientProvider";
import { FrontendQuestion, FrotnendTopicSummary } from "@/lib/services";
import Link from "next/link";

interface TopicCardProps {
  topic: {
    id: number;
    name: string;
    difficulty: string;
    questionsCount: number;
    questions: FrontendQuestion[];
  };
  categoryId: number;
  topicProgress: FrotnendTopicSummary | null
}

// Функция для вычисления прогресса из API данных
function calculateProgressFromApiData(topicData: FrotnendTopicSummary | null) {
  let colorClass = "bg-gray-200";

  if (!topicData || !topicData.progressPercentage) {
    return {percent: 0, colorClass}
  }
  const percent = topicData.progressPercentage
  
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
  
  return { percent, colorClass };
}

const TopicCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-2 animate-pulse">
    <div className="flex items-center justify-between mb-1">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="h-5 w-16 bg-gray-200 rounded" />
    </div>
    <div className="flex items-center gap-4 text-xs">
      <div className="h-4 w-20 bg-gray-100 rounded" />
      <div className="h-4 w-28 bg-gray-100 rounded" />
    </div>
    <div className="h-3 w-full bg-gray-100 rounded mt-1" />
    <ul className="mt-3 flex flex-col gap-2">
      <li className="h-6 w-full bg-gray-100 rounded" />
      <li className="h-6 w-5/6 bg-gray-100 rounded" />
      <li className="h-6 w-2/3 bg-gray-100 rounded" />
    </ul>
    <div className="mt-2 h-5 w-32 bg-gray-100 rounded" />
  </div>
);

const TopicCard: React.FC<TopicCardProps> = ({ topic, categoryId, topicProgress }) => {
  const [expanded, setExpanded] = useState(false);
  const { userId, isAuthenticated } = useAuth();
  const progressUserId =
    isAuthenticated && userId ? Number(userId) : undefined;

  const { data: topicData, isLoading, error } = useGetTopicByIdQuery(topic.id);
  const { data: topicProgressDetail } = useGetTopicProgressQuery({
    topicId: topic.id,
    userId: progressUserId,
  });

  // Реально отвеченные вопросы — из API progress_details
  const answeredQuestionIds = new Set<number>(
    (topicProgressDetail?.progress_details || [])
      .filter((d) => d.has_answer)
      .map((d) => d.question_id)
  );

  const getDifficulty = (difficulty: string) => {
    if (difficulty === 'Сложно') return { label: "Сложная", color: "bg-red-500 text-white" };
    if (difficulty === 'Средне') return { label: "Средняя", color: "bg-yellow-400 text-gray-900" };
    return { label: "Лёгкая", color: "bg-green-500 text-white" };
  };

  const handleShowAll = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  if (isLoading) {
    return <TopicCardSkeleton />;
  }

  if (error || !topicData) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center gap-2 text-center">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="mb-2 text-pink-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="currentColor"/></svg>
        <span className="text-lg font-semibold text-pink-500">Не удалось загрузить данные по теме</span>
        <span className="text-sm text-gray-400">Проверьте соединение или попробуйте позже</span>
      </div>
    );
  }

  const questions = normalizeQuestions(topicData.questions);
  const { label: difficultyLabel, color: badgeColor } = getDifficulty(topicData.difficulty);
  const questionsToShow = expanded ? questions : questions.slice(0, 3);
  const hiddenCount = questions.length - 3;
  const rawPercent = topicProgressDetail?.progress_percentage ?? topicProgress?.progressPercentage ?? 0;
  const progressForBar: FrotnendTopicSummary | null = topicProgressDetail
    ? {
        topicId: topicProgressDetail.topic_id,
        topicName: topicProgressDetail.topic_name,
        topicDifficulty: topicProgressDetail.topic_difficulty ?? '',
        topicWeight: 0,
        progressPercentage: rawPercent,
        weightedProgress: rawPercent,
        answeredQuestions: topicProgressDetail.answered_questions,
        totalQuestions: topicProgressDetail.total_questions,
        correctAnswers: topicProgressDetail.correct_answers,
      }
    : topicProgress;
  const {percent, colorClass} = calculateProgressFromApiData(progressForBar)

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col gap-2 ${percent === 100 ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {topicData.name}
          {percent === 100 && (
            <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">Тема пройдена</span>
          )}
        </span>
        <span className={`text-xs font-semibold rounded px-2 py-0.5 ${badgeColor}`}>{difficultyLabel}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Вопросов: {topicData.questionsCount}</span>
        <span>
          Прогресс: {topicProgressDetail?.answered_questions ?? topicProgress?.answeredQuestions ?? 0} /{' '}
          {topicProgressDetail?.total_questions ?? topicProgress?.totalQuestions ?? 0} ({percent}%)
        </span>
      </div>
      <ProgressBar percent={percent} colorClass={colorClass} className="mt-1" />
      {/* Список вопросов */}
      <ul className="mt-3 flex flex-col gap-2">
        {questionsToShow.map((q, idx) => {
          const isAnswered = answeredQuestionIds.has(q.id);
          return (
            <QuestionCard
              key={q.id}
              text={q.text}
              stage={q.stage}
              isAnswered={isAnswered}
              questionId={q.id}
              categoryId={categoryId}
            />
          );
        })}
      </ul>
      {/* Кнопка показать ещё / свернуть */}
      {questions.length > 3 && (
        !expanded ? (
          <button
            onClick={handleShowAll}
            className="mt-2 self-start text-xs text-gray-400 hover:text-pink-500 font-medium no-underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded"
            style={{ textDecoration: 'none' }}
          >
            Показать вопросы (ещё {hiddenCount})
          </button>
        ) : (
          <button
            onClick={handleCollapse}
            className="mt-2 self-start text-xs text-gray-400 hover:text-pink-500 font-medium no-underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded"
            style={{ textDecoration: 'none' }}
          >
            Свернуть
          </button>
        )
      )}
    </div>
  );
};

export default TopicCard;
export { TopicCardSkeleton }; 