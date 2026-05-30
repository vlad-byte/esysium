import { api } from './api';

// Типы для отправки ответов
export interface CreateUserAnswerRequest {
  question_id: number;
  answer_body: string;
  answer_volume?: string; // для голосовых ответов
  is_anonymous: boolean;
  user_id?: number;
  completeness: 'Полный ответ' | 'Верный но неполный ответ' | 'Неверный ответ';
}

export interface UserAnswerResponse {
  id: number;
  created_at: string;
  question_id: number;
  answer_body: string;
  answer_volume: string;
  is_anonymous: boolean;
  user_id?: number;
  completeness: string;
  feedback: string;
}

export interface QuestionProgressDetail {
  question_id: number;
  question_name: string;
  has_answer: boolean;
  answer_completeness?: string | null;
  progress_modifier: number;
  is_correct: boolean;
}

export interface TopicProgressResponse {
  topic_id: number;
  topic_name: string;
  topic_difficulty?: string | null;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  progress_percentage: number;
  progress_details: QuestionProgressDetail[];
}

// Интерфейсы для упрощённых мутаций (completeness вычисляется бэкендом)
export interface CreateTextAnswerRequest {
  question_id: number;
  answer_body: string;
  is_anonymous: boolean;
  user_id?: number;
}

export interface CreateVoiceAnswerRequest {
  question_id: number;
  audioFile: File;
  is_anonymous: boolean;
  user_id?: number;
}

export const userAnswersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Создание нового ответа пользователя (текстового)
    createUserAnswer: builder.mutation<UserAnswerResponse, CreateUserAnswerRequest>({
      query: (answerData) => {
        const formData = new FormData();
        formData.append('question_id', answerData.question_id.toString());
        formData.append('answer_body', answerData.answer_body);
        formData.append('answer_volume', answerData.answer_volume || '');
        formData.append('is_anonymous', answerData.is_anonymous.toString());
        if (answerData.user_id) formData.append('user_id', answerData.user_id.toString());
        formData.append('completeness', answerData.completeness);

        return {
          url: '/user-answers/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
    }),

    getUserAnswersByQuestion: builder.query<UserAnswerResponse[], number>({
      query: (questionId) => `/user-answers/question/${questionId}`,
      providesTags: (result, error, questionId) => [{ type: 'UserAnswers', id: questionId }],
    }),

    getTopicProgress: builder.query<
      TopicProgressResponse,
      { topicId: number; userId?: number }
    >({
      query: ({ topicId, userId }) => ({
        url: `/user-answers/topic/${topicId}/progress`,
        params: userId != null ? { user_id: userId } : undefined,
      }),
      providesTags: (result, error, arg) => [{ type: 'TopicProgress', id: arg.topicId }],
    }),

    // Упрощённые мутации (completeness вычисляется бэкендом) — в одном API-экземпляре
    // чтобы invalidatesTags работал для TopicProgress/CategoryProgress
    createTextAnswer: builder.mutation<UserAnswerResponse, CreateTextAnswerRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append('question_id', data.question_id.toString());
        formData.append('answer_body', data.answer_body);
        formData.append('is_anonymous', data.is_anonymous.toString());
        if (data.user_id != null) formData.append('user_id', data.user_id.toString());
        return { url: '/user-answers/', method: 'POST', body: formData };
      },
      invalidatesTags: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
    }),

    createVoiceAnswer: builder.mutation<UserAnswerResponse, CreateVoiceAnswerRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append('question_id', data.question_id.toString());
        formData.append('answer_body', '');
        formData.append('answer_volume', data.audioFile);
        formData.append('is_anonymous', data.is_anonymous.toString());
        if (data.user_id != null) formData.append('user_id', data.user_id.toString());
        return { url: '/user-answers/', method: 'POST', body: formData };
      },
      invalidatesTags: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
    }),
  }),
});

export const {
  useCreateUserAnswerMutation,
  useGetUserAnswersByQuestionQuery,
  useGetTopicProgressQuery,
  useCreateTextAnswerMutation,
  useCreateVoiceAnswerMutation,
} = userAnswersApi; 