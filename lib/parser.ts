import { load } from 'cheerio';
import { JeopardyCategory } from './types';

const parseValue = (rawValue: string): number => {
  const numeric = Number(rawValue.replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeAnswerFromHtml = (rawAnswerHtml: string): string => {
  const withoutEscapes = rawAnswerHtml
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/');

  return load(`<div>${withoutEscapes}</div>`)('div').text().trim();
};

const extractAnswerFromMouseover = (onmouseover: string): string => {
  const answerPatterns = [
    /correct_response\\?">([\s\S]*?)<\\?\/em>/i,
    /correct_response\">([\s\S]*?)<\/em>/i,
    /correct_response">([\s\S]*?)<\/em>/i,
  ];

  for (const pattern of answerPatterns) {
    const match = onmouseover.match(pattern);
    if (match?.[1]) {
      return normalizeAnswerFromHtml(match[1]);
    }
  }

  return '';
};

export const parseCategoryFromHtml = (rawHtml: string): JeopardyCategory => {
  const $ = load(rawHtml);

  const jArchiveCategoryTitle = $('td.category_name').first().text().trim();
  const title =
    jArchiveCategoryTitle ||
    $('h1.category-title').first().text().trim() ||
    $('title').first().text().trim() ||
    'Unknown Category';

  const selector = $('td.clue').length > 0 ? 'td.clue' : '.clue';

  const clues = $(selector)
    .map((_, clueElement) => {
      const clue = $(clueElement);

      const valueText =
        clue.find('.clue_value').first().text().trim() ||
        clue.find('.clue_value_daily_double').first().text().trim() ||
        clue.find('.clue-value').first().text().trim();

      const question = clue.find('.clue_text').first().text().trim() || clue.find('.clue-question').first().text().trim();

      const answerFromMarkup = clue.find('.correct_response').first().text().trim();
      const mouseover = clue.find('[onmouseover]').first().attr('onmouseover') || '';
      const answerFromMouseover = mouseover ? extractAnswerFromMouseover(mouseover) : '';
      const answer = answerFromMarkup || answerFromMouseover || clue.find('.clue-answer').first().text().trim();

      if (!question || !answer) {
        return null;
      }

      return {
        value: parseValue(valueText),
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
