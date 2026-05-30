import { useGetCategoriesListQuery, useGetFullCategoryDataQuery } from '../../../services/categoriesApi';
import type { CategoryBase } from '../types/categories';
import { useAuth } from '@/lib/components/AuthClientProvider';

// Импортируем иконки из существующих данных
import {
  ChartBarIcon,
  CubeTransparentIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PresentationChartLineIcon,
  Squares2X2Icon,
  Bars3BottomLeftIcon,
  ServerStackIcon,
  CodeBracketSquareIcon
} from "@heroicons/react/24/outline";

// Маппинг иконок по ID категории
const categoryIcons: Record<number, any> = {
  1: ChartBarIcon,
  2: CubeTransparentIcon,
  3: ChatBubbleLeftRightIcon,
  4: EyeIcon,
  5: PresentationChartLineIcon,
  6: Squares2X2Icon,
  7: Bars3BottomLeftIcon,
  8: ServerStackIcon,
  9: CodeBracketSquareIcon,
};

export const useCategories = () => {
  // Получаем список всех категорий
  const { data: categoriesList, isLoading: isLoadingList, error: listError } = useGetCategoriesListQuery();

  // Преобразуем список категорий в формат, ожидаемый компонентами
  const categories: CategoryBase[] = categoriesList?.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: categoryIcons[cat.id] || ChartBarIcon, // fallback иконка
  })) || [];

  return {
    categories,
    isLoading: isLoadingList,
    error: listError,
  };
};

export const useCategoryData = (categoryId: number) => {
  const { userId, isAuthenticated } = useAuth();
  const progressUserId =
    isAuthenticated && userId ? Number(userId) : undefined;
  const { data: categoryData, isLoading, error } = useGetFullCategoryDataQuery({
    categoryId,
    userId: progressUserId,
  });

  return {
    categoryData,
    isLoading,
    error,
  };
}; 