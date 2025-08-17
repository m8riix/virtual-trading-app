const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// Middleware to authenticate user
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

// Place new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Order request received:', req.body);
    console.log('User ID:', req.userId);

    const { symbol, type, quantity, price } = req.body;

    // Validation
    if (!symbol || !type || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({ message: 'Invalid order type' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = price * quantity;

    if (type === 'buy') {
      // Check balance
      if (user.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Deduct balance
      user.balance -= totalCost;

      // Initialize portfolio if it doesn't exist
      if (!user.portfolio) {
        user.portfolio = [];
      }

      // Update portfolio
      let holding = user.portfolio.find(h => h.symbol === symbol);
      if (holding) {
        const currentTotal = holding.buyPrice * holding.quantity + totalCost;
        const currentQty = holding.quantity + quantity;
        holding.buyPrice = currentTotal / currentQty;
        holding.quantity = currentQty;
        holding.currentPrice = price;
      } else {
        user.portfolio.push({ 
          symbol, 
          quantity, 
          buyPrice: price, 
          currentPrice: price 
        });
      }
    } else {
      // Sell logic
      if (!user.portfolio) {
        return res.status(400).json({ message: 'No holdings to sell' });
      }

      const holding = user.portfolio.find(h => h.symbol === symbol);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ message: 'Not enough shares to sell' });
      }

      if (holding.quantity === quantity) {
        user.portfolio = user.portfolio.filter(h => h.symbol !== symbol);
      } else {
        holding.quantity -= quantity;
      }
      user.balance += totalCost;
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

    console.log('Order saved successfully:', order);

    res.status(201).json({ 
      message: 'Order placed successfully', 
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

  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ message: 'Internal server error: ' + err.message });
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
      name: `${order.symbol} Stock`,
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
