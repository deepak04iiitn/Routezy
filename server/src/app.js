import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tripzo-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
