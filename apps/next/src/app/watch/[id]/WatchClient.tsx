"use client";
import { useEffect, useState } from 'react';
import { HubChat } from '../../hub/HubClient';

export default function WatchClient({ id }: { id: string }) {
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/hub/videos/${id}`).then(r => r.json()).then(v => { setVideo(v); setLoading(false); }).catch(err => { setError(String(err)); setLoading(false); });
  }, [id]);
  useEffect(() => {
    const run = async () => {
      if (!video?._id) return;
      const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      try { await fetch(`${base}/api/hub/videos/${video._id}/view`, { method: 'POST' }); } catch {}
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
        <div className="card-meta">{video.views} vistas · {video.likes} me gusta</div>
        <p style={{ marginTop: 8 }}>{video.description}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="card-delete" onClick={like}>Me gusta</button>
        </div>
      </div>
      <div className="hub-chat">
        <HubChat channelId={video.channelId} />
      </div>
    </div>
  );
}
