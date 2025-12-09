import { Router } from 'express';
import { randomUUID } from 'crypto';
import Project from '../models/Project.js';
import { isDBConnected } from '../config/db.js';

const router = Router();

let inMemory = [
  { _id: '1', name: 'Portfolio', description: 'Sitio personal', tags: ['react', 'vite'], url: 'https://example.com' }
];

router.get('/', async (req, res) => {
  if (!isDBConnected()) return res.json(inMemory);
  const projects = await Project.find().lean();
  res.json(projects);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const p = inMemory.find(x => x._id === id);
    if (!p) return res.status(404).json({ error: 'no encontrado' });
    return res.json(p);
  }
  const project = await Project.findById(id).lean();
  if (!project) return res.status(404).json({ error: 'no encontrado' });
  res.json(project);
});

router.post('/', async (req, res) => {
  const { name, description, tags, url } = req.body;
  if (!name) return res.status(400).json({ error: 'name requerido' });
  if (!isDBConnected()) {
    const p = { _id: randomUUID(), name, description, tags, url };
    inMemory.push(p);
    return res.status(201).json(p);
  }
  const project = await Project.create({ name, description, tags, url });
  res.status(201).json(project);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, tags, url } = req.body;
  if (!isDBConnected()) {
    const idx = inMemory.findIndex(x => x._id === id);
    if (idx === -1) return res.status(404).json({ error: 'no encontrado' });
    const next = { ...inMemory[idx], name, description, tags, url };
    inMemory[idx] = next;
    return res.json(next);
  }
  const updated = await Project.findByIdAndUpdate(id, { name, description, tags, url }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: 'no encontrado' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const before = inMemory.length;
    inMemory = inMemory.filter(x => x._id !== id);
    if (inMemory.length === before) return res.status(404).json({ error: 'no encontrado' });
    return res.status(204).send();
  }
  const deleted = await Project.findByIdAndDelete(id).lean();
  if (!deleted) return res.status(404).json({ error: 'no encontrado' });
  res.status(204).send();
});

export default router;
