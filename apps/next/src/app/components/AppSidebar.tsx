"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showMoreSubs, setShowMoreSubs] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const handleMove = (e: any) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    e.currentTarget.style.setProperty('--x', x + '%');
    e.currentTarget.style.setProperty('--y', y + '%');
  };

  useEffect(() => {
    try { const s = localStorage.getItem('sidebar-open'); if (s) setOpen(s === '1'); } catch {}
    const handler = () => {
      setOpen((v) => {
        const next = !v;
        try { localStorage.setItem('sidebar-open', next ? '1' : '0'); } catch {}
        return next;
      });
    };
    window.addEventListener("toggle-sidebar", handler as any);
    return () => window.removeEventListener("toggle-sidebar", handler as any);
  }, []);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
    fetch(`${base}/api/hub/channels`).then((r) => r.json()).then(setChannels).catch(() => {
      setChannels([
        { _id: "c1", name: "General" },
        { _id: "c2", name: "Dev" },
        { _id: "c3", name: "Music" },
      ]);
    });
  }, []);

  const categories = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    channels.forEach((c) => {
      const n = String(c.name || '').toLowerCase();
      let cat = 'General';
      if (/(dev|desarrollo|code)/.test(n)) cat = 'Dev';
      else if (/(music|música|musica)/.test(n)) cat = 'Music';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(c);
    });
    return Object.entries(grouped).map(([name, list]) => ({ id: name.toLowerCase(), name, channels: list }));
  }, [channels]);

  useEffect(() => {
    if (!activeCat && categories.length) setActiveCat(categories[0].id);
  }, [categories, activeCat]);

  const currentCat = categories.find((x) => x.id === activeCat);
  const subsBase = currentCat ? currentCat.channels : channels;
  const subs = showMoreSubs ? subsBase : subsBase.slice(0, 6);
  const activeChannel = pathname?.startsWith('/hub') ? (params.get('c') || null) : null;
  const selectChannel = (id: string) => { router.push(`/hub?c=${id}`); };
  const addChannel = () => { setAdding(true); setNewName(''); };
  const confirmAdd = async () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    try {
      const res = await fetch(`${base}/api/hub/channels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const created = await res.json();
      setChannels(prev => [...prev, created]);
      setAdding(false); setNewName('');
      router.push(`/hub?c=${created._id}`);
    } catch { setAdding(false); }
  };

  return (
    <>
    <aside className={`app-sidebar ${open ? "open" : "closed"}`} aria-label="Navegación principal">
      <div className="rail">
        {categories.map((cat) => (
          <button key={cat.id} className={`rail-item ${activeCat===cat.id? 'active':''}`} title={cat.name} onClick={() => setActiveCat(cat.id)}>
            <span className="rail-dot" />
            <span className="rail-text">{cat.name[0]}</span>
          </button>
        ))}
        <button className="rail-item add" title="Agregar" onClick={addChannel}>
          <span className="rail-text">+</span>
        </button>
      </div>
      <div className="menu">
        <div className="menu-section">
          <div className="menu-title">Inicio</div>
          <Link className={`nav-item ${pathname === '/' ? 'active' : ''}`} href="/" onMouseMove={handleMove}>
            <span className="nav-ico home" />
            <span className="nav-text">Principal</span>
          </Link>
          <Link className={`nav-item ${pathname?.startsWith('/hub') ? 'active' : ''}`} href="/hub" onMouseMove={handleMove}>
            <span className="nav-ico shorts" />
            <span className="nav-text">Shorts</span>
          </Link>
        </div>

        <div className="menu-divider" />

        <div className="menu-section">
          <div className="menu-title">Suscripciones{currentCat ? ` · ${currentCat.name}` : ''}</div>
          {subs.map((c: any) => (
            <button key={c._id} className={`nav-item ${activeChannel===c._id ? 'active' : ''}`} aria-label={`Suscripción ${c.name}`} onMouseMove={handleMove} onClick={() => selectChannel(c._id)}>
              <span className="avatar" aria-hidden>{c.name[0]}</span>
              <span className="nav-text">{c.name}</span>
              <span className="live" />
            </button>
          ))}
          {subsBase.length > 6 && (
            <button className="nav-item more" onMouseMove={handleMove} onClick={() => setShowMoreSubs((v) => !v)}>
              <span className="nav-ico more" />
              <span className="nav-text">{showMoreSubs ? "Mostrar menos" : "Mostrar más"}</span>
            </button>
          )}
        </div>

        <div className="menu-divider" />

        <div className="menu-section">
          <div className="menu-title">Videos</div>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico history" /><span className="nav-text">Historial</span></button>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico playlist" /><span className="nav-text">Playlists</span></button>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico later" /><span className="nav-text">Ver más tarde</span></button>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico like" /><span className="nav-text">Videos que me gustan</span></button>
          <Link className={`nav-item ${pathname?.startsWith('/hub') ? 'active' : ''}`} href="/hub" onMouseMove={handleMove}>
            <span className="nav-ico videos" />
            <span className="nav-text">Tus videos</span>
          </Link>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico downloads" /><span className="nav-text">Descargas</span></button>
        </div>

        <div className="menu-divider" />

        <div className="menu-section">
          <div className="menu-title">Personal</div>
          <Link className={`nav-item ${pathname?.startsWith('/portfolio') ? 'active' : ''}`} href="/portfolio" onMouseMove={handleMove}>
            <span className="nav-ico portfolio" />
            <span className="nav-text">Portfolio</span>
          </Link>
        </div>

        <div className="menu-divider" />

        <div className="menu-section">
          <div className="menu-title">Explorar</div>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico explore" /><span className="nav-text">Tendencias</span></button>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico music" /><span className="nav-text">Música</span></button>
          <button className="nav-item" onMouseMove={handleMove}><span className="nav-ico gaming" /><span className="nav-text">Gaming</span></button>
        </div>
      </div>
    </aside>
    {adding ? (
      <div style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 70 }}>
        <div style={{ maxWidth: 360, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del canal" style={{ background: '#111', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: 8 }} />
          <button onClick={confirmAdd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 10px' }}>Crear</button>
          <button onClick={() => { setAdding(false); setNewName(''); }} style={{ background: 'var(--bg-elev)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>Cancelar</button>
        </div>
      </div>
    ) : null}
    </>
  );
}
