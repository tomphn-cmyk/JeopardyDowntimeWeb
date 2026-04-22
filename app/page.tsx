'use client';

import { useState } from 'react';
import { JeopardyCategory } from '@/lib/types';

export default function HomePage() {
  const [category, setCategory] = useState<JeopardyCategory | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategory = async () => {
    setLoading(true);
    setError(null);
    setRevealed({});

    try {
      const response = await fetch('/api/random-category');

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to load category.');
      }

      const data: JeopardyCategory = await response.json();
      setCategory(data);
    } catch (requestError) {
      setCategory(null);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>JeopardyDowntime</h1>
      <button onClick={loadCategory} disabled={loading}>
        {loading ? 'Loading...' : 'New Category'}
      </button>

      {error && <p role="alert">{error}</p>}

      {category && (
        <section>
          <h2>{category.title}</h2>
          <ul className="clue-list">
            {category.clues.map((clue, index) => (
              <li className="clue-card" key={`${clue.value}-${index}`}>
                <button
                  type="button"
                  onClick={() => setRevealed((prev) => ({ ...prev, [index]: !prev[index] }))}
                >
                  <div className="value">${clue.value}</div>
                  <div>{clue.question}</div>
                  {revealed[index] && <div className="answer">Answer: {clue.answer}</div>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
