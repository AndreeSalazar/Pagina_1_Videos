import Projects from './Projects';

export default function Page() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1>Next.js Hub</h1>
      <div>Proyectos desde API (cliente):</div>
      <Projects />
    </div>
  );
}
