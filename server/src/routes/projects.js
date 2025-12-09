import { Router } from 'express';
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

router.post('/', async (req, res) => {
  const { name, description, tags, url } = req.body;
  if (!name) return res.status(400).json({ error: 'name requerido' });
  if (!isDBConnected()) {
    const p = { _id: String(Date.now()), name, description, tags, url };
    inMemory.push(p);
    return res.status(201).json(p);
  }
  const project = await Project.create({ name, description, tags, url });
  res.status(201).json(project);
});

export default router;
