"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeContent() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
    fetch(`${base}/api/hub/videos`).then(r => r.json()).then(d => { setVideos(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const play = (id: string) => { router.push(`/watch/${id}`); };

  return (
    <div className="home">
      <section className="home-hero">
        <div className="hero-left">
          <div className="eyebrow">Novedades</div>
          <h1>Explora contenido y conversa en tiempo real</h1>
          <p>Feed estilo YouTube con chat tipo Discord, todo en un diseño claro y moderno.</p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/hub">Ir al Hub</Link>
            <Link className="btn-secondary" href="/">Personalizar</Link>
          </div>
          <div className="tags">
            <span className="tag">Relevantes</span>
            <span className="tag">Recientes</span>
            <span className="tag">Suscripciones</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <div className="hero-thumb" />
            <div className="hero-meta">
              <div className="hero-title">Tu espacio multimedia</div>
              <div className="hero-sub">Navega, busca y comparte</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Sugeridos para ti</div>
        <div className="home-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`ph-${i}`} className="home-card skeleton">
                <div className="home-thumb skeleton-thumb" />
                <div className="home-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" style={{ width: '60%' }} />
                </div>
              </div>
            ))
          ) : (
            videos.map((v) => (
              <div key={v._id} className="home-card" onClick={() => play(v._id)}>
                <div className="home-thumb" style={{ backgroundImage: `url(${v.thumbnail})` }} />
                <div className="home-body">
                  <div className="home-title">{v.title}</div>
                  <div className="home-meta">{formatNum(v.views)} vistas · {timeAgo(v.ts)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Notas rápidas</div>
        <div className="notes">
          <div className="note">
            <div className="note-title">Cómo usar el Hub</div>
            <div className="note-text">Selecciona un canal, filtra por texto y abre videos con un clic.</div>
          </div>
          <div className="note">
            <div className="note-title">Chat en tiempo real</div>
            <div className="note-text">Define tu alias en el perfil y envía mensajes con Enter.</div>
          </div>
          <div className="note">
            <div className="note-title">Personalización</div>
            <div className="note-text">Activa el panel lateral y organiza suscripciones y secciones.</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(ts?: number) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const m = Math.floor(diff/60000);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m/60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h/24);
  return `hace ${d} días`;
}

