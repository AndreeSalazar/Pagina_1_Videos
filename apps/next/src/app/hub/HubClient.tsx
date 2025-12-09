"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

function ChannelBar({ channels, selected, onSelect, onAdd }: any) {
  return (
    <div style={{ width: 80, background: '#111', color: '#eee', padding: 8 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        {channels.map((c: any) => (
          <button key={c._id} onClick={() => onSelect(c._id)} style={{ width: 56, height: 56, borderRadius: 28, border: selected===c._id?'2px solid #09f':'none' }}>{c.name[0]}</button>
        ))}
        <button onClick={onAdd} style={{ width: 56, height: 56, borderRadius: 28 }}>+</button>
      </div>
    </div>
  );
}

function VideoCard({ v, onPlay, onDelete }: any) {
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

function VideoGrid({ items, onPlay, onDelete }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {items.map((v: any, i: number) => (<VideoCard key={v._id || i} v={v} onPlay={onPlay} onDelete={onDelete} />))}
    </div>
  );
}

function Watch({ video, onBack }: any) {
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

export function HubChat({ channelId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let t: any;
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const load = () => {
      const url = channelId ? `${base}/api/hub/messages?channelId=${channelId}` : `${base}/api/hub/messages`;
      fetch(url).then(r => r.json()).then(setMessages);
    };
    load();
    t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [channelId]);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);
  const send = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    if (!text.trim()) return;
    let alias = 'Tú';
    try { alias = localStorage.getItem('alias') || 'Tú'; } catch {}
    await fetch(`${base}/api/hub/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId, user: alias, content: text }) });
    setText('');
    const url = channelId ? `${base}/api/hub/messages?channelId=${channelId}` : `${base}/api/hub/messages`;
    fetch(url).then(r => r.json()).then(setMessages);
  };
  return (
    <div style={{ width: 320, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
      <div ref={ref} className="list">
        {messages.map((m: any) => {
          const t = new Date(m.ts || Date.now());
          const hh = String(t.getHours()).padStart(2,'0');
          const mm = String(t.getMinutes()).padStart(2,'0');
          return (
            <div key={m._id} className="msg">
              <div className="msg-header"><strong className="msg-user">{m.user}</strong><span className="msg-time">{hh}:{mm}</span></div>
              <div className="msg-content">{m.content}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: 8, display: 'flex', gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Mensaje" style={{ flex: 1 }} />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  );
}

export default function HubClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [channels, setChannels] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [view, setView] = useState<'feed'|'watch'>('feed');
  const [current, setCurrent] = useState<any>(null);
  const [q, setQ] = useState('');
  const [newVideo, setNewVideo] = useState({ title: '', src: '', thumbnail: '' });

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/hub/channels`).then(r => r.json()).then(setChannels);
    fetch(`${base}/api/hub/videos`).then(r => r.json()).then(setVideos);
    const initialQ = params.get('q') || '';
    if (initialQ) setQ(initialQ);
  }, [params]);

  const addChannel = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const name = prompt('Nombre del canal');
    if (!name) return;
    const res = await fetch(`${base}/api/hub/channels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const created = await res.json();
    setChannels(prev => [...prev, created]);
  };

  const addVideo = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    if (!newVideo.title || !newVideo.src) return;
    const res = await fetch(`${base}/api/hub/videos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newVideo, channelId: selectedChannel }) });
    const created = await res.json();
    setVideos(prev => [created, ...prev]);
    setNewVideo({ title: '', src: '', thumbnail: '' });
  };

  const play = async (id: string) => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    await fetch(`${base}/api/hub/videos/${id}/view`, { method: 'POST' });
    router.push(`/watch/${id}`);
  };

  const removeVideo = async (id: string) => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const res = await fetch(`${base}/api/hub/videos/${id}`, { method: 'DELETE' });
    if (res.status === 204) setVideos(prev => prev.filter(v => v._id !== id));
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = videos;
    if (selectedChannel) list = list.filter((v: any) => v.channelId === selectedChannel);
    if (text) list = list.filter((v: any) => v.title.toLowerCase().includes(text) || (v.description||'').toLowerCase().includes(text));
    return list;
  }, [videos, selectedChannel, q]);

  return (
    <div className="hub-container">
      <div className="hub-sidebar">
        <div style={{ display: 'grid', gap: 8 }}>
          {channels.map((c: any) => (
            <button key={c._id} onClick={() => setSelectedChannel(c._id)} className={`circle ${selectedChannel===c._id?'active':''}`}>{c.name[0]}</button>
          ))}
          <button onClick={addChannel} className="circle add">+</button>
        </div>
      </div>
      <div className="hub-content">
        <div className="hub-toolbar">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar" />
          {view === 'watch' ? <button onClick={() => setView('feed')}>Ir al feed</button> : null}
        </div>
        <div className="hub-form">
          <input value={newVideo.title} onChange={e => setNewVideo(v => ({ ...v, title: e.target.value }))} placeholder="Título" />
          <input value={newVideo.src} onChange={e => setNewVideo(v => ({ ...v, src: e.target.value }))} placeholder="URL del video (mp4)" />
          <input value={newVideo.thumbnail} onChange={e => setNewVideo(v => ({ ...v, thumbnail: e.target.value }))} placeholder="URL thumbnail" />
          <button onClick={addVideo}>Agregar video</button>
        </div>
        {view === 'feed' ? (
          <div className="video-grid">
            {filtered.map((v: any, i: number) => (
              <div className="video-card" key={v._id || i}>
                <div className="thumb" style={{ backgroundImage: `url(${v.thumbnail})` }} />
                <div className="card-body">
                  <div className="card-header">
                    <strong style={{ cursor: 'pointer' }} onClick={() => play(v._id)}>{v.title}</strong>
                    <button className="card-delete" onClick={() => removeVideo(v._id)}>Eliminar</button>
                  </div>
                  <div className="card-meta">{v.views} vistas · {v.likes} me gusta</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="watch">
            <button onClick={() => setView('feed')} style={{ marginBottom: 8 }}>Volver</button>
            <div className="watch-player">
              {current && <video key={current._id} src={current.src} controls style={{ width: '100%', height: '100%' }} />}
            </div>
            <h2>{current?.title}</h2>
            <p>{current?.description}</p>
          </div>
        )}
      </div>
      <div className="hub-chat">
        <HubChat channelId={selectedChannel} />
      </div>
    </div>
  );
}
