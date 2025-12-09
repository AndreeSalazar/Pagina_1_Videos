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
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);
  useEffect(() => {
    try { const a = localStorage.getItem('alias'); if (a) setAlias(a); } catch {}
  }, []);
  const submit = () => {
    const next = q.trim();
    if (pathname?.startsWith('/hub')) router.push(`/hub${next ? `?q=${encodeURIComponent(next)}` : ''}`);
    else router.push(`/${next ? `?q=${encodeURIComponent(next)}` : ''}`);
  };
  const changeAlias = () => {
    const a = prompt('Tu alias para el chat', alias || '');
    if (a === null) return;
    const v = a.trim();
    setAlias(v);
    try { localStorage.setItem('alias', v); } catch {}
  };
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-dot" />
        <span>NexTube</span>
      </div>
      <nav className="nav-links">
        <Link href="/">Inicio</Link>
        <Link href="/hub">Hub</Link>
      </nav>
      <div className="search">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar videos" aria-label="Buscar videos" />
        <button onClick={submit}>Buscar</button>
      </div>
      <div className="profile">
        <span className="alias">{alias || 'Tú'}</span>
        <button onClick={changeAlias}>Perfil</button>
      </div>
    </header>
  );
}
