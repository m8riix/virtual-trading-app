const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user portfolio
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const portfolio = user.portfolio || [];

    // Update current prices
    const updatedPortfolio = await Promise.all(
      portfolio.map(async (stock) => {
        try {
          const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`);
          const data = response.data.chart.result[0];
          const quote = data.indicators.quote;
          const lastIndex = quote.close.length - 1;
          
          return {
            ...stock.toObject(),
            currentPrice: quote.close[lastIndex]
          };
        } catch (error) {
          return {
            ...stock.toObject(),
            currentPrice: stock.avgPrice // fallback to avg price if can't fetch current
          };
        }
      })
    );

    res.json(updatedPortfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
