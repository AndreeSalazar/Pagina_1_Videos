import express from 'express';
import cors from 'cors';
let helmetFn;
let compressionFn;
import { isDBConnected } from './config/db.js';
import projectsRouter from './routes/projects.js';
import pagesRouter from './routes/pages.js';
import hubRouter from './routes/hub.js';

const app = express();
try { const m = await import('helmet'); helmetFn = m.default || m; } catch {}
try { const m = await import('compression'); compressionFn = m.default || m; } catch {}
if (helmetFn) app.use(helmetFn());
if (compressionFn) app.use(compressionFn());
app.use(cors({ origin: ['http://localhost:5173','http://localhost:3000','http://localhost:3001','http://localhost:4200'], methods: ['GET','POST','PUT','DELETE'], credentials: false }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: isDBConnected() ? 'connected' : 'disconnected' });
});

app.use('/api/projects', projectsRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/hub', hubRouter);

export default app;
