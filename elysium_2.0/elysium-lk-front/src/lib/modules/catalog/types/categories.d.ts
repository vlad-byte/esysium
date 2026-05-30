import type { ElementType } from "react";

export interface Question {
  id: number;
  text: string;
}

export interface Topic {
  id: number;
  name: string;
  questions: Question[];
}

export interface CategoryBase {
  id: number;
  name: string;
  icon: ElementType;
}

export interface Category extends CategoryBase {
  topics: Topic[];
  userProgress: Record<number, number>;
}
