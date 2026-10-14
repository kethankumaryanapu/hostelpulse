const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initDb } = require('./db');
const authRoutes = require('./modules/auth/auth.routes');
const foodRoutes = require('./modules/food/food.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Root
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'HostelPulse Core Foundation API',
      version: '1.0.0',
    },
    error: null,
  });
});

// Mount Routes with /api/v1 prefix
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED-SERVER-ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    data: null,
    error: {
      message: err.message || 'An unexpected internal server error occurred.',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

// Boot Server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` HostelPulse Foundation API is running on port ${PORT}`);
      console.log(` API Base: http://localhost:${PORT}/api/v1`);
      console.log(` Health:   http://localhost:${PORT}/health`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('[SERVER-BOOT-FAIL] Could not start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
