const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

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

// Place a new order (Buy/Sell)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;

    console.log('Order request:', { symbol, type, quantity, price, userId: req.userId });

    // Validation
    if (!symbol || !type || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (type !== 'buy' && type !== 'sell') {
      return res.status(400).json({ message: 'Order type must be buy or sell' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = price * quantity;

    if (type === 'buy') {
      // Check if user has enough balance
      if (user.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Deduct balance
      user.balance -= totalCost;
      await user.save();

      // Add to portfolio (or update existing holding)
      if (!user.portfolio) {
        user.portfolio = [];
      }

      const existingHolding = user.portfolio.find(item => item.symbol === symbol);
      if (existingHolding) {
        const totalShares = existingHolding.quantity + quantity;
        const totalValue = (existingHolding.quantity * existingHolding.buyPrice) + totalCost;
        existingHolding.quantity = totalShares;
        existingHolding.buyPrice = totalValue / totalShares; // Average price
      } else {
        user.portfolio.push({
          symbol,
          quantity,
          buyPrice: price,
          currentPrice: price
        });
      }

      await user.save();
    } else {
      // Sell order - check if user has enough shares
      if (!user.portfolio) {
        return res.status(400).json({ message: 'No holdings to sell' });
      }

      const holding = user.portfolio.find(item => item.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient shares to sell' });
      }

      // Update portfolio
      if (holding.quantity === quantity) {
        user.portfolio = user.portfolio.filter(item => item.symbol !== symbol);
      } else {
        holding.quantity -= quantity;
      }

      // Add to balance
      user.balance += totalCost;
      await user.save();
    }

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
      message: `${type} order placed successfully`,
      order: {
        id: order._id,
        symbol,
        type,
        quantity,
        price,
        total: totalCost,
        status: 'completed'
      },
      newBalance: user.balance
    });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedOrders = orders.map(order => ({
      id: order._id,
      symbol: order.symbol,
      name: `${order.symbol} Stock`, // You can enhance this with actual company names
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      total: order.total,
      status: order.status,
      date: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
