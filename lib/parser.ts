import { load } from 'cheerio';
import { JeopardyCategory, JeopardyClue } from './types';

type ColumnClue = JeopardyClue & { column: number };

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

const parseJArchiveCategory = (rawHtml: string): JeopardyCategory | null => {
  const $ = load(rawHtml);
  const round = $('#jeopardy_round');

  if (round.length === 0) {
    return null;
  }

  const categoryTitles = round
    .find('td.category_name')
    .map((_, element) => $(element).text().trim())
    .get()
    .slice(0, 6);

  if (categoryTitles.length === 0) {
    return null;
  }

  console.debug('[parser] Parsed category titles:', categoryTitles);

  const cluesByColumn = new Map<number, ColumnClue[]>();

  round.find('td.clue').each((_, clueElement) => {
    const clue = $(clueElement);
    const row = clue.closest('tr');
    const column = row.find('td.clue').index(clue) + 1;

    if (column <= 0) {
      return;
    }

    const valueText =
      clue.find('.clue_value').first().text().trim() || clue.find('.clue_value_daily_double').first().text().trim();

    const value = parseValue(valueText);
    const question = clue.find('.clue_text').first().text().trim();
    const answerFromMarkup = clue.find('.correct_response').first().text().trim();
    const mouseover = clue.find('[onmouseover]').first().attr('onmouseover') || '';
    const answerFromMouseover = mouseover ? extractAnswerFromMouseover(mouseover) : '';
    const answer = answerFromMarkup || answerFromMouseover;

    if (!question || !answer) {
      return;
    }

    console.debug('[parser] Clue detected:', { column, value, question });

    const columnClues = cluesByColumn.get(column) ?? [];
    columnClues.push({ column, value, question, answer });
    cluesByColumn.set(column, columnClues);
  });

  const counts = categoryTitles.map((_, index) => {
    const column = index + 1;
    return { column, count: (cluesByColumn.get(column) ?? []).length };
  });

  console.debug('[parser] Clue counts per category column:', counts);

  const populatedColumns = counts.filter((entry) => entry.count > 0).map((entry) => entry.column);
  if (populatedColumns.length === 0) {
    return null;
  }

  const chosenColumn = populatedColumns[Math.floor(Math.random() * populatedColumns.length)];
  const title = categoryTitles[chosenColumn - 1] ?? 'Unknown Category';
  const clues = (cluesByColumn.get(chosenColumn) ?? []).sort((a, b) => a.value - b.value);

  console.debug('[parser] Final selected category:', {
    column: chosenColumn,
    title,
    clueCount: clues.length,
  });

  return {
    title,
    clues: clues.map(({ value, question, answer }) => ({ value, question, answer })),
  };
};

const parseSimpleFixtureCategory = (rawHtml: string): JeopardyCategory => {
  const $ = load(rawHtml);

  const title =
    $('h1.category-title').first().text().trim() ||
    $('title').first().text().trim() ||
    $('td.category_name').first().text().trim() ||
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
    .filter((entry): entry is JeopardyClue => Boolean(entry))
    .sort((a, b) => a.value - b.value);

  return {
    title,
    clues,
  };
};

export const parseCategoryFromHtml = (rawHtml: string): JeopardyCategory => {
  const jArchiveCategory = parseJArchiveCategory(rawHtml);
  if (jArchiveCategory) {
    return jArchiveCategory;
  }

  return parseSimpleFixtureCategory(rawHtml);
};
