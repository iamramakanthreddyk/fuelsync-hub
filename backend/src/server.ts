import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config/environment';

// Import routes
import authRoutes from './routes/auth.routes';
import stationRoutes from './routes/station.routes';
import pumpRoutes from './routes/pump.routes';
import nozzleRoutes from './routes/nozzle.routes';
import saleRoutes from './routes/sale.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/pumps', pumpRoutes);
app.use('/api/nozzles', nozzleRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reconciliations', reconciliationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;