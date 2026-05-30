import { api } from './api';
import type { 
  ApiCategory, 
  ApiCategoryWithTopics, 
  ApiCategoryProgress,
  FrontendCategory, 
  FrontendProgress,
  ApiTopicProgressSummary,
  FrotnendTopicSummary
} from './types';

const transformTopicProgress = (
  topicsSummaty: ApiTopicProgressSummary[]
): FrotnendTopicSummary[] => {
  const topicsFrontendSummary = topicsSummaty.map(progress => ({
    topicId: progress.topic_id,
    topicName: progress.topic_name,
    topicDifficulty: progress.topic_difficulty,
    topicWeight: progress.topic_weight,
    progressPercentage: progress.progress_percentage,
    weightedProgress: progress.weighted_progress,
    totalQuestions: progress.total_questions,
    answeredQuestions: progress.answered_questions,
    correctAnswers: progress.correct_answers,
  }))
  return topicsFrontendSummary
}

// Функция для преобразования API данных в формат фронтенда
const transformCategoryData = (
  categoryWithTopics: ApiCategoryWithTopics,
  categoryProgress?: ApiCategoryProgress
): FrontendCategory => {
  // Создаем userProgress из данных прогресса
  const userProgress: Record<number, number> = {};
  
  if (categoryProgress) {
    categoryProgress.topics_progress.forEach(topic => {
      userProgress[topic.topic_id] = Math.round(topic.progress_percentage);
    });
  }

  // Преобразуем темы (пока без вопросов, так как их нужно получать отдельно)
  const topics = categoryWithTopics.topics.map(topic => ({
    id: topic.id,
    name: topic.name,
    difficulty: topic.difficulty,
    questionsCount: topic.questions_count,
    questions: [], // Вопросы будут загружены отдельно
  }));

  return {
    id: categoryWithTopics.id,
    name: categoryWithTopics.name,
    topics,
    questionsCount: categoryWithTopics.total_questions,
    topicsCount: categoryWithTopics.total_topics,
    userProgress,
  };
};

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка всех категорий (только id и name)
    getCategoriesList: builder.query<ApiCategory[], void>({
      query: () => '/categories/',
      providesTags: ['Categories'],
    }),

    // Получение категории с темами по ID
    getCategoryById: builder.query<FrontendCategory, number>({
      query: (id) => `/categories/${id}`,
      transformResponse: (categoriesData: ApiCategoryWithTopics): FrontendCategory => {
        const transformedCategories = transformCategoryData(
          categoriesData as ApiCategoryWithTopics
        );
        return transformedCategories
      },
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Получение прогресса по категории
    getCategoryProgress: builder.query<
      FrontendProgress,
      { categoryId: number; userId?: number }
    >({
      query: ({ categoryId, userId }) => ({
        url: `/user-answers/category/${categoryId}/progress`,
        params: userId != null ? { user_id: userId } : undefined,
      }),
      transformResponse: (categoryProgress: ApiCategoryProgress): FrontendProgress => {
        const topicsProgress = transformTopicProgress(categoryProgress.topics_progress)
        const transformedProgress = {
          categoryId: categoryProgress.category_id,
          categoryName: categoryProgress.category_name,
          totalTopics: categoryProgress.total_topics,
          totalWeightedProgress: categoryProgress.total_weighted_progress,
          totalWeight: categoryProgress.total_weight,
          progressPercentage: categoryProgress.progress_percentage,
          topicsProgress,
        }
        return transformedProgress
      },
      providesTags: (result, error, arg) => [{ type: 'CategoryProgress', id: arg.categoryId }],
    }),

    // Комбинированный запрос для получения полных данных категории
    getFullCategoryData: builder.query<FrontendCategory, { categoryId: number; userId?: number }>({
      async queryFn({ categoryId, userId }, api, extraOptions, baseQuery) {
        // Получаем данные категории с темами
        const categoryResult = await baseQuery(`/categories/${categoryId}`);
        if (categoryResult.error) {
          return { error: categoryResult.error };
        }

        // Получаем прогресс по категории
        const progressUrl =
          userId != null
            ? `/user-answers/category/${categoryId}/progress?user_id=${userId}`
            : `/user-answers/category/${categoryId}/progress`;
        const progressResult = await baseQuery(progressUrl);
        const categoryProgress = progressResult.error ? undefined : progressResult.data as ApiCategoryProgress;

        // Преобразуем данные в формат фронтенда
        const transformedData = transformCategoryData(
          categoryResult.data as ApiCategoryWithTopics,
          categoryProgress
        );

        return { data: transformedData };
      },
      providesTags: (result, error, arg) => [
        { type: 'Category', id: arg.categoryId },
        { type: 'CategoryProgress', id: arg.categoryId },
      ],
    }),
  }),
});

export const {
  useGetCategoriesListQuery,
  useGetCategoryByIdQuery,
  useGetCategoryProgressQuery,
  useGetFullCategoryDataQuery,
} = categoriesApi; 