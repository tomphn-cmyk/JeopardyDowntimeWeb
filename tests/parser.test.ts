import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parseCategoryFromHtml } from '@/lib/parser';

describe('parseCategoryFromHtml', () => {
  it('parses fixture HTML and sorts clues by increasing value', () => {
    const fixturePath = path.join(process.cwd(), 'fixtures', 'sample-category.html');
    const html = readFileSync(fixturePath, 'utf8');

    const category = parseCategoryFromHtml(html);

    expect(category.title).toBe('World Capitals');
    expect(category.clues.map((clue) => clue.value)).toEqual([200, 400, 600]);
    expect(category.clues[0].answer).toBe('Paris');
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
