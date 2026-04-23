'use client';

import { useState } from 'react';
import { JeopardyCategory } from '@/lib/types';

export default function HomePage() {
  const [category, setCategory] = useState<JeopardyCategory | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const loadCategory = async () => {
    setLoading(true);
    setRevealed({});

    try {
      const response = await fetch('/api/random-category');
      const data: JeopardyCategory = await response.json();
      setCategory(data);
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
