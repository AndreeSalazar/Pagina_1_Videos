import Link from "next/link";

export default async function PortfolioPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  let videos: any[] = [];
  try {
    const res = await fetch(`${base}/api/hub/videos`, { cache: "no-store" });
    videos = await res.json();
  } catch {}
  const recent = Array.isArray(videos) ? videos.slice(0, 6) : [];
  return (
    <main className="home" aria-label="Portfolio">
      <section className="home-hero">
        <div className="hero-left">
          <span className="eyebrow">Personal</span>
          <h1>Portfolio</h1>
          <p>Proyecto construido con React + Next.js 16, orientado a contenidos y streaming tipo YouTube + comunidades estilo Discord.</p>
          <div className="hero-actions">
            <Link href="/hub" className="btn-primary">Ver videos</Link>
            <Link href="/" className="btn-secondary">Principal</Link>
          </div>
          <div className="tags">
            <span className="tag">React 18</span>
            <span className="tag">Next.js 16</span>
            <span className="tag">TypeScript</span>
            <span className="tag">CSS Masks</span>
            <span className="tag">Turbopack</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <div className="hero-thumb" />
            <div className="hero-meta">
              <div className="hero-title">Experiencia</div>
              <div className="hero-sub">Frontend con React, integración Next.js (App Router), UI pulida con CSS y accesibilidad.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Ficha técnica</div>
        <div className="notes">
          <div className="note"><div className="note-title">Framework</div><div className="note-text">Next.js 16 (App Router, Turbopack)</div></div>
          <div className="note"><div className="note-title">UI</div><div className="note-text">React 18, componentes funcionales</div></div>
          <div className="note"><div className="note-title">Lenguaje</div><div className="note-text">TypeScript</div></div>
          <div className="note"><div className="note-title">Estilos</div><div className="note-text">CSS con variables, máscaras SVG, accesibilidad</div></div>
          <div className="note"><div className="note-title">Dev</div><div className="note-text">Lint con ESLint, comandos Bun</div></div>
          <div className="note"><div className="note-title">API</div><div className="note-text">Base configurable: NEXT_PUBLIC_API_BASE</div></div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Scripts</div>
        <pre style={{ background: "#111", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 10, padding: 10 }}>
{`bun run dev
bun run build
bun run start
bun run lint`}
        </pre>
      </section>

      <section className="home-section">
        <div className="section-title">Destacados</div>
        <div className="home-grid">
          <div className="home-card">
            <div className="home-thumb" />
            <div className="home-body">
              <div className="home-title">Sistema de iconos</div>
              <div className="home-meta">SVG + CSS Mask, color por currentColor, sin librerías.</div>
            </div>
          </div>
          <div className="home-card">
            <div className="home-thumb" />
            <div className="home-body">
              <div className="home-title">Chat en vivo</div>
              <div className="home-meta">Canales, scroll inteligente, reacciones y linkify.</div>
            </div>
          </div>
          <div className="home-card">
            <div className="home-thumb" />
            <div className="home-body">
              <div className="home-title">Feed de videos</div>
              <div className="home-meta">Listado con skeletons, orden por relevancia/recientes.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Next.js 16 Demos</div>
        <div className="home-grid">
          <div className="home-card">
            <div className="demo-thumb">
              <div className="badge">Server Actions</div>
              <div className="demo-code">
                <div className="code-line hl" />
                <div className="code-line" />
                <div className="code-line" />
              </div>
              <div className="demo-skeleton" />
            </div>
            <div className="home-body">
              <div className="home-title">Acciones de servidor</div>
              <div className="home-meta">Procesamiento y validación sin API extra.</div>
            </div>
          </div>
          <div className="home-card">
            <div className="demo-thumb">
              <div className="badge">App Router</div>
              <div className="demo-code">
                <div className="code-line" />
                <div className="code-line hl" />
                <div className="code-line" />
              </div>
              <div className="demo-progress"><div className="bar" /></div>
            </div>
            <div className="home-body">
              <div className="home-title">Transiciones y layouts</div>
              <div className="home-meta">Rutas anidadas, streaming y caching.</div>
            </div>
          </div>
          <div className="home-card">
            <div className="demo-thumb">
              <div className="badge">Turbopack</div>
              <div className="demo-progress"><div className="bar" /></div>
            </div>
            <div className="home-body">
              <div className="home-title">Dev ultra-rápido</div>
              <div className="home-meta">Compilación incremental y HMR veloz.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">Videos recientes</div>
        <div className="home-grid">
          {recent.length ? recent.map((v: any, i: number) => (
            <Link key={v._id || i} href={`/watch/${v._id}`} className="home-card">
              <div className="home-thumb" style={{ backgroundImage: `url(${v.thumbnail})` }} />
              <div className="home-body">
                <div className="home-title">{v.title}</div>
                <div className="home-meta">{v.duration || "0:00"}</div>
              </div>
            </Link>
          )) : (
            <div className="note">No hay videos aún</div>
          )}
        </div>
      </section>
    </main>
  );
}
