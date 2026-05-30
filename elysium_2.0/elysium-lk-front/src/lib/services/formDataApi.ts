import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Базовый URL для API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8002/api';

// Отдельный API для FormData запросов
export const formDataApi = createApi({
  reducerPath: 'formDataApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    // Не устанавливаем Content-Type, браузер сам установит multipart/form-data
  }),
  tagTypes: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
  endpoints: (builder) => ({
    // Создание текстового ответа
    createTextAnswer: builder.mutation<any, {
      question_id: number;
      answer_body: string;
      is_anonymous: boolean;
      user_id?: number;
    }>({
      query: (data) => {
        const formData = new FormData();
        formData.append('question_id', data.question_id.toString());
        formData.append('answer_body', data.answer_body);
        // Не добавляем answer_volume для текстовых ответов
        formData.append('is_anonymous', data.is_anonymous.toString());
        if (data.user_id != null) formData.append('user_id', data.user_id.toString());
        // completeness заполняется на бэкенде автоматически

        return {
          url: '/user-answers/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
    }),

    // Создание голосового ответа
    createVoiceAnswer: builder.mutation<any, {
      question_id: number;
      audioFile: File;
      is_anonymous: boolean;
      user_id?: number;
    }>({
      query: (data) => {
        const formData = new FormData();
        formData.append('question_id', data.question_id.toString());
        formData.append('answer_body', '');
        formData.append('answer_volume', data.audioFile);
        formData.append('is_anonymous', data.is_anonymous.toString());
        if (data.user_id != null) formData.append('user_id', data.user_id.toString());
        // completeness заполняется на бэкенде автоматически

        return {
          url: '/user-answers/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['UserAnswers', 'CategoryProgress', 'TopicProgress'],
    }),
  }),
});

export const {
  useCreateTextAnswerMutation,
  useCreateVoiceAnswerMutation,
} = formDataApi; 