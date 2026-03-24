import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectToDatabase } from './config/database.js';
import { getUploadsStaticDir } from './utils/uploadPaths.js';
import { renderAccountDeletionPage } from './utils/accountDeletionPage.js';
import {
  burstRateLimiter,
  globalRateLimiter,
  securityHeadersMiddleware,
} from './middleware/securityMiddleware.js';

const app = express();

app.set('trust proxy', 1);
app.use(securityHeadersMiddleware);
app.use(cors());
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '200kb' }));
app.use(globalRateLimiter);
app.use(burstRateLimiter);
app.use('/uploads', express.static(getUploadsStaticDir()));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'routezy-server' });
});

app.get('/account-deletion', (_req, res) => {
  res
    .type('html')
    .send(
      renderAccountDeletionPage({
        appName: process.env.PUBLIC_APP_NAME || 'Routezy',
        supportEmail: process.env.PUBLIC_SUPPORT_EMAIL || 'support@example.com',
        androidPath: 'Account > Delete Account',
        retentionNote:
          process.env.ACCOUNT_DELETION_RETENTION_NOTE ||
          'Some records may be retained when required for legal, fraud-prevention, or security reasons.',
      })
    );
});

app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
