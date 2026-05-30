'use client'

import React from 'react';
import { useGetCategoryByIdQuery, useGetCategoryProgressQuery } from '../../../services/categoriesApi';
import { useAuth } from '@/lib/components/AuthClientProvider';
import ProgressBar from './ProgressBar';
import { useNavigation } from '../hooks/useNavigation';
import type { CategoryBase } from '../types/categories';
import { FrontendProgress } from '@/lib/services';

interface CategoryCardProps {
  category: CategoryBase;
}

// Функция для вычисления прогресса из API данных
function calculateProgressFromApiData(categoryData: FrontendProgress | undefined) {
  let colorClass = "bg-gray-200";

  if (!categoryData || !categoryData.progressPercentage) {
    return {percent: 0, colorClass}
  }
  const percent = categoryData.progressPercentage
  
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

export const CategoryCardSkeleton: React.FC = () => (
  <div className="group bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg border border-gray-200 animate-pulse">
    <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-full"></div>
  </div>
);

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { goToCategory } = useNavigation();
  const { userId, isAuthenticated } = useAuth();
  const progressUserId =
    isAuthenticated && userId ? Number(userId) : undefined;
  
  // Загружаем полные данные категории и прогресс
  const { data: categoryData, isLoading, error } = useGetCategoryByIdQuery(category.id);
  const { data: categoryProgress, isLoading: isProgressLoading, error: progressError } = useGetCategoryProgressQuery({
    categoryId: category.id,
    userId: progressUserId,
  });

  // Если данные категории загружаются, показываем скелетон всей карточки
  if (isLoading) {
    return <CategoryCardSkeleton />;
  }

  // Если произошла ошибка, показываем базовую карточку
  if (error || !categoryData) {
    return (
      <div
        className="group bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg border border-gray-200 hover:border-blue-400 hover:shadow-blue-200 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
        onClick={() => goToCategory(category.id)}
      >
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-10">
          <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Тем: 0</span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Вопросов: 0</span>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 mb-4">
          <category.icon className="w-10 h-10 text-blue-400 group-hover:text-pink-400 transition-colors duration-300 drop-shadow-glow" />
        </div>
        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors duration-300 text-center mb-1">
          {category.name}
        </span>
        <span className="text-xs text-gray-500 mb-2">Прогресс: 0%</span>
        <div className="flex flex-col items-center gap-1 w-full">
          <ProgressBar percent={0} colorClass="bg-gray-200" className="mt-1" />
        </div>
      </div>
    );
  }

  // Вычисляем прогресс на основе загруженных данных
  const { percent, colorClass } = calculateProgressFromApiData(categoryProgress);
  const totalTopics = categoryData.topicsCount;
  const totalQuestions = categoryData.questionsCount;

  return (
    <div
      className="group bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg border border-gray-200 hover:border-blue-400 hover:shadow-blue-200 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() => goToCategory(category.id)}
    >
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-10">
        <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Тем: {totalTopics}</span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">Вопросов: {totalQuestions}</span>
      </div>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 mb-4">
        <category.icon className="w-10 h-10 text-blue-400 group-hover:text-pink-400 transition-colors duration-300 drop-shadow-glow" />
      </div>
      <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-500 transition-colors duration-300 text-center mb-1">
        {category.name}
      </span>
      {isProgressLoading ? (
        <>
          <span className="text-xs text-gray-400 mb-2 h-4 w-16 bg-gray-100 rounded animate-pulse block"></span>
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="h-2 w-full bg-gray-100 rounded animate-pulse mt-1" />
          </div>
        </>
      ) : progressError ? (
        <>
          <span className="text-xs text-gray-500 mb-2">Прогресс: 0%</span>
          <div className="flex flex-col items-center gap-1 w-full">
            <ProgressBar percent={0} colorClass="bg-gray-200" className="mt-1" />
          </div>
        </>
      ) : (
        <>
          <span className="text-xs text-gray-500 mb-2">Прогресс: {percent}%</span>
          <div className="flex flex-col items-center gap-1 w-full">
            <ProgressBar percent={percent} colorClass={colorClass} className="mt-1" />
          </div>
        </>
      )}
    </div>
  );
}; 