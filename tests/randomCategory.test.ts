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
            <td id="clue_J_1_1" class="clue">
              <table>
                <tr><td class="clue_value">$200</td></tr>
                <tr><td id="clue_J_1_1_stuck" class="clue_text">Q</td></tr>
              </table>
              <div><em class="correct_response">A</em></div>
            </td>
            <td id="clue_J_1_2" class="clue"></td>
            <td id="clue_J_1_3" class="clue"></td>
            <td id="clue_J_1_4" class="clue"></td>
            <td id="clue_J_1_5" class="clue"></td>
            <td id="clue_J_1_6" class="clue"></td>
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
