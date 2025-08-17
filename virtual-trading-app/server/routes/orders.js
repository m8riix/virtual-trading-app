const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, companyName, type, quantity, price, orderType } = req.body;
    const userId = req.user._id;
    
    const totalAmount = price * quantity;
    
    // Get user
    const user = await User.findById(userId);
    
    if (type === 'BUY') {
      if (user.balance < totalAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Deduct balance
      user.balance -= totalAmount;
      
      // Update portfolio
      const existingHolding = user.portfolio.find(p => p.symbol === symbol);
      if (existingHolding) {
        const totalShares = existingHolding.quantity + quantity;
        const totalValue = (existingHolding.avgPrice * existingHolding.quantity) + totalAmount;
        existingHolding.avgPrice = totalValue / totalShares;
        existingHolding.quantity = totalShares;
      } else {
        user.portfolio.push({
          symbol,
          companyName,
          quantity,
          avgPrice: price,
          currentPrice: price
        });
      }
    } else if (type === 'SELL') {
      const holding = user.portfolio.find(p => p.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient shares to sell' });
      }
      
      // Add balance
      user.balance += totalAmount;
      
      // Update portfolio
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        user.portfolio = user.portfolio.filter(p => p.symbol !== symbol);
      }
    }
    
    await user.save();
    
    // Create order record
    const order = new Order({
      userId,
      symbol,
      companyName,
      type,
      quantity,
      price,
      orderType,
      totalAmount,
      status: 'EXECUTED'
    });
    
    await order.save();
    
    res.status(201).json({ message: 'Order executed successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
