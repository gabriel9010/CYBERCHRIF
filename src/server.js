const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const open = require('open');

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// SERVE STATIC FILES (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// API ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/data', require('./routes/data'));

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running', time: new Date() });
});

// SERVE INDEX.HTML FOR ROOT
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SERVE INDEX.HTML FOR ALL ROUTES (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  
  // Apri automaticamente il browser
  try {
    await open(`http://localhost:${PORT}`);
    console.log('🔓 Browser opened automatically!');
  } catch (err) {
    console.log('ℹ️ Open browser manually: http://localhost:' + PORT);
  }
});
