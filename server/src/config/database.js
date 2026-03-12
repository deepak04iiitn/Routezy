import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri);

  console.log('MongoDB connected');
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

