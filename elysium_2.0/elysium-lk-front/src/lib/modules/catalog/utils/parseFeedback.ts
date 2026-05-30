export interface StructuredFeedback {
  score: number | null;
  correct: string[];
  incorrect: string[];
  whatDidntSay: string[];
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export function parseFeedback(raw: string | null | undefined): StructuredFeedback | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  // JSON format (новые ответы)
  if (trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed) as Record<string, unknown>;
      const score = typeof data.score === 'number'
        ? data.score
        : (Number(data.score) || null);
      return {
        score: isNaN(score as number) ? null : score,
        correct: normalizeList(data.correct),
        incorrect: normalizeList(data.incorrect),
        whatDidntSay: normalizeList(data.what_didnt_say ?? data.whatDidntSay),
      };
    } catch {
      // fall through
    }
  }

  // Старый текстовый формат: "Оценка: 3\nКорректно: ...\nОшибки: ...\nЧто не сказал: ..."
  const result: StructuredFeedback = { score: null, correct: [], incorrect: [], whatDidntSay: [] };
  const sections: { key: keyof StructuredFeedback; labels: string[] }[] = [
    { key: 'correct', labels: ['Корректно:', 'correct:'] },
    { key: 'incorrect', labels: ['Ошибки:', 'incorrect:'] },
    { key: 'whatDidntSay', labels: ['Что не сказал:', 'what_didnt_say:'] },
  ];

  let currentKey: keyof StructuredFeedback | null = null;
  const buf: Partial<Record<keyof StructuredFeedback, string[]>> = {};

  for (const line of trimmed.split('\n')) {
    const scoreMatch = line.match(/^(?:Оценка|score)\s*:\s*(\d+)/i);
    if (scoreMatch) { result.score = Number(scoreMatch[1]); currentKey = null; continue; }

    let hit = false;
    for (const sec of sections) {
      for (const label of sec.labels) {
        if (line.toLowerCase().startsWith(label.toLowerCase())) {
          currentKey = sec.key;
          const rest = line.slice(label.length).trim();
          if (rest) (buf[currentKey] = buf[currentKey] || []).push(rest);
          hit = true; break;
        }
      }
      if (hit) break;
    }
    if (!hit && currentKey && line.trim()) {
      (buf[currentKey] = buf[currentKey] || []).push(line.trim());
    }
  }

  result.correct = buf.correct ?? [];
  result.incorrect = buf.incorrect ?? [];
  result.whatDidntSay = buf.whatDidntSay ?? [];

  if (!result.score && result.correct.length === 0 && result.incorrect.length === 0) return null;
  return result;
}

export function isEmptySection(items: string[]): boolean {
  if (!items.length) return true;
  return items.length === 1 && ['нет', 'no', '—'].includes(items[0].toLowerCase());
}
