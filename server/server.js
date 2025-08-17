const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://virtual-trading-app-six.vercel.app',
    'https://virtual-trading-mxwfbqv31-m8riixs-projects.vercel.app',
    /https:\/\/virtual-trading-.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    message: 'Virtual Trading Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/auth', '/api/stocks', '/api/portfolio', '/api/orders', '/api/watchlist']
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/watchlist', require('./routes/watchlist'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
});
