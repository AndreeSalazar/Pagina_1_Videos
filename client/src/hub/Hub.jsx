import React, { useEffect, useMemo, useRef, useState } from 'react';

function ChannelBar({ channels, selected, onSelect, onAdd }) {
  return (
    <div style={{ width: 80, background: '#111', color: '#eee', padding: 8 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        {channels.map(c => (
          <button key={c._id} onClick={() => onSelect(c._id)} style={{ width: 56, height: 56, borderRadius: 28, border: selected===c._id?'2px solid #09f':'none' }}>{c.name[0]}</button>
        ))}
        <button onClick={onAdd} style={{ width: 56, height: 56, borderRadius: 28 }}>+</button>
      </div>
    </div>
  );
}

function VideoCard({ v, onPlay, onDelete }) {
  return (
    <div style={{ border: '1px solid #222', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16/9', background: `url(${v.thumbnail}) center/cover` }} />
      <div style={{ padding: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ cursor: 'pointer' }} onClick={() => onPlay(v._id)}>{v.title}</strong>
          <button onClick={() => onDelete(v._id)}>Eliminar</button>
        </div>
        <div>{v.views} vistas · {v.likes} me gusta</div>
      </div>
    </div>
  );
}

function VideoGrid({ items, onPlay, onDelete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {items.map((v, i) => (<VideoCard key={v._id || i} v={v} onPlay={onPlay} onDelete={onDelete} />))}
    </div>
  );
}

function Watch({ video, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 8 }}>Volver</button>
      <div style={{ aspectRatio: '16/9', background: '#000' }}>
        {video && <video key={video._id} src={video.src} controls style={{ width: '100%', height: '100%' }} />}
      </div>
      <h2>{video?.title}</h2>
      <p>{video?.description}</p>
    </div>
  );
}

function Chat({ channelId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    let t;
    const load = () => {
      const url = channelId ? `/api/hub/messages?channelId=${channelId}` : '/api/hub/messages';
      fetch(url).then(r => r.json()).then(setMessages);
    };
    load();
    t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [channelId]);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  const send = async () => {
    if (!text.trim()) return;
    await fetch('/api/hub/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId, user: 'Tú', content: text }) });
    setText('');
    const url = channelId ? `/api/hub/messages?channelId=${channelId}` : '/api/hub/messages';
    fetch(url).then(r => r.json()).then(setMessages);
  };
  return (
    <div style={{ width: 320, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
      <div ref={ref} style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {messages.map(m => (
          <div key={m._id} style={{ marginBottom: 8 }}>
            <strong>{m.user}</strong>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 8, display: 'flex', gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Mensaje" style={{ flex: 1 }} />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  );
}

export default function Hub() {
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [view, setView] = useState('feed');
  const [current, setCurrent] = useState(null);
  const [q, setQ] = useState('');
  const [newVideo, setNewVideo] = useState({ title: '', src: '', thumbnail: '' });

  useEffect(() => {
    fetch('/api/hub/channels').then(r => r.json()).then(setChannels);
    fetch('/api/hub/videos').then(r => r.json()).then(setVideos);
  }, []);

  const addChannel = async () => {
    const name = prompt('Nombre del canal');
    if (!name) return;
    const res = await fetch('/api/hub/channels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const created = await res.json();
    setChannels(prev => [...prev, created]);
  };

  const addVideo = async () => {
    if (!newVideo.title || !newVideo.src) return;
    const res = await fetch('/api/hub/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newVideo, channelId: selectedChannel }) });
    const created = await res.json();
    setVideos(prev => [created, ...prev]);
    setNewVideo({ title: '', src: '', thumbnail: '' });
  };

  const play = async (id) => {
    const data = await fetch(`/api/hub/videos/${id}`).then(r => r.json());
    setCurrent(data);
    setView('watch');
  };

  const removeVideo = async (id) => {
    const res = await fetch(`/api/hub/videos/${id}`, { method: 'DELETE' });
    if (res.status === 204) setVideos(prev => prev.filter(v => v._id !== id));
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = videos;
    if (selectedChannel) list = list.filter(v => v.channelId === selectedChannel);
    if (text) list = list.filter(v => v.title.toLowerCase().includes(text) || (v.description||'').toLowerCase().includes(text));
    return list;
  }, [videos, selectedChannel, q]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 320px', height: 'calc(100vh - 48px)' }}>
      <ChannelBar channels={channels} selected={selectedChannel} onSelect={setSelectedChannel} onAdd={addChannel} />
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar" style={{ flex: 1 }} />
          {view === 'watch' ? <button onClick={() => setView('feed')}>Ir al feed</button> : null}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 120px', gap: 8, marginBottom: 12 }}>
          <input value={newVideo.title} onChange={e => setNewVideo(v => ({ ...v, title: e.target.value }))} placeholder="Título" />
          <input value={newVideo.src} onChange={e => setNewVideo(v => ({ ...v, src: e.target.value }))} placeholder="URL del video (mp4)" />
          <input value={newVideo.thumbnail} onChange={e => setNewVideo(v => ({ ...v, thumbnail: e.target.value }))} placeholder="URL thumbnail" />
          <button onClick={addVideo}>Agregar video</button>
        </div>
        {view === 'feed' ? (
          <VideoGrid items={filtered} onPlay={play} onDelete={removeVideo} />
        ) : (
          <Watch video={current} onBack={() => setView('feed')} />
        )}
      </div>
      <Chat channelId={selectedChannel} />
    </div>
  );
}
