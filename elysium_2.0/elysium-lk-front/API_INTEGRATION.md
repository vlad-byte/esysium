# Интеграция с FastAPI

## Настройка

### 1. Установка зависимостей

```bash
npm install @reduxjs/toolkit react-redux
```

### 2. Запуск бэкенда

```bash
cd elysium-lk-back
# Активируйте виртуальное окружение
source venv/Scripts/activate  # Windows
# или
source venv/bin/activate      # Linux/Mac

# Запустите сервер
uvicorn src.main:app --reload --port 8000
```

### 3. Настройка CORS

CORS уже настроен в `elysium-lk-back/src/main.py` для `http://localhost:3000`.

## Структура API

### Категории
- `GET /categories/` - список всех категорий (только id и name)
- `GET /categories/{id}/` - категория с темами
- `GET /user-answers/category/{id}/progress` - прогресс по категории

### Вопросы
- `GET /questions/` - список всех вопросов
- `GET /questions/{id}` - вопрос по ID

### Ответы пользователей
- `POST /user-answers/` - создание ответа (поддерживает файлы)

## RTK Query сервисы

### categoriesApi
- `useGetCategoriesListQuery()` - список категорий
- `useGetCategoryByIdQuery(id)` - категория по ID
- `useGetCategoryProgressQuery(id)` - прогресс по категории
- `useGetFullCategoryDataQuery(id)` - полные данные категории

### questionsApi
- `useGetQuestionsQuery()` - список вопросов
- `useGetQuestionByIdQuery(id)` - вопрос по ID

### userAnswersApi
- `useCreateUserAnswerMutation()` - отправка текстового ответа
- `useCreateVoiceAnswerMutation()` - отправка голосового ответа

## Использование

### Получение категорий
```typescript
import { useCategories } from './hooks/useCategories';

const { categories, isLoading, error } = useCategories();
```

### Отправка ответа
```typescript
import { useAnswerMode } from './hooks/useAnswerMode';

const { submitAnswer } = useAnswerMode();

// В компоненте
const handleSubmit = () => {
  submitAnswer(questionId);
};
```

## Типы данных

Все типы определены в `src/lib/services/types.ts` и соответствуют схемам FastAPI.

## Обработка ошибок

RTK Query автоматически обрабатывает ошибки сети и API. Используйте `error` из хуков для отображения ошибок пользователю. 