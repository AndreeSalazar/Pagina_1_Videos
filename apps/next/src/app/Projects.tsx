"use client";
import { useEffect, useState } from "react";

export default function Projects() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    fetch(`${base}/api/projects`).then(r => r.json()).then(setItems).catch(err => setError(String(err)));
  }, []);
  if (error) return <div>Error: {error}</div>;
  return (
    <ul>
      {items.map((p: any) => (<li key={p._id}><strong>{p.name}</strong> – {p.description}</li>))}
    </ul>
  );
}
