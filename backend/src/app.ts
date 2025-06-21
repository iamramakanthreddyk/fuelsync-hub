import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { apiLimiter } from './middlewares/rateLimit';
import cookieParser from 'cookie-parser';
import { csrfProtection } from './middlewares/csrf';
import routes from './routes';

const app = express();

// Security middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Serve admin login test page
app.get('/admin-test', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-login-test.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;