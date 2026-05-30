import { api } from './api';
import { ApiTopicWithQuestionsList, FrontendQuestion, FrontendTopic } from './types';

export const topicsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получение списка всех вопросов
    // getTopicProgress: builder.query<ApiQuestion[], void>({
    //   query: () => '/topics/',
    //   providesTags: ['Topics'],
    // }),

    // Получение вопроса по ID
    getTopicById: builder.query<FrontendTopic, number>({
      query: (id) => `/topics/${id}`,
      transformResponse: (topicData: ApiTopicWithQuestionsList): FrontendTopic => {
        const frontendQuestions: FrontendQuestion[] = topicData.questions.map(question => ({
            id: question.id,
            text: question.name,
            stage: question.stage,
            sampleAnswer: question.sample_answer?.description || '',
        }))
        const frontendTopic: FrontendTopic  = {
            id: topicData.id,
            name: topicData.name,
            difficulty: topicData.difficulty,
            questionsCount: topicData.questions_count,
            questions: frontendQuestions
        }
        return frontendTopic
      },
      providesTags: (result, error, id) => [{ type: 'Topics', id }],
    }),
  }),
});

export const {
//   useGetTopicsQuery,
  useGetTopicByIdQuery,
} = topicsApi; 