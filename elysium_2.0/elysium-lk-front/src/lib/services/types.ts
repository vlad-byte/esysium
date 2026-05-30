// Типы для API, соответствующие схемам FastAPI

export interface ApiCategory {
  id: number;
  name: string;
}

export interface ApiTopicWithQuestionCount {
  id: number;
  name: string;
  difficulty: string;
  questions_count: number;
}

export interface ApiCategoryWithTopics {
  id: number;
  name: string;
  topics: ApiTopicWithQuestionCount[];
  total_questions: number;
  total_topics: number;
}

export interface ApiQuestion {
  id: number;
  name: string;
  stage: string;
  resourse?: string | null;
  sample_answer?: {
    id: number;
    description: string;
  };
  topic_name?: string;
}

export interface ApiTopicWithQuestionsList extends ApiTopicWithQuestionCount {
  questions: ApiQuestion[]
}

export interface ApiTopicProgressSummary {
  topic_id: number;
  topic_name: string;
  topic_difficulty: string;
  topic_weight: number;
  progress_percentage: number;
  weighted_progress: number;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
}

export interface FrotnendTopicSummary {
  topicId: number;
  topicName: string;
  topicDifficulty: string;
  topicWeight: number;
  progressPercentage: number;
  weightedProgress: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
}

export interface ApiCategoryProgress {
  category_id: number;
  category_name: string;
  total_topics: number;
  total_weighted_progress: number;
  total_weight: number;
  progress_percentage: number;
  topics_progress: ApiTopicProgressSummary[];
}

export interface FrontendProgress {
  categoryId: number,
  categoryName: string,
  totalTopics: number,
  totalWeightedProgress: number,
  totalWeight: number,
  progressPercentage: number,
  topicsProgress: FrotnendTopicSummary[],
}

export interface FrontendQuestion {
  id: number;
  text: string;
  stage: string;
  sampleAnswer: string;
  resourse?: string | null;
  topicName?: string;
}
// Типы для фронтенда (преобразованные из API типов)
export interface FrontendTopic {
  id: number;
  name: string;
  difficulty: string;
  questionsCount: number;
  questions: FrontendQuestion[];
}

export interface FrontendCategory {
  id: number;
  name: string;
  topics: FrontendTopic[];
  questionsCount: number,
  topicsCount: number,
  userProgress: Record<number, number>;
} 