import { promises as fs } from 'fs';
import path from 'path';
import { parseCategoryFromHtml } from './parser';
import { JeopardyCategory } from './types';

const SAMPLE_SOURCE_URL = 'https://www.j-archive.com/showgame.php?game_id=1';

const readFixtureCategory = async (): Promise<JeopardyCategory> => {
  const fixturePath = path.join(process.cwd(), 'fixtures', 'sample-category.html');
  const fixtureHtml = await fs.readFile(fixturePath, 'utf8');
  return parseCategoryFromHtml(fixtureHtml);
};

export const getRandomCategory = async (): Promise<JeopardyCategory> => {
  if (process.env.USE_FIXTURE_CATEGORY === 'true') {
    return readFixtureCategory();
  }

  try {
    const response = await fetch(SAMPLE_SOURCE_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const html = await response.text();
    const category = parseCategoryFromHtml(html);

    if (category.clues.length === 0) {
      return readFixtureCategory();
    }

    return category;
  } catch {
    return readFixtureCategory();
  }
};
