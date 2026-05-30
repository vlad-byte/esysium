import {
    ChartBarIcon,
    CubeTransparentIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    PresentationChartLineIcon,
    Squares2X2Icon,
    Bars3BottomLeftIcon,
    ServerStackIcon,
    CodeBracketSquareIcon
  } from "@heroicons/react/24/outline";
import { questionsByTheme } from "./questions";
import type { CategoryBase, Topic } from "../types/categories";
  
export const categories: CategoryBase[] = [
    { id: 1, name: "Классический ML", icon: ChartBarIcon },
    { id: 2, name: "Нейронные сети", icon: CubeTransparentIcon },
    { id: 3, name: "NLP(LLM)", icon: ChatBubbleLeftRightIcon },
    { id: 4, name: "Компьютерное зрение (CV)", icon: EyeIcon },
    { id: 5, name: "Статистика", icon: PresentationChartLineIcon },
    { id: 6, name: "Мат. анализ", icon: Squares2X2Icon },
    { id: 7, name: "Линейная аглебра", icon: Bars3BottomLeftIcon },
    { id: 8, name: "SQL", icon: ServerStackIcon },
    { id: 9, name: "Pandas&Numpy&etc", icon: CodeBracketSquareIcon },
];

export const categoryDetails: Record<number, {
  topics: Topic[];
  userProgress: Record<number, number>;
}> = {
  1: {
    topics: questionsByTheme.filter(t => t.category_id === 1).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 1: 0, 2: 1 },
  },
  2: {
    topics: questionsByTheme.filter(t => t.category_id === 2).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 3: 2, 4: 3 },
  },
  3: {
    topics: questionsByTheme.filter(t => t.category_id === 3).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 5: 1, 6: 2 },
  },
  4: {
    topics: questionsByTheme.filter(t => t.category_id === 4).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 7: 0 },
  },
  5: {
    topics: questionsByTheme.filter(t => t.category_id === 5).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 8: 4 },
  },
  6: {
    topics: questionsByTheme.filter(t => t.category_id === 6).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 9: 0 },
  },
  7: {
    topics: questionsByTheme.filter(t => t.category_id === 7).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 10: 1 },
  },
  8: {
    topics: questionsByTheme.filter(t => t.category_id === 8).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 11: 2 },
  },
  9: {
    topics: questionsByTheme.filter(t => t.category_id === 9).map(t => ({
      id: t.theme_id,
      name: t.theme_name,
      questions: t.questions.map(q => ({ id: q.id, text: q.name, stage: q.stage })),
    })),
    userProgress: { 12: 2, 13: 0 },
  },
};

export const sidebarSections = [
  {
    title: "Категории",
    items: categories.map(el => el.name),
  },
];