import Link from 'next/link';

export default function AppHeader() {
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
        <input placeholder="Buscar videos" aria-label="Buscar videos" />
        <button>Buscar</button>
      </div>
    </header>
  );
}

