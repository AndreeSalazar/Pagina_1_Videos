"use client";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [alias, setAlias] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<'oscuro'|'claro'>('oscuro');
  const [editingAlias, setEditingAlias] = useState(false);
  const [aliasDraft, setAliasDraft] = useState('');
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);
  useEffect(() => {
    try { const a = localStorage.getItem('alias'); if (a) setAlias(a); } catch {}
  }, []);
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme');
      if (t === 'claro' || t === 'oscuro') setTheme(t as any);
    } catch {}
  }, []);
  useEffect(() => {
    const isLight = theme === 'claro';
    try { document.body.classList.toggle('theme-light', isLight); } catch {}
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = h > 0 ? Math.min(100, Math.max(0, (y / h) * 100)) : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === '/') && !e.ctrlKey && !e.metaKey) {
        const el = document.querySelector('.search input') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); }
      }
      if ((e.key === 'b' || e.key === 's') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleSidebar(); }
      if (e.key === 'h') { e.preventDefault(); router.push('/'); }
      if (e.key === 'u') { e.preventDefault(); router.push('/hub'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);
  const submit = () => {
    const next = q.trim();
    if (pathname?.startsWith('/hub')) router.push(`/hub${next ? `?q=${encodeURIComponent(next)}` : ''}`);
    else router.push(`/${next ? `?q=${encodeURIComponent(next)}` : ''}`);
  };
  const clear = () => { setQ(''); };
  const toggleSidebar = () => {
    try { window.dispatchEvent(new CustomEvent('toggle-sidebar')); } catch {}
    setMenuOpen(v => !v);
  };
  const changeAlias = () => { setEditingAlias(true); setAliasDraft(alias); };
  const saveAlias = () => {
    const v = aliasDraft.trim();
    setAlias(v);
    setEditingAlias(false);
    try { localStorage.setItem('alias', v); } catch {}
  };
  const toggleTheme = () => { setTheme(t => (t === 'oscuro' ? 'claro' : 'oscuro')); };
  return (
    <header className="app-header">
      <button className={`menu-btn ${menuOpen ? 'open' : ''}`} aria-label="Abrir menú" aria-expanded={menuOpen} onClick={toggleSidebar}>
        <span className="menu-bar" />
        <span className="menu-bar" />
        <span className="menu-bar" />
      </button>
      <div className="brand">
        <span className="brand-dot" />
        <span className="brand-ring" />
        <span className="brand-text">NexTube</span>
      </div>
      <nav className="nav-links">
        <Link className={pathname === '/' ? 'active' : undefined} href="/">Inicio</Link>
        <Link className={pathname?.startsWith('/hub') ? 'active' : undefined} href="/hub">Hub</Link>
      </nav>
      <div className="search">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder="Buscar videos" aria-label="Buscar videos" />
        {q ? (<button className="search-clear" aria-label="Limpiar" onClick={clear}>×</button>) : null}
        <button onClick={submit}>Buscar</button>
      </div>
      <div className="profile">
        <span className="alias">{alias || 'Tú'}</span>
        <button onClick={changeAlias}>Perfil</button>
        {editingAlias ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={aliasDraft} onChange={e => setAliasDraft(e.target.value)} placeholder="Alias" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '6px 8px' }} />
            <button onClick={saveAlias}>Guardar</button>
            <button onClick={() => setEditingAlias(false)}>Cancelar</button>
          </div>
        ) : null}
        <button onClick={toggleTheme}>{theme === 'oscuro' ? 'Tema claro' : 'Tema oscuro'}</button>
      </div>
      <div className="progress" style={{ width: `${progress}%` }} />
    </header>
  );
}
