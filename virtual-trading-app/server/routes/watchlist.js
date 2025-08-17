const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get watchlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.watchlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to watchlist
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, companyName } = req.body;
    const user = await User.findById(req.user._id);
    
    // Check if already in watchlist
    const existingItem = user.watchlist.find(item => item.symbol === symbol);
    if (existingItem) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }
    
    user.watchlist.push({ symbol, companyName });
    await user.save();
    
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from watchlist
router.delete('/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await User.findById(req.user._id);
    
    user.watchlist = user.watchlist.filter(item => item.symbol !== symbol);
    await user.save();
    
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
