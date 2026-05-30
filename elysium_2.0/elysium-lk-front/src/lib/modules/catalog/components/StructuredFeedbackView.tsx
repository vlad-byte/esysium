'use client';
import React from 'react';
import { parseFeedback, isEmptySection } from '../utils/parseFeedback';

interface Props {
  feedback: string;
}

const SCORE_META: Record<number, { label: string; emoji: string; ring: string; bg: string; text: string }> = {
  1: { label: 'Очень слабо', emoji: '😬', ring: 'ring-red-300', bg: 'bg-red-50', text: 'text-red-700' },
  2: { label: 'Слабо', emoji: '😕', ring: 'ring-orange-300', bg: 'bg-orange-50', text: 'text-orange-700' },
  3: { label: 'Удовлетворительно', emoji: '😐', ring: 'ring-yellow-300', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  4: { label: 'Хорошо', emoji: '🙂', ring: 'ring-blue-300', bg: 'bg-blue-50', text: 'text-blue-700' },
  5: { label: 'Отлично!', emoji: '🎉', ring: 'ring-green-300', bg: 'bg-green-50', text: 'text-green-700' },
};

const SECTIONS = [
  {
    key: 'correct' as const,
    label: 'Правильно',
    emptyText: 'Верных моментов не выявлено',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
    bg: 'bg-emerald-50',
    titleColor: 'text-emerald-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-600 shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  {
    key: 'incorrect' as const,
    label: 'Ошибки',
    emptyText: 'Ошибок не найдено',
    dot: 'bg-rose-500',
    border: 'border-rose-100',
    bg: 'bg-rose-50',
    titleColor: 'text-rose-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-rose-600 shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  },
  {
    key: 'whatDidntSay' as const,
    label: 'Что не упомянул',
    emptyText: 'Всё ключевое сказано',
    dot: 'bg-amber-500',
    border: 'border-amber-100',
    bg: 'bg-amber-50',
    titleColor: 'text-amber-700',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-amber-600 shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
];

export default function StructuredFeedbackView({ feedback }: Props) {
  const parsed = parseFeedback(feedback);

  if (!parsed) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        Обратная связь появится после ответа на вопрос
      </p>
    );
  }

  const score = parsed.score;
  const meta = score ? SCORE_META[score] : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Score */}
      {score != null && meta && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 ${meta.ring} ${meta.bg}`}>
          <span className="text-2xl leading-none">{meta.emoji}</span>
          <div className="flex flex-col leading-tight">
            <span className={`text-xs font-medium uppercase tracking-wide ${meta.text} opacity-70`}>
              Оценка
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-extrabold ${meta.text}`}>{score}</span>
              <span className={`text-sm font-medium ${meta.text} opacity-60`}>/ 5</span>
              <span className={`text-sm font-semibold ${meta.text} ml-1`}>{meta.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map((sec) => {
        const items = parsed[sec.key];
        const empty = isEmptySection(items);
        return (
          <div key={sec.key} className={`rounded-xl border ${sec.border} ${sec.bg} overflow-hidden`}>
            <div className={`flex items-center gap-1.5 px-3 pt-2.5 pb-1.5`}>
              {sec.icon}
              <span className={`text-xs font-semibold uppercase tracking-wider ${sec.titleColor}`}>
                {sec.label}
              </span>
            </div>
            <div className="px-3 pb-3">
              {empty ? (
                <p className="text-sm text-gray-400 italic">{sec.emptyText}</p>
              ) : (
                <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800 leading-snug">
                      <span className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${sec.dot}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
