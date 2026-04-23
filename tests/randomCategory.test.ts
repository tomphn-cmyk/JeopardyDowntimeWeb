import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRandomCategory } from '@/lib/randomCategory';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getRandomCategory', () => {
  it('randomizes game id when fetching', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1234);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `
        <table id="jeopardy_round">
          <tr>
            <td class="category_name">Sample</td>
            <td class="category_name">B</td>
            <td class="category_name">C</td>
            <td class="category_name">D</td>
            <td class="category_name">E</td>
            <td class="category_name">F</td>
          </tr>
          <tr>
            <td class="clue">
              <table>
                <tr><td class="clue_value">$200</td></tr>
                <tr><td class="clue_text">Q</td></tr>
              </table>
              <div onmouseover="toggle('x', '&lt;em class=\\"correct_response\\"&gt;A&lt;/em&gt;', '')"></div>
            </td>
            <td class="clue"></td><td class="clue"></td><td class="clue"></td><td class="clue"></td><td class="clue"></td>
          </tr>
        </table>
      `,
    });

    vi.stubGlobal('fetch', fetchMock);

    const category = await getRandomCategory();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('game_id=1235');
    expect(category.title).toBe('Sample');
    expect(category.clues).toHaveLength(1);
  });
});
