import { readFileSync } from 'fs';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseCategoryFromHtml } from '@/lib/parser';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('parseCategoryFromHtml', () => {
  it('parses fixture HTML and sorts clues by increasing value', () => {
    const fixturePath = path.join(process.cwd(), 'fixtures', 'sample-category.html');
    const html = readFileSync(fixturePath, 'utf8');

    const category = parseCategoryFromHtml(html);

    expect(category.title).toBe('World Capitals');
    expect(category.clues.map((clue) => clue.value)).toEqual([200, 400, 600]);
    expect(category.clues[0].answer).toBe('Paris');
  });

  it('groups J-Archive clues by clue-id column and returns only the selected category', () => {
    const fixturePath = path.join(process.cwd(), 'fixtures', 'jarchive-category.html');
    const html = readFileSync(fixturePath, 'utf8');

    vi.spyOn(Math, 'random').mockReturnValue(0.51); // selects populated column #2
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    const category = parseCategoryFromHtml(html);

    expect(category.title).toBe('HISTORY');
    expect(category.clues.map((clue) => clue.value)).toEqual([200, 400]);
    expect(category.clues[0].question).toContain('first U.S. president');
    expect(category.clues[0].answer).toBe('George Washington');
    expect(category.clues[1].answer).toBe('1989');

    expect(
      debugSpy.mock.calls.some(
        ([message, payload]) =>
          message === '[parser] Clue coordinate parsed:' &&
          typeof payload === 'object' &&
          payload !== null &&
          'clueId' in payload &&
          payload.clueId === 'clue_J_2_1' &&
          'column' in payload &&
          payload.column === 2 &&
          'row' in payload &&
          payload.row === 1 &&
          'categoryIndex' in payload &&
          payload.categoryIndex === 1,
      ),
    ).toBe(true);

    expect(
      debugSpy.mock.calls.some(
        ([message, payload]) =>
          message === '[parser] Clue counts per column:' &&
          Array.isArray(payload) &&
          payload.some((entry: { column: number; count: number }) => entry.column === 2 && entry.count === 2),
      ),
    ).toBe(true);

    expect(
      debugSpy.mock.calls.some(
        ([message, payload]) =>
          message === '[parser] Final selected category:' &&
          typeof payload === 'object' &&
          payload !== null &&
          'title' in payload &&
          payload.title === 'HISTORY' &&
          'clueValues' in payload &&
          JSON.stringify(payload.clueValues) === JSON.stringify([200, 400]),
      ),
    ).toBe(true);
  });

  it('deterministically selecting category 1 excludes category 2 clues', () => {
    const fixturePath = path.join(process.cwd(), 'fixtures', 'jarchive-category.html');
    const html = readFileSync(fixturePath, 'utf8');

    vi.spyOn(Math, 'random').mockReturnValue(0); // selects column #1

    const category = parseCategoryFromHtml(html);

    expect(category.title).toBe('SCIENCE');
    expect(category.clues.map((clue) => clue.value)).toEqual([200, 400]);
    expect(category.clues.some((clue) => clue.question.includes('first U.S. president'))).toBe(false);
    expect(category.clues.some((clue) => clue.question.includes('Berlin Wall'))).toBe(false);
  });

  it('ignores malformed clues without both question and answer', () => {
    const html = `
      <h1 class="category-title">Science</h1>
      <div class="clue">
        <span class="clue-value">$200</span>
        <p class="clue-question">H2O is known as this.</p>
        <p class="clue-answer">Water</p>
      </div>
      <div class="clue">
        <span class="clue-value">$400</span>
        <p class="clue-question">Missing answer example</p>
      </div>
    `;

    const category = parseCategoryFromHtml(html);

    expect(category.clues).toHaveLength(1);
    expect(category.clues[0].question).toContain('H2O');
  });
});
