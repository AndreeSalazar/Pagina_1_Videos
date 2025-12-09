import React from 'react';

export default function Canvas({ blocks, onUpdate, onRemove }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 16 }}>
      <div>Editor</div>
      {!blocks.length && <div>Agrega bloques</div>}
      {blocks.map((b, i) => (
        <div key={i} style={{ border: '1px dashed #aaa', padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <strong>{b.type}</strong>
            <button onClick={() => onRemove(i)}>Eliminar</button>
          </div>
          {b.type === 'hero' && (
            <div style={{ display: 'grid', gap: 6 }}>
              <input value={b.props.heading} onChange={e => onUpdate(i, { ...b, props: { ...b.props, heading: e.target.value } })} placeholder="Heading" />
              <input value={b.props.subheading} onChange={e => onUpdate(i, { ...b, props: { ...b.props, subheading: e.target.value } })} placeholder="Subheading" />
              <input value={b.props.cta} onChange={e => onUpdate(i, { ...b, props: { ...b.props, cta: e.target.value } })} placeholder="CTA" />
            </div>
          )}
          {b.type === 'text' && (
            <textarea value={b.props.content} onChange={e => onUpdate(i, { ...b, props: { ...b.props, content: e.target.value } })} placeholder="Contenido" />
          )}
          {b.type === 'button' && (
            <div style={{ display: 'grid', gap: 6 }}>
              <input value={b.props.label} onChange={e => onUpdate(i, { ...b, props: { ...b.props, label: e.target.value } })} placeholder="Label" />
              <input value={b.props.href} onChange={e => onUpdate(i, { ...b, props: { ...b.props, href: e.target.value } })} placeholder="Href" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
