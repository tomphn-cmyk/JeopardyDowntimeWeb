import { describe, expect, it, vi, afterEach } from 'vitest';
import { getRandomCategory } from '@/lib/randomCategory';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getRandomCategory', () => {
  it('randomizes game id when fetching', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1234);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        '<td class="category_name">Sample</td><td class="clue"><td class="clue_value">$200</td><td class="clue_text">Q</td><div onmouseover="toggle(\'x\', \'<em class=\\\"correct_response\\\">A</em>\', \'\')"></div></td>',
    });

    vi.stubGlobal('fetch', fetchMock);

    await getRandomCategory();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('game_id=1235');
  });
});
