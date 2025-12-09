import React from 'react';

export default function ProjectList({ items }) {
  if (!items?.length) return <div>No hay proyectos</div>;
  return (
    <ul>
      {items.map(p => (
        <li key={p._id} style={{ marginBottom: 12 }}>
          <div>{p.name}</div>
          {p.description && <div>{p.description}</div>}
          {p.tags?.length ? <div>{p.tags.join(', ')}</div> : null}
          {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a> : null}
        </li>
      ))}
    </ul>
  );
}
