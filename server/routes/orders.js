const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.userId = user.userId;
    next();
  });
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = price * quantity;

    if (type === 'buy') {
      if (user.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      user.balance -= totalCost;
      
      // Simple portfolio update - no strict schema
      const existingHolding = user.portfolio.find(item => item.symbol === symbol);
      if (existingHolding) {
        existingHolding.quantity += quantity;
        existingHolding.totalValue = existingHolding.quantity * price;
      } else {
        user.portfolio.push({
          symbol,
          quantity,
          buyPrice: price,
          currentPrice: price,
          totalValue: quantity * price
        });
      }
    }

    await user.save();

    // Create order record
    const order = new Order({
      userId: req.userId,
      symbol,
      type,
      quantity,
      price,
      total: totalCost,
      status: 'completed'
    });

    await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: order,
      newBalance: user.balance
    });

  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
