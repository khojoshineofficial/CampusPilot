require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/books',         require('./routes/books'));
app.use('/api/past-questions',require('./routes/pastQuestions'));
app.use('/api/materials',     require('./routes/materials'));
app.use('/api/posts',         require('./routes/posts'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/quiz',          require('./routes/quiz'));
app.use('/api/analytics',     require('./routes/analytics'));

// Serve static frontend
const publicDir = path.join(__dirname, '../../public');
app.use(express.static(publicDir));

// SPA fallback — role-based routes
app.get('/admin*',   (req, res) => res.sendFile(path.join(publicDir, 'admin', 'index.html')));
app.get('/lecturer*',(req, res) => res.sendFile(path.join(publicDir, 'lecturer', 'index.html')));
app.get('/student*', (req, res) => res.sendFile(path.join(publicDir, 'student', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(publicDir, 'register.html')));
app.get('*',         (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`CampusPilot running on port ${PORT}`));
