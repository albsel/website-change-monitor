const express = require('express');
const cors = require('cors');
const urlsRouter = require('./routes/urls');
const crawlRouter = require('./routes/crawl');
const historyRouter = require('./routes/history');

const app = express();

// Cors
app.use(cors());

// Middleware
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/urls', urlsRouter);
app.use('/api/crawl', crawlRouter);
app.use('/api/history', historyRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }

module.exports = app;