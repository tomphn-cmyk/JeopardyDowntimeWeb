import { parseCategoryFromHtml } from './parser';
import { JeopardyCategory } from './types';

const SAMPLE_SOURCE_URL = 'https://www.j-archive.com/showgame.php?game_id=1';

export const getRandomCategory = async (): Promise<JeopardyCategory> => {
  const response = await fetch(SAMPLE_SOURCE_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const category = parseCategoryFromHtml(html);

  if (category.clues.length === 0) {
    throw new Error('Parsed category did not contain any clues');
  }

  return category;
};
