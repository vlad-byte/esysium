'use client'

import { useCategories } from "./hooks/useCategories";
import TopicsGrid from "./components/TopicsGrid";
import { CategoryCard } from "./components/CategoryCard";

export default function CategoriesPage() {
  const { categories, isLoading, error } = useCategories();

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="w-full h-full py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-10 sm:mb-16 lg:mb-32 drop-shadow-glow">
          Каталог категорий
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="group bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg border border-gray-200 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 text-center">
        <svg width="56" height="56" fill="none" viewBox="0 0 24 24" className="mb-4 text-pink-400"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="currentColor"/></svg>
        <span className="text-2xl font-bold text-pink-500 mb-2">Не удалось загрузить категории</span>
        <span className="text-base text-gray-400">Проверьте соединение или попробуйте позже</span>
      </div>
    );
  }

  // Преобразуем данные в формат, ожидаемый TopicsGrid
  // Пока используем пустые темы, так как полные данные будут загружены при переходе в категорию
  const categoriesWithEmptyTopics = categories.map(cat => ({
    ...cat,
    topics: [],
    userProgress: {},
  }));

  return <TopicsGrid categories={categoriesWithEmptyTopics} />;
} 