# Руководство по интеграции фронтенда с бэкендом

## Обзор интеграции

Данное руководство описывает интеграцию фронтенда (Next.js) с бэкендом (FastAPI) для функционала отправки ответов пользователей.

## Архитектура интеграции

### Бэкенд (FastAPI)

#### Основные эндпоинты:

1. **GET /questions/{question_id}** - Получение вопроса с информацией о теме
   - Возвращает схему `QuestionWithTopic` с полем `topic_name`
   - Включает пример ответа (`sample_answer`)

2. **POST /user-answers/** - Создание ответа пользователя
   - **Формат запроса: multipart/form-data**
   - Поддерживает текстовые и голосовые ответы
   - Принимает файлы для аудио ответов
   - Кодирует аудио в base64 для хранения

#### Схемы данных:

```python
# QuestionWithTopic
{
  "id": int,
  "name": str,
  "stage": str,
  "sample_answer": Optional[SampleAnswer],
  "topic_name": str  # Новое поле
}

# UserAnswerCreate (multipart/form-data)
{
  "question_id": int,
  "answer_body": str,
  "answer_volume": Optional[UploadFile],  # файл для аудио
  "is_anonymous": bool,
  "user_id": Optional[int],
  "completeness": CompletenessEnum
}
```

### Фронтенд (Next.js + RTK Query)

#### API слои:

1. **questionsApi** - Работа с вопросами
   - `useGetQuestionByIdQuery` - получение вопроса по ID
   - Трансформация данных из `ApiQuestion` в `FrontendQuestion`

2. **userAnswersApi** - Работа с ответами пользователей
   - `useCreateUserAnswerMutation` - отправка текстового ответа (multipart/form-data)
   - `useCreateVoiceAnswerMutation` - отправка голосового ответа (multipart/form-data)

#### Компоненты:

1. **AnswerQuestionPage** - Основная страница ответа на вопрос
   - Отображает название темы и текст вопроса
   - Интегрирует компоненты ввода и уведомлений

2. **AnswerInput** - Компонент ввода ответа
   - Поддержка текстового и голосового ввода
   - Таймер записи (120 секунд)
   - Конвертация аудио в WAV формат

3. **Notification** - Компонент уведомлений
   - Отображение успешных/ошибочных сообщений
   - Автоматическое скрытие через 5 секунд

## Установка и запуск

### Бэкенд

```bash
cd elysium-lk-back

# Активация виртуального окружения
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Фронтенд

```bash
cd elysium-lk

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

## Тестирование интеграции

### Автоматические тесты

```bash
cd elysium-lk-back
python test_api.py
```

Тесты проверяют:
- Получение вопроса с информацией о теме
- Создание текстового ответа (multipart/form-data)
- Создание голосового ответа (multipart/form-data)

### Ручное тестирование

1. Откройте браузер на `http://localhost:3000`
2. Перейдите к любому вопросу
3. Проверьте отображение названия темы
4. Попробуйте отправить текстовый ответ
5. Попробуйте записать и отправить голосовой ответ

## Основные функции

### Отправка текстового ответа (multipart/form-data)

```typescript
const [createTextAnswer] = useCreateUserAnswerMutation();

const submitTextAnswer = async (questionId: number, text: string) => {
  try {
    const result = await createTextAnswer({
      question_id: questionId,
      answer_body: text,
      answer_volume: '', // пустая строка для текстового ответа
      is_anonymous: true,
    }).unwrap();
    
    console.log('Ответ отправлен:', result);
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
};
```

### Отправка голосового ответа (multipart/form-data)

```typescript
const [createVoiceAnswer] = useCreateVoiceAnswerMutation();

const submitVoiceAnswer = async (questionId: number, audioFile: File) => {
  try {
    const result = await createVoiceAnswer({
      question_id: questionId,
      audioFile, // File объект
      is_anonymous: true,
    }).unwrap();
    
    console.log('Голосовой ответ отправлен:', result);
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
};
```

## Форматы данных

### Важно: Все запросы к /user-answers/ используют multipart/form-data

**Текстовый ответ:**
```javascript
const formData = new FormData();
formData.append('question_id', '123');
formData.append('answer_body', 'Текст ответа');
// answer_volume не отправляется для текстовых ответов
formData.append('is_anonymous', 'true');
// completeness заполняется на бэкенде автоматически
```

**Голосовой ответ:**
```javascript
const formData = new FormData();
formData.append('question_id', '123');
formData.append('answer_body', ''); // пустая строка
formData.append('answer_volume', audioFile); // File объект
formData.append('is_anonymous', 'true');
// completeness заполняется на бэкенде автоматически
```

## Обработка ошибок

### Фронтенд

- Состояния загрузки (`isLoading`)
- Обработка ошибок API (`error`)
- Уведомления пользователю через компонент `Notification`
- Fallback UI для отсутствующих данных

### Бэкенд

- HTTP статус коды (404, 400, 500)
- Детальные сообщения об ошибках
- Валидация входных данных через Pydantic
- Логирование ошибок

## Безопасность

- CORS настройки для фронтенда
- Валидация файлов на бэкенде
- Ограничение размера аудио файлов
- Анонимные ответы по умолчанию

## Производительность

- Кэширование запросов через RTK Query
- Оптимизация аудио (конвертация в WAV)
- Ленивая загрузка компонентов
- Дебаунсинг пользовательского ввода

## Мониторинг

- Логирование на бэкенде
- Консольные логи на фронтенде
- Отслеживание ошибок в браузере
- Метрики производительности

## Дальнейшее развитие

1. **Аутентификация пользователей**
2. **Реальное время (WebSocket)**
3. **Анализ аудио на бэкенде**
4. **Экспорт данных**
5. **Мобильное приложение** 