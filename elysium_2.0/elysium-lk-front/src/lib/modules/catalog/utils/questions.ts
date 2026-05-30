import { CategoryBase, Topic, Question, Category } from "../types/categories";
import { getProgressInfo } from "./progress";

export function normalizeQuestions(questions: any[]): { id: number; text: string; stage: string }[] {
  if (questions.length === 0) return [];
  if ('text' in questions[0] && 'stage' in questions[0]) return questions;
  return questions.map((q: any) => {
    if ('stage' in q) return { id: q.id, text: q.name, stage: q.stage };
    const orig = (questions.find((qq: any) => qq.id === q.id) as any) || {};
    return { id: q.id, text: q.text, stage: orig.stage || '' };
  });
}

export function getTopicProgressInfo(
  category: CategoryBase,
  topic: Topic,
  questions: Question[],
  userProgress: Record<number, number>,
  getDifficulty: (n: number) => { label: string; color: string }
) {
  const fakeCategory: Category = {
    ...category,
    topics: [{ id: topic.id, name: topic.name, questions }],
    userProgress: { [topic.id]: userProgress[topic.id] || 0 },
  };
  const { answered, totalQuestions, percent, colorClass } = getProgressInfo(fakeCategory);
  const { label: difficultyLabel, color: badgeColor } = getDifficulty(totalQuestions);
  return { answered, totalQuestions, percent, colorClass, difficultyLabel, badgeColor };
} 