import React from 'react';

export default function ProjectList({ items, onDelete }) {
  if (!items?.length) return <div>No hay proyectos</div>;
  return (
    <ul>
      {items.map((p, idx) => (
        <li key={p._id || p.id || idx} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{p.name}</div>
            <button onClick={() => onDelete?.(p._id)}>Eliminar</button>
          </div>
          {p.description && <div>{p.description}</div>}
          {p.tags?.length ? <div>{p.tags.join(', ')}</div> : null}
          {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a> : null}
        </li>
      ))}
    </ul>
  );
}
