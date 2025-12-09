"use client";
import { useEffect, useState } from 'react';
import { HubChat } from '../../hub/HubClient';
import { useRouter } from 'next/navigation';

export default function WatchClient({ id }: { id: string }) {
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'chat'|'sugeridos'>('chat');
  const [suggested, setSuggested] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/hub/videos/${id}`).then(r => r.json()).then(v => { setVideo(v); setLoading(false); }).catch(err => { setError(String(err)); setLoading(false); });
    fetch(`${base}/api/hub/channels`).then(r => r.json()).then(setChannels).catch(() => {});
  }, [id]);
  useEffect(() => {
    const run = async () => {
      if (!video?._id) return;
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      try { await fetch(`${base}/api/hub/videos/${video._id}/view`, { method: 'POST' }); } catch {}
      try {
        const all = await fetch(`${base}/api/hub/videos`).then(r => r.json());
        setSuggested(all.filter((x: any) => x._id !== video._id).slice(0, 8));
      } catch {}
    };
    run();
  }, [video]);
  const like = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    try {
      const res = await fetch(`${base}/api/hub/videos/${id}/like`, { method: 'POST' });
      const data = await res.json();
      setVideo((prev: any) => ({ ...prev, likes: data.likes }));
    } catch {}
  };
  if (loading) return <div>Cargando…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!video) return <div>No encontrado</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
      <div>
        <div className="watch-player">
          <video key={video._id} src={video.src} controls style={{ width: '100%', height: '100%' }} />
        </div>
        <h2 style={{ margin: '12px 0 4px' }}>{video.title}</h2>
        <div className="card-meta">{formatNum(video.views)} vistas · {formatNum(video.likes)} me gusta · {timeAgo(video.ts)}</div>
        <p style={{ marginTop: 8 }}>{video.description}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="card-delete" onClick={like}>Me gusta</button>
          <button className="card-delete" onClick={() => alert('Suscripción simulada')}>Suscribirse</button>
        </div>
      </div>
      <div className="hub-chat">
        <div style={{ display: 'flex', gap: 8, padding: 8, borderBottom: '1px solid var(--border)' }}>
          <button className="card-delete" onClick={() => setTab('chat')} style={{ background: tab==='chat'? 'var(--accent)':'transparent', color: tab==='chat'?'#fff':'var(--text)' }}>Chat</button>
          <button className="card-delete" onClick={() => setTab('sugeridos')} style={{ background: tab==='sugeridos'? 'var(--accent)':'transparent', color: tab==='sugeridos'?'#fff':'var(--text)' }}>Sugeridos</button>
        </div>
        {tab === 'chat' ? (
          <HubChat channelId={video.channelId} />
        ) : (
          <div className="list">
            {suggested.map((s: any) => (
              <div key={s._id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, padding: 8, borderBottom: '1px solid var(--border)' }}>
                <div className="thumb" style={{ backgroundImage: `url(${s.thumbnail})` }} />
                <div>
                  <div style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push(`/watch/${s._id}`)}>{s.title}</div>
                  <div className="card-meta">{formatNum(s.views)} vistas · {timeAgo(s.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
