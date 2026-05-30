import { api } from './api';
import type { ApiQuestion, FrontendQuestion } from './types';

export const questionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка всех вопросов
    getQuestions: builder.query<ApiQuestion[], void>({
      query: () => '/questions/',
      providesTags: ['Questions'],
    }),

    // Получение вопроса по ID
    getQuestionById: builder.query<FrontendQuestion, number>({
      query: (id) => `/questions/${id}`,
      transformResponse: (questionData: ApiQuestion): FrontendQuestion => {
        const frontendQuestion = {
          id: questionData.id,
          text: questionData.name,
          stage: questionData.stage,
          sampleAnswer: questionData.sample_answer?.description || '',
          resourse: questionData.resourse ?? null,
          topicName: questionData.topic_name,
        }
        return frontendQuestion
      },
      providesTags: (result, error, id) => [{ type: 'Questions', id }],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
} = questionsApi; 