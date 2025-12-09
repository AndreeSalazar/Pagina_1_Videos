import express from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects.js';
import pagesRouter from './routes/pages.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/projects', projectsRouter);
app.use('/api/pages', pagesRouter);

export default app;
