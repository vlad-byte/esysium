'use client'

import React, { useState } from "react";
import { sidebarSections } from "../data/categories";
import { HomeIcon, Squares2X2Icon, SparklesIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { categories } from "../data/categories";
import { useNavigation } from "../hooks/useNavigation";
import { useGetCategoriesListQuery } from "@/lib/services/categoriesApi";
import { useAuth } from "@/lib/components/AuthClientProvider";

const Sidebar: React.FC<{ onClose?: () => void; onAuthClick?: () => void }> = ({ onClose, onAuthClick }) => {
  const [catalogOpen, setCatalogOpen] = useState(true);
  const pathname = usePathname();
  const isCatalog = pathname.includes("/catalog");
  // Получаем id категории из url, если есть
  const match = pathname.match(/\/catalog\/(\d+)/);
  const activeCategoryId = match ? Number(match[1]) : null;
  const { goToCategory, goToCatalog } = useNavigation();
  const { isAuthenticated, username } = useAuth();

  // Загрузка категорий
  const { data: categoriesList, isLoading: isCategoriesLoading } = useGetCategoriesListQuery();

  // Скелетоны для списка категорий
  const CategorySkeleton = () => (
    <li className="py-1">
      <div className="h-4 w-24 bg-gray-700/40 rounded animate-pulse" />
    </li>
  );

  const hasCategories = categoriesList && categoriesList.length > 0;

  return (
    <aside
      className={
        `w-64 h-screen min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-black/80 border-r border-blue-900/40 p-6
        flex flex-col shadow-2xl
        transition-transform duration-300
        ${onClose ? 'fixed left-0 top-0 z-20 animate-slide-in' : 'hidden md:flex md:fixed md:left-0 md:top-0 md:z-10'}
        `
      }
      style={{ maxHeight: '100vh', height: '100vh' }}
    >
      {/* Mobile close button */}
      {onClose && (
        <button
          className="md:hidden absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow border border-gray-200 cursor-pointer"
          onClick={onClose}
          aria-label="Закрыть меню"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <line x1="6" y1="6" x2="18" y2="18" stroke="#37352f" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="#37352f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {/* Скроллируемый контент */}
      <div className="overflow-y-auto flex-1 md:min-h-0">
        <div className="flex items-center gap-2 mb-8">
          <SparklesIcon className="w-8 h-8 text-blue-400 drop-shadow-glow" />
          <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Elysium AI</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-white/90 hover:bg-blue-900/40 transition group">
            <HomeIcon className="w-5 h-5 text-blue-400 group-hover:text-pink-400 transition" />
            <span className="font-medium">Главная</span>
          </button>
          <div>
            <button
              className={`flex items-center justify-between cursor-pointer w-full px-4 py-3 rounded-lg text-white/90 hover:bg-blue-900/40 transition group ${isCatalog ? 'text-pink-400 font-bold bg-blue-900/30' : ''}`}
              onClick={goToCatalog}
            >
              <span className="flex items-center gap-3">
                <Squares2X2Icon className="w-5 h-5 text-purple-400 group-hover:text-pink-400 transition" />
                <span className="font-medium">Каталог</span>
              </span>
              <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${catalogOpen ? "rotate-180" : "rotate-0"}`} />
            </button>
            {/* Выпадающий список категорий */}
            <div className={`pl-10 mt-2 transition-all duration-200 origin-top ${catalogOpen && hasCategories ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none h-0"}`} style={{ willChange: 'opacity, transform' }}>
              {catalogOpen && hasCategories && (
                <ul className="space-y-2">
                  {isCategoriesLoading
                    ? [...Array(4)].map((_, i) => <CategorySkeleton key={i} />)
                    : categoriesList.map((cat) => (
                        <li
                          key={cat.id}
                          className={`text-sm py-2 cursor-pointer transition-colors text-white/70 hover:text-blue-400 ${activeCategoryId === cat.id ? 'text-pink-400 font-bold' : ''}`}
                          onClick={() => goToCategory(cat.id)}
                        >
                          {cat.name}
                        </li>
                      ))}
                </ul>
              )}
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg text-white/90 hover:bg-blue-900/40 transition group">
            <SparklesIcon className="w-5 h-5 text-pink-400 group-hover:text-blue-400 transition" />
            <span className="font-medium">AI-интервью</span>
          </button>
        </nav>
      </div>
      
      {/* Фиксированная кнопка внизу */}
      <div className="pt-8 pb-6 md:mt-auto">
        {!isAuthenticated ? (
          <button
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r cursor-pointer from-blue-600 to-violet-600 text-white font-semibold shadow hover:from-blue-700 hover:to-violet-700 transition"
            onClick={onAuthClick}
          >
            Войти / Зарегистрироваться
          </button>
        ) : (
          <div className="text-white/80 text-center text-base font-semibold py-3">{username || 'Пользователь'}</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 