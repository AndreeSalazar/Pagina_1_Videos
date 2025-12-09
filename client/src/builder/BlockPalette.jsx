import React from 'react';

export default function BlockPalette({ onAdd }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div>Bloques</div>
      <button onClick={() => onAdd('hero')}>Hero</button>
      <button onClick={() => onAdd('text')}>Texto</button>
      <button onClick={() => onAdd('button')}>Botón</button>
    </div>
  );
}
