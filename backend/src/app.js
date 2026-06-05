import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { initDatabase, getDatabaseHealth, closeDatabase } from './shared/database/index.js';

// Import Domain Routers
import authRouter from './modules/auth/routes.js';
import usersRouter from './modules/users/routes.js';
import bookingsRouter from './modules/booking/routes.js';
import rentalsRouter from './modules/rental/routes.js';
import ecommerceRouter from './modules/ecommerce/routes.js';
import inventoryRouter from './modules/inventory/routes.js';
import galleryRouter from './modules/gallery/routes.js';
import crmRouter from './modules/crm/routes.js';
import paymentsRouter from './modules/payments/routes.js';
import notificationsRouter from './modules/notifications/routes.js';
import reviewsRouter from './modules/reviews/routes.js';
import analyticsRouter from './modules/analytics/routes.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Security and utility Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiter to prevent brute force attacks on auth/payment endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Health check endpoints
app.get('/health', async (req, res) => {
  const dbHealth = await getDatabaseHealth();
  const systemStatus = (dbHealth.supabase.status === 'up' && dbHealth.mongodb.status === 'up') ? 'ok' : 'degraded';
  res.status(systemStatus === 'ok' ? 200 : 500).json({
    status: systemStatus,
    timestamp: new Date(),
    services: dbHealth
  });
});

app.get('/health/database', async (req, res) => {
  const dbHealth = await getDatabaseHealth();
  const isHealthy = dbHealth.supabase.status === 'up' && dbHealth.mongodb.status === 'up';
  res.status(isHealthy ? 200 : 503).json(dbHealth);
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/shop', ecommerceRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/crm', crmRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/analytics', analyticsRouter);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error Alert]:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred'
  });
});

// Initialize Database then Start Server
initDatabase().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`   STATIONERY & PHOTOGRAPHY MULTI-DOMAIN APIS`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`===============================================`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Set a different PORT or stop the process using it.`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

}).catch(err => {
  console.error('Failed to initialize database tables:', err);
  process.exit(1);
});
