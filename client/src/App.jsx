import React, { useEffect, useState } from 'react';
import ProjectList from './components/ProjectList.jsx';
import AddProjectForm from './components/AddProjectForm.jsx';
import Builder from './builder/Builder.jsx';
import Hub from './hub/Hub.jsx';

export default function App() {
  const [health, setHealth] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('portfolio');

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth);
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  }, []);

  const addProject = async (p) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    const created = await res.json();
    setProjects(prev => [created, ...prev]);
  };

  const deleteProject = async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.status === 204) setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div style={{ maxWidth: 1024, margin: '0 auto', padding: 24 }}>
      <h1>MERN Portfolio</h1>
      <div>Backend: {health && health.ok ? 'OK' : '...'}</div>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button onClick={() => setTab('portfolio')}>Proyectos</button>
        <button onClick={() => setTab('builder')}>Landing Builder</button>
        <button onClick={() => setTab('hub')}>Hub (YouTube + Discord)</button>
      </div>
      {tab === 'portfolio' ? (
        <>
          <AddProjectForm onAdd={addProject} />
          <ProjectList items={projects} onDelete={deleteProject} />
        </>
      ) : tab === 'builder' ? (
        <Builder />
      ) : (
        <Hub />
      )}
    </div>
  );
}
