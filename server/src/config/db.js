import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri);
  } catch {}
};

export const isDBConnected = () => mongoose.connection.readyState === 1;
