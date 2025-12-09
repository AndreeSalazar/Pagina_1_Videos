import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import app from './app.js';

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
  }
  try {
    const server = app.listen(port, () => {
      console.log(`server listening on ${port}`);
    });
    process.on('unhandledRejection', (err) => {
      console.error('unhandledRejection', err);
      server.close(() => process.exit(1));
    });
    process.on('uncaughtException', (err) => {
      console.error('uncaughtException', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('server start error', err);
  }
};

start();
