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
    <div className="video-card">
      <div className="thumb" style={{ backgroundImage: `url(${v.thumbnail})` }}>
        <span className="card-meta" style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 6 }}>{v.duration || '0:00'}</span>
      </div>
      <div className="card-body">
        <div className="card-header">
          <strong style={{ cursor: 'pointer' }} onClick={() => onPlay(v._id)}>{v.title}</strong>
          <button className="card-delete" onClick={() => onDelete(v._id)}>Eliminar</button>
        </div>
        <div className="card-meta">{formatNum(v.views)} vistas · {timeAgo(v.ts)} · {formatNum(v.likes)} me gusta</div>
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
  const [alias, setAlias] = useState('Tú');
  const [channel, setChannel] = useState<any>(null);
  const [isBottom, setIsBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [reacts, setReacts] = useState<Record<string, boolean>>({});
  const prevLen = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { try { setAlias(localStorage.getItem('alias') || 'Tú'); } catch {} }, []);
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
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    if (!channelId) { setChannel(null); return; }
    fetch(`${base}/api/hub/channels`).then(r => r.json()).then((list) => {
      const c = Array.isArray(list) ? list.find((x: any) => x._id === channelId) : null;
      setChannel(c || null);
    }).catch(() => setChannel(null));
  }, [channelId]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const at = el.scrollTop >= el.scrollHeight - el.clientHeight - 4;
      setIsBottom(at);
      if (at) setNewCount(0);
    };
    el.addEventListener('scroll', onScroll as any);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll as any);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (messages.length > prevLen.current && !isBottom) setNewCount(n => n + (messages.length - prevLen.current));
    prevLen.current = messages.length;
    if (isBottom) el.scrollTop = el.scrollHeight;
  }, [messages, isBottom]);
  const send = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    if (!text.trim()) return;
    await fetch(`${base}/api/hub/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId, user: alias, content: text }) });
    setText('');
    const url = channelId ? `${base}/api/hub/messages?channelId=${channelId}` : `${base}/api/hub/messages`;
    fetch(url).then(r => r.json()).then(setMessages);
  };
  const linkify = (s: string) => {
    const parts = s.split(/(https?:\/\/\S+)/g);
    return parts.map((p, i) => {
      if (/^https?:\/\/\S+/.test(p)) return <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a>;
      return <span key={i}>{p}</span>;
    });
  };
  const toggleReact = (id: string) => { setReacts(r => ({ ...r, [id]: !r[id] })); };
  return (
    <div className="hub-chat">
      <div className="chat-header">
        <div className="chat-title">{channel?.name || 'General'}</div>
        <div className="chat-sub">Bienvenido al canal {channel?.name || 'General'}</div>
      </div>
      <div ref={ref} className="list">
        {messages.map((m: any) => {
          const t = new Date(m.ts || Date.now());
          const hh = String(t.getHours()).padStart(2,'0');
          const mm = String(t.getMinutes()).padStart(2,'0');
          const mine = String(m.user||'') === alias;
          const sys = String(m.user||'').toLowerCase() === 'system';
          const rid = m._id || `${hh}:${mm}-${m.user}-${m.content}`;
          const reacted = !!reacts[rid];
          return (
            <div key={rid} className={`bubble ${mine?'me':''} ${sys?'system':''}`}>
              <div className="bubble-row">
                <div className="bubble-avatar">{String(m.user||'')[0] || '?'}</div>
                <div className="bubble-col">
                  <div className="bubble-header"><strong className="bubble-user">{m.user}</strong><span className="bubble-time">{hh}:{mm}</span></div>
                  <div className="bubble-content">{linkify(m.content || '')}</div>
                  {!sys ? (
                    <div className="bubble-actions">
                      <button className={`react-btn ${reacted?'on':''}`} onClick={() => toggleReact(rid)}>👍 {reacted?1:0}</button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="input">
        <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Mensaje (Enter envía, Shift+Enter salto)" />
        <button onClick={send}>Enviar</button>
      </div>
      {!isBottom ? (
        <button className="scroll-down" onClick={() => { if (ref.current) { ref.current.scrollTop = ref.current.scrollHeight; setNewCount(0); } }}>{newCount ? `${newCount} nuevos` : 'Bajar'}</button>
      ) : null}
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
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [sort, setSort] = useState<'relevantes'|'recientes'>('relevantes');
  const qTimer = useRef<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [addingChannel, setAddingChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  useEffect(() => {
    try {
      const savedC = localStorage.getItem('hub-selected-channel');
      const savedSort = localStorage.getItem('hub-sort');
      if (!params.get('c') && savedC) setSelectedChannel(savedC);
      if (!params.get('sort') && (savedSort === 'recientes' || savedSort === 'relevantes')) setSort(savedSort as any);
    } catch {}
  }, []);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/hub/channels`).then(r => r.json()).then(setChannels);
    fetch(`${base}/api/hub/videos`).then(r => r.json()).then(d => { setVideos(d); setLoadingVideos(false); });
    const initialQ = params.get('q') || '';
    if (initialQ) setQ(initialQ);
    const c = params.get('c');
    if (c) setSelectedChannel(c);
    const s = params.get('sort');
    if (s === 'recientes' || s === 'relevantes') setSort(s as any);
  }, [params]);

  useEffect(() => {
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      const text = q.trim();
      if (text) sp.set('q', text); else sp.delete('q');
      router.replace(`/hub?${sp.toString()}`);
    }, 250);
    return () => { if (qTimer.current) clearTimeout(qTimer.current); };
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'k' || e.key === '/') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1;
        const c = channels[idx];
        if (c) {
          setSelectedChannel(c._id);
          try { localStorage.setItem('hub-selected-channel', c._id); } catch {}
          const sp = new URLSearchParams(params.toString());
          sp.set('c', c._id);
          router.replace(`/hub?${sp.toString()}`);
        }
      }
      if (e.key === 'Escape') setQ('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [channels, params]);

  const addChannel = () => { setAddingChannel(true); setChannelName(''); };
  const confirmAddChannel = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const name = channelName.trim();
    if (!name) { setAddingChannel(false); return; }
    const res = await fetch(`${base}/api/hub/channels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const created = await res.json();
    setChannels(prev => [...prev, created]);
    setAddingChannel(false); setChannelName('');
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
    if (sort === 'recientes') list = [...list].sort((a: any, b: any) => (b.ts||0) - (a.ts||0));
    else list = [...list].sort((a: any, b: any) => (b.views + (b.likes||0)*10) - (a.views + (a.likes||0)*10));
    return list;
  }, [videos, selectedChannel, q, sort]);

  return (
    <div className="hub-container">
      <div className="hub-sidebar">
        <div style={{ display: 'grid', gap: 8 }}>
          {channels.map((c: any) => (
            <button
              key={c._id}
              onClick={() => {
                setSelectedChannel(c._id);
                try { localStorage.setItem('hub-selected-channel', c._id); } catch {}
                const sp = new URLSearchParams(params.toString());
                sp.set('c', c._id);
                router.replace(`/hub?${sp.toString()}`);
              }}
              className={`circle ${selectedChannel===c._id?'active':''}`}
            >{c.name[0]}</button>
          ))}
          <button onClick={addChannel} className="circle add">+</button>
        </div>
      </div>
      <div className="hub-content">
        <div className="hub-toolbar">
          <input ref={searchRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar" />
          {q ? <button onClick={() => setQ('')}>Limpiar</button> : null}
          <select value={sort} onChange={e => {
            const v = e.target.value as any;
            setSort(v);
            try { localStorage.setItem('hub-sort', v); } catch {}
            const sp = new URLSearchParams(params.toString());
            sp.set('sort', v);
            router.replace(`/hub?${sp.toString()}`);
          }}>
            <option value="relevantes">Relevantes</option>
            <option value="recientes">Recientes</option>
          </select>
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
            {loadingVideos ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div className="video-card" key={`s-${i}`}>
                  <div className="thumb skeleton-thumb" />
                  <div className="card-body">
                    <div className="card-header"><div className="skeleton-line" style={{ width: '60%' }} /><div className="skeleton-btn" /></div>
                    <div className="skeleton-line" style={{ width: '40%', marginTop: 6 }} />
                  </div>
                </div>
              ))
            ) : (
              filtered.map((v: any, i: number) => (
                <VideoCard key={v._id || i} v={v} onPlay={play} onDelete={removeVideo} />
              ))
            )}
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
    {addingChannel ? (
      <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 70 }}>
        <div style={{ maxWidth: 360, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
          <input autoFocus value={channelName} onChange={e => setChannelName(e.target.value)} placeholder="Nombre del canal" style={{ background: '#111', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: 8 }} />
          <button onClick={confirmAddChannel} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px' }}>Crear</button>
          <button onClick={() => { setAddingChannel(false); setChannelName(''); }} style={{ background: 'var(--bg-elev)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>Cancelar</button>
        </div>
      </div>
    ) : null}
  </div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(ts?: number) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff/60000);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m/60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h/24);
  return `hace ${d} días`;
}
