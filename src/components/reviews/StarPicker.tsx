'use client';

import { useState } from 'react';

const LABELS = ['', 'Bad — Not recommended', 'Meh — Could be better', 'OK — It was fine', 'Good — I liked it', 'Amazing — I loved it!'];

interface Props {
  value: number;
  onChange: (v: number) => void;
  size?: string;
}

export default function StarPicker({ value, onChange, size = '2.2rem' }: Props) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: size,
              cursor: 'pointer',
              color: 'var(--yellow)',
              opacity: n <= active ? 1 : 0.25,
              transform: n <= active ? 'scale(1.1)' : 'scale(1)',
              transition: 'all .15s',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      <div style={{
        fontSize: '.82rem',
        color: active >= 4 ? 'var(--green)' : active >= 3 ? 'var(--muted)' : active > 0 ? 'var(--red)' : 'var(--muted)',
        marginTop: '8px',
        height: '18px',
        fontWeight: 500,
      }}>
        {LABELS[active] || 'Click a star to rate'}
      </div>
    </div>
  );
}
