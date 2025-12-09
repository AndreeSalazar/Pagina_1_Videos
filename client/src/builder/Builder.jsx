import React, { useEffect, useMemo, useState } from 'react';
import { initWasm, computeLayout } from '../wasm/layout/index.js';
import BlockPalette from './BlockPalette.jsx';
import Canvas from './Canvas.jsx';
import HtmlPreview from './HtmlPreview.jsx';

export default function Builder() {
  const [title, setTitle] = useState('Mi Landing');
  const [blocks, setBlocks] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetch('/api/pages').then(r => r.json()).then(setPages);
    initWasm();
  }, []);

  const addBlock = (type) => {
    const defaults = {
      hero: { heading: 'Título', subheading: 'Subtítulo', cta: 'Acción' },
      text: { content: 'Texto' },
      button: { label: 'Comprar', href: '#' }
    };
    setBlocks(prev => [...prev, { type, props: defaults[type] || {} }]);
  };

  const updateBlock = (i, next) => {
    setBlocks(prev => prev.map((b, idx) => idx === i ? next : b));
  };

  const removeBlock = (i) => {
    setBlocks(prev => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    const res = await fetch('/api/pages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, blocks })
    });
    const created = await res.json();
    setPages(prev => [created, ...prev]);
  };

  const html = useMemo(() => {
    const layout = computeLayout(blocks, 1024);
    const containerH = layout.length ? layout[layout.length - 1].y + layout[layout.length - 1].h : 0;
    const renderBlock = (b) => {
      if (b.type === 'hero') {
        return `<section style="padding:48px;text-align:center"><h1>${b.props.heading}</h1><p>${b.props.subheading}</p><a href="${b.props.ctaHref||'#'}"><button>${b.props.cta}</button></a></section>`;
      }
      if (b.type === 'text') {
        return `<section style="padding:24px"><p>${b.props.content}</p></section>`;
      }
      if (b.type === 'button') {
        return `<div style="padding:24px;text-align:center"><a href="${b.props.href}"><button>${b.props.label}</button></a></div>`;
      }
      return '';
    };
    const positioned = blocks.map((b, i) => {
      const pos = layout[i];
      const inner = renderBlock(b);
      const style = `position:absolute;left:${pos?.x||0}px;top:${pos?.y||0}px;width:${pos?.w||1024}px;height:${pos?.h||0}px;`;
      return `<div style="${style}">${inner}</div>`;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body><div style="position:relative;width:1024px;height:${containerH}px;margin:0 auto">${positioned}</div></body></html>`;
  }, [title, blocks]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 16 }}>
      <div>
        <div style={{ marginBottom: 12 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
        </div>
        <BlockPalette onAdd={addBlock} />
        <div style={{ marginTop: 12 }}>
          <button onClick={save}>Guardar</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div>Guardadas</div>
          <ul>
            {pages.map(p => (<li key={p._id}>{p.title}</li>))}
          </ul>
        </div>
      </div>
      <Canvas blocks={blocks} onUpdate={updateBlock} onRemove={removeBlock} />
      <HtmlPreview html={html} />
    </div>
  );
}
