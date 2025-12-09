import { Router } from 'express';
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
    const p = { _id: String(Date.now()), title, blocks: Array.isArray(blocks) ? blocks : [] };
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

export default router;
