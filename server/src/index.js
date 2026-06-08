require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const isProd = process.env.NODE_ENV === 'production';

// In production on Render, frontend is served from the same Express process
// so CORS is only needed in development. Accept configured CLIENT_URL or all origins.
const corsOrigin = isProd
  ? (process.env.CLIENT_URL || true)   // true = reflect request origin (same-origin on Render)
  : '*';

const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true },
});

connectDB();
setupSocket(io);
app.set('io', io);

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/community', require('./routes/community'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/advertisements', require('./routes/advertisements'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Seed route — protected by SEED_SECRET env var so it can be triggered on Render
app.post('/api/seed', async (req, res) => {
  const secret = req.headers['x-seed-secret'] || req.query.secret;
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    // Run seed inline by importing and calling it
    const { execFile } = require('child_process');
    const seedPath = require('path').join(__dirname, 'utils/seed.js');
    execFile('node', [seedPath], { env: process.env }, (err, stdout, stderr) => {
      if (err) return res.status(500).json({ success: false, message: stderr || err.message });
      res.json({ success: true, output: stdout });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve React build in production — Express handles all non-API routes
if (isProd) {
  const buildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
