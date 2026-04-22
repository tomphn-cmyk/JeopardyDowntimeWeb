import { load } from 'cheerio';
import { JeopardyCategory } from './types';

const parseValue = (rawValue: string): number => {
  const numeric = Number(rawValue.replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export const parseCategoryFromHtml = (rawHtml: string): JeopardyCategory => {
  const $ = load(rawHtml);

  const title =
    $('h1.category-title').first().text().trim() ||
    $('title').first().text().trim() ||
    'Unknown Category';

  const clues = $('.clue')
    .map((_, clueElement) => {
      const clue = $(clueElement);
      const value = parseValue(clue.find('.clue-value').first().text().trim());
      const question = clue.find('.clue-question').first().text().trim();
      const answer = clue.find('.clue-answer').first().text().trim();

      if (!question || !answer) {
        return null;
      }

      return {
        value,
        question,
        answer,
      };
    })
    .get()
    .filter((entry): entry is { value: number; question: string; answer: string } => Boolean(entry))
    .sort((a, b) => a.value - b.value);

  return {
    title,
    clues,
  };
};
