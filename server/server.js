const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://virtual-trading-app-six.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    message: 'Virtual Trading Backend API is running!',
    status: 'success',
    endpoints: ['/api/auth', '/api/stocks', '/api/portfolio', '/api/orders', '/api/watchlist']
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/watchlist', require('./routes/watchlist'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
