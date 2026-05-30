'use client'

import React from "react";
import { useParams } from "next/navigation";
import { useNavigation } from "./hooks/useNavigation";
import BackButton from "./components/BackButton";
import { useGetCategoryByIdQuery, useGetCategoryProgressQuery } from "@/lib/services";
import TopicCard, { TopicCardSkeleton } from "./components/TopicCard";
import CategoryStatistic from "./components/CategoryStatistic";
import { useAuth } from "@/lib/components/AuthClientProvider";

// Скелетон для заголовка
const TitleSkeleton = () => (
  <div className="h-10 w-2/3 max-w-xl mx-auto mb-10 rounded bg-gray-200 animate-pulse" />
);

const DetailCategoryPage: React.FC = () => {
  const params = useParams();
  const categoryId = Number(params.id);
  const { userId, isAuthenticated } = useAuth();
  const progressUserId =
    isAuthenticated && userId ? Number(userId) : undefined;

  const { data: categoryData, isLoading, error } = useGetCategoryByIdQuery(categoryId);

  const { data: categoryProgress, isLoading: isProgressLoading, error: progressError } = useGetCategoryProgressQuery({
    categoryId,
    userId: progressUserId,
  });

  const { goToCatalog } = useNavigation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full h-full py-12 relative">
        <BackButton onClick={goToCatalog} />
        <TitleSkeleton />
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {[...Array(3)].map((_, i) => (
            <TopicCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full py-12 text-center relative">
        <BackButton onClick={goToCatalog} />
        <svg width="56" height="56" fill="none" viewBox="0 0 24 24" className="mb-4 text-pink-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="currentColor"/></svg>
        <span className="text-2xl font-bold text-pink-500 mb-2">Не удалось загрузить данные по категории</span>
        <span className="text-base text-gray-400">Проверьте соединение или попробуйте позже</span>
      </div>
    );
  }

  if (!categoryData) {
    return (<p>no data </p>)
  }

  return (
    <div className="flex flex-col items-center w-full h-full py-12 relative">
      <BackButton onClick={goToCatalog} />
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-10 drop-shadow-glow">
        Категория: {categoryData.name}
      </h1>
      <CategoryStatistic data={categoryProgress} isLoading={isProgressLoading} error={progressError} />
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {categoryData.topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center w-full bg-white/80 rounded-xl shadow">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 text-pink-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="currentColor"/></svg>
            <span className="text-lg font-semibold text-pink-500">В этой категории пока нет тем</span>
            <span className="text-sm text-gray-400">Попробуйте выбрать другую категорию</span>
          </div>
        ) : (
          categoryData.topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              topicProgress={categoryProgress?.topicsProgress.filter(tp => tp.topicId === topic.id)[0] || null}
              categoryId={categoryId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DetailCategoryPage; 
