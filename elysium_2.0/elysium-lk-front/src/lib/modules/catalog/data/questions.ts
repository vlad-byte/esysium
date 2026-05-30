export interface Question {
  id: number;
  name: string;
  stage: 'hr' | 'soft' | 'technical';
}

export interface ThemeQuestions {
  theme_id: number;
  category_id: number;
  theme_name: string;
  questions: Question[];
}

export const questionsByTheme: ThemeQuestions[] = [
  // Классический ML (id: 1)
  {
    theme_id: 1,
    category_id: 1,
    theme_name: 'Регрессия',
    questions: [
      { id: 1, name: 'Что такое линейная регрессия?', stage: 'technical' },
      { id: 2, name: 'В каких задачах применяется регрессия?', stage: 'hr' },
      { id: 3, name: 'Как бы вы объяснили регуляризацию новичку?', stage: 'soft' },
      { id: 4, name: 'Что такое градиентный спуск?', stage: 'technical' },
      { id: 5, name: 'Расскажите о случае, когда регрессия дала неожиданный результат.', stage: 'soft' },
    ],
  },
  {
    theme_id: 2,
    category_id: 1,
    theme_name: 'Классификация',
    questions: [
      { id: 1, name: 'Что такое логистическая регрессия?', stage: 'technical' },
      { id: 2, name: 'Что такое SVM?', stage: 'technical' },
      { id: 3, name: 'Как бы вы объяснили классификацию человеку без технического образования?', stage: 'soft' },
      { id: 4, name: 'Почему вы выбрали машинное обучение как сферу?', stage: 'hr' },
    ],
  },
  // Нейронные сети (id: 2)
  {
    theme_id: 3,
    category_id: 2,
    theme_name: 'Основы',
    questions: [
      { id: 1, name: 'Что такое нейрон?', stage: 'technical' },
      { id: 2, name: 'Что такое слой?', stage: 'technical' },
      { id: 3, name: 'Как вы обучались работе с нейронными сетями?', stage: 'hr' },
      { id: 4, name: 'Как бы вы объяснили работу нейрона ребёнку?', stage: 'soft' },
    ],
  },
  {
    theme_id: 4,
    category_id: 2,
    theme_name: 'CNN',
    questions: [
      { id: 1, name: 'Что такое свёрточная сеть?', stage: 'technical' },
      { id: 2, name: 'Для чего нужны пулинг-слои?', stage: 'technical' },
      { id: 3, name: 'Что такое padding?', stage: 'technical' },
      { id: 4, name: 'Что такое stride?', stage: 'technical' },
      { id: 5, name: 'Как вы решаете задачи, если не знаете архитектуру заранее?', stage: 'soft' },
    ],
  },
  // NLP(LLM) (id: 3)
  {
    theme_id: 5,
    category_id: 3,
    theme_name: 'Токенизация',
    questions: [
      { id: 1, name: 'Что такое токенизация?', stage: 'technical' },
      { id: 2, name: 'Почему важна токенизация в NLP?', stage: 'soft' },
      { id: 3, name: 'Как вы изучали современные LLM?', stage: 'hr' },
    ],
  },
  {
    theme_id: 6,
    category_id: 3,
    theme_name: 'LLM',
    questions: [
      { id: 1, name: 'Что такое LLM?', stage: 'technical' },
      { id: 2, name: 'Что такое attention?', stage: 'technical' },
      { id: 3, name: 'Как вы объясните работу attention человеку без ML-опыта?', stage: 'soft' },
    ],
  },
  // Компьютерное зрение (CV) (id: 4)
  {
    theme_id: 7,
    category_id: 4,
    theme_name: 'Обработка изображений',
    questions: [
      { id: 1, name: 'Что такое фильтрация?', stage: 'technical' },
      { id: 2, name: 'Что такое свёртка?', stage: 'technical' },
      { id: 3, name: 'Как вы решаете задачи с шумными изображениями?', stage: 'soft' },
      { id: 4, name: 'Почему вы выбрали CV?', stage: 'hr' },
    ],
  },
  // Статистика (id: 5)
  {
    theme_id: 8,
    category_id: 5,
    theme_name: 'Вероятности',
    questions: [
      { id: 1, name: 'Что такое вероятность?', stage: 'technical' },
      { id: 2, name: 'Что такое распределение?', stage: 'technical' },
      { id: 3, name: 'Что такое дисперсия?', stage: 'technical' },
      { id: 4, name: 'Что такое корреляция?', stage: 'technical' },
      { id: 5, name: 'Как вы применяли статистику в проектах?', stage: 'hr' },
      { id: 6, name: 'Как объяснить корреляцию школьнику?', stage: 'soft' },
    ],
  },
  // Мат. анализ (id: 6)
  {
    theme_id: 9,
    category_id: 6,
    theme_name: 'Производные',
    questions: [
      { id: 1, name: 'Что такое производная?', stage: 'technical' },
      { id: 2, name: 'Как вы объясните производную на пальцах?', stage: 'soft' },
      { id: 3, name: 'Где вы применяли производные на практике?', stage: 'hr' },
    ],
  },
  // Линейная алгебра (id: 7)
  {
    theme_id: 10,
    category_id: 7,
    theme_name: 'Матрицы',
    questions: [
      { id: 1, name: 'Что такое матрица?', stage: 'technical' },
      { id: 2, name: 'Что такое определитель?', stage: 'technical' },
      { id: 3, name: 'Как вы объясните матрицы гуманитарию?', stage: 'soft' },
      { id: 4, name: 'В каких проектах вы использовали линейную алгебру?', stage: 'hr' },
    ],
  },
  // SQL (id: 8)
  {
    theme_id: 11,
    category_id: 8,
    theme_name: 'Запросы',
    questions: [
      { id: 1, name: 'Что такое SELECT?', stage: 'technical' },
      { id: 2, name: 'Что такое JOIN?', stage: 'technical' },
      { id: 3, name: 'Что такое GROUP BY?', stage: 'technical' },
      { id: 4, name: 'Что такое индекс?', stage: 'technical' },
      { id: 5, name: 'Что такое транзакция?', stage: 'technical' },
      { id: 6, name: 'Как вы обучались SQL?', stage: 'hr' },
      { id: 7, name: 'Как объяснить JOIN новичку?', stage: 'soft' },
    ],
  },
  // Pandas&Numpy&etc (id: 9)
  {
    theme_id: 12,
    category_id: 9,
    theme_name: 'NumPy',
    questions: [
      { id: 1, name: 'Что такое массив NumPy?', stage: 'technical' },
      { id: 2, name: 'Что такое shape?', stage: 'technical' },
      { id: 3, name: 'Как вы изучали NumPy?', stage: 'hr' },
      { id: 4, name: 'Как объяснить shape ребёнку?', stage: 'soft' },
    ],
  },
  {
    theme_id: 13,
    category_id: 9,
    theme_name: 'Pandas',
    questions: [
      { id: 1, name: 'Что такое DataFrame?', stage: 'technical' },
      { id: 2, name: 'Как вы применяли Pandas в проектах?', stage: 'hr' },
      { id: 3, name: 'Как объяснить DataFrame простыми словами?', stage: 'soft' },
    ],
  },
]; 