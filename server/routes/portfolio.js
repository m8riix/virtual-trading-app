const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.userId = user.userId;
    next();
  });
};

// Get user portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const portfolio = user.portfolio || [];
    
    // Format portfolio data
    const formattedPortfolio = portfolio.map(holding => {
      const currentPrice = holding.currentPrice || holding.buyPrice;
      const totalValue = currentPrice * holding.quantity;
      const totalInvestment = holding.buyPrice * holding.quantity;
      const gain = totalValue - totalInvestment;
      const gainPercentage = totalInvestment > 0 ? (gain / totalInvestment) * 100 : 0;

      return {
        symbol: holding.symbol,
        name: `${holding.symbol} Stock`, // You can enhance with company names
        quantity: holding.quantity,
        buyPrice: holding.buyPrice,
        currentPrice: currentPrice,
        totalValue: totalValue,
        totalInvestment: totalInvestment,
        gain: gain,
        gainPercentage: gainPercentage
      };
    });

    res.json(formattedPortfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
