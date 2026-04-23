import { parseCategoryFromHtml } from './parser';
import { JeopardyCategory } from './types';

const MIN_GAME_ID = 1;
const MAX_GAME_ID = 10000;

const randomGameId = (): number =>
  Math.floor(Math.random() * (MAX_GAME_ID - MIN_GAME_ID + 1)) + MIN_GAME_ID;

export const getRandomCategory = async (): Promise<JeopardyCategory> => {
  const gameId = randomGameId();
  const response = await fetch(`https://www.j-archive.com/showgame.php?game_id=${gameId}`, {
    cache: 'no-store',
  });

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
