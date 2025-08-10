/*
 Express application: security middleware, static hosting for frontend in dev, and API routes
*/

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CORS: restrict to allowed origins
function buildCorsOptions() {
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const allowAllLocal = origins.length === 0;
  return {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps / curl
      if (allowAllLocal) {
        // Default dev origins
        const allowed = ['http://localhost:8080', 'http://127.0.0.1:8080'];
        return callback(null, allowed.includes(origin));
      }
      const ok = origins.includes(origin);
      return callback(null, ok);
    },
    credentials: true,
  };
}
app.use(cors(buildCorsOptions()));

// Static: serve frontend for local demo
const frontendDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDir));

// Rate limit for sensitive endpoints
const paymentLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Routes
app.use('/api/config', require('./routes/config'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/save', require('./routes/save'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/payments', paymentLimiter, require('./routes/payments'));
app.use('/api/webhook', paymentLimiter, require('./routes/webhook'));

// Fallback to index.html for SPA routes (exclude /api)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

module.exports = app;