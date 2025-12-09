import React, { useState } from 'react';

export default function AddProjectForm({ onAdd }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [url, setUrl] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const payload = { name, description, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], url };
    onAdd(payload);
    setName('');
    setDescription('');
    setTags('');
    setUrl('');
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
      <input placeholder="Tags separadas por coma" value={tags} onChange={e => setTags(e.target.value)} />
      <input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
      <button type="submit">Agregar</button>
    </form>
  );
}
