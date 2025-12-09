import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch {}
  app.listen(port, () => {});
};

start();
