import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Базовый URL для API (можно вынести в переменные окружения)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8002/api';

// Базовый query для обычных JSON запросов
const baseQuery = fetchBaseQuery({ 
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Базовый query для FormData запросов (без установки Content-Type)
const formDataBaseQuery = fetchBaseQuery({ 
  baseUrl: API_BASE_URL,
  // Не устанавливаем Content-Type, браузер сам установит multipart/form-data
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    // Не устанавливаем Content-Type автоматически
    // Для JSON запросов будем устанавливать вручную
  }),
  tagTypes: ['Categories', 'Category', 'CategoryProgress', 'Questions', 'UserAnswers', 'TopicProgress', 'Topics', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation<any, { username: string; password: string }>({
      query: (body) => ({
        url: '/users/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<any, { username: string; password: string }>({
      query: (body) => ({
        url: '/users/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Экспортируем formDataBaseQuery для использования в мутациях с файлами
export { formDataBaseQuery };

export const { useLoginMutation, useRegisterMutation } = api; 