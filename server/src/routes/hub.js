import { Router } from 'express';
import { randomUUID } from 'crypto';

let videos = [
  { _id: 'v1', title: 'Bienvenido', description: 'Intro al hub', src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail: 'https://picsum.photos/seed/intro/400/225', channelId: 'c1', views: 120, likes: 5 },
  { _id: 'v2', title: 'Demo MERN', description: 'Stack MERN', src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnail: 'https://picsum.photos/seed/mern/400/225', channelId: 'c2', views: 80, likes: 3 }
];
let channels = [
  { _id: 'c1', name: 'General' },
  { _id: 'c2', name: 'Dev' }
];
let messages = [
  { _id: 'm1', channelId: 'c1', user: 'System', content: 'Bienvenido al canal General', ts: Date.now() }
];

const router = Router();

router.get('/videos', (req, res) => { res.json(videos); });
router.get('/videos/:id', (req, res) => {
  const v = videos.find(x => x._id === req.params.id);
  if (!v) return res.status(404).json({ error: 'no encontrado' });
  res.json(v);
});
router.post('/videos/:id/view', (req, res) => {
  const v = videos.find(x => x._id === req.params.id);
  if (!v) return res.status(404).json({ error: 'no encontrado' });
  v.views = (v.views || 0) + 1;
  res.json({ ok: true, views: v.views });
});
router.post('/videos/:id/like', (req, res) => {
  const v = videos.find(x => x._id === req.params.id);
  if (!v) return res.status(404).json({ error: 'no encontrado' });
  v.likes = (v.likes || 0) + 1;
  res.json({ ok: true, likes: v.likes });
});
router.post('/videos', (req, res) => {
  const { title, description, src, thumbnail, channelId } = req.body;
  if (!title || !src) return res.status(400).json({ error: 'title y src requeridos' });
  const v = { _id: randomUUID(), title, description, src, thumbnail, channelId, views: 0, likes: 0 };
  videos.unshift(v);
  res.status(201).json(v);
});
router.delete('/videos/:id', (req, res) => {
  const before = videos.length;
  videos = videos.filter(x => x._id !== req.params.id);
  if (videos.length === before) return res.status(404).json({ error: 'no encontrado' });
  res.status(204).send();
});

router.get('/channels', (req, res) => { res.json(channels); });
router.post('/channels', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name requerido' });
  const c = { _id: randomUUID(), name };
  channels.push(c);
  res.status(201).json(c);
});
router.delete('/channels/:id', (req, res) => {
  const before = channels.length;
  channels = channels.filter(x => x._id !== req.params.id);
  if (channels.length === before) return res.status(404).json({ error: 'no encontrado' });
  messages = messages.filter(m => m.channelId !== req.params.id);
  videos = videos.filter(v => v.channelId !== req.params.id);
  res.status(204).send();
});

router.get('/messages', (req, res) => {
  const { channelId, limit = 50 } = req.query;
  const list = channelId ? messages.filter(m => m.channelId === channelId) : messages;
  res.json(list.slice(-Number(limit)));
});
router.post('/messages', (req, res) => {
  const { channelId, user, content } = req.body;
  if (!channelId || !content) return res.status(400).json({ error: 'channelId y content requeridos' });
  const msg = { _id: randomUUID(), channelId, user: user || 'Anon', content, ts: Date.now() };
  messages.push(msg);
  res.status(201).json(msg);
});

export default router;
