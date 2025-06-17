const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const studentRoutes = require('./routes/students');
const cors = require('cors');
const settingsRoutes = require('./routes/settings');
const codeforcesRoutes = require('./routes/codeforcesRoutes');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from Vite dev server
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Routes
app.use('/api/students', studentRoutes); // Updated route path to match frontend
app.use('/api/settings', settingsRoutes);
app.use('/api/codeforces', codeforcesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-progress', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
