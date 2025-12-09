import { Router } from 'express';
import { randomUUID } from 'crypto';
import Page from '../models/Page.js';
import { isDBConnected } from '../config/db.js';

const router = Router();

let inMemory = [
  { _id: 'p1', title: 'Landing Demo', blocks: [
    { type: 'hero', props: { heading: 'Bienvenido', subheading: 'Construye rápido', cta: 'Empezar' } },
    { type: 'text', props: { content: 'Generador de landing con MERN + WASM' } }
  ] }
];

router.get('/', async (req, res) => {
  if (!isDBConnected()) return res.json(inMemory);
  const pages = await Page.find().lean();
  res.json(pages);
});

router.post('/', async (req, res) => {
  const { title, blocks } = req.body;
  if (!title) return res.status(400).json({ error: 'title requerido' });
  if (!isDBConnected()) {
    const p = { _id: randomUUID(), title, blocks: Array.isArray(blocks) ? blocks : [] };
    inMemory.push(p);
    return res.status(201).json(p);
  }
  const page = await Page.create({ title, blocks });
  res.status(201).json(page);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const p = inMemory.find(x => x._id === id);
    if (!p) return res.status(404).json({ error: 'no encontrada' });
    return res.json(p);
  }
  const page = await Page.findById(id).lean();
  if (!page) return res.status(404).json({ error: 'no encontrada' });
  res.json(page);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, blocks } = req.body;
  if (!isDBConnected()) {
    const idx = inMemory.findIndex(x => x._id === id);
    if (idx === -1) return res.status(404).json({ error: 'no encontrada' });
    const next = { ...inMemory[idx], title, blocks: Array.isArray(blocks) ? blocks : [] };
    inMemory[idx] = next;
    return res.json(next);
  }
  const updated = await Page.findByIdAndUpdate(id, { title, blocks }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: 'no encontrada' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const before = inMemory.length;
    inMemory = inMemory.filter(x => x._id !== id);
    if (inMemory.length === before) return res.status(404).json({ error: 'no encontrada' });
    return res.status(204).send();
  }
  const deleted = await Page.findByIdAndDelete(id).lean();
  if (!deleted) return res.status(404).json({ error: 'no encontrada' });
  res.status(204).send();
});

export default router;
