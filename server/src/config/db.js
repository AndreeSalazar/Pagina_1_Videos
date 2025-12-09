import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  await mongoose.connect(uri);
};

export const isDBConnected = () => mongoose.connection.readyState === 1;
