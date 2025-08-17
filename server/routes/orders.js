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

    // Strict validation
    if (!symbol || !type || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({ message: 'Invalid order type' });
    }

    const qty = Number(quantity);
    const prc = Number(price);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    if (isNaN(prc) || prc <= 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = prc * qty;

    if (type === 'buy') {
      // Check balance
      if (user.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Deduct balance
      user.balance -= totalCost;

      // Initialize portfolio array if needed
      if (!Array.isArray(user.portfolio)) {
        user.portfolio = [];
      }

      // Find existing holding
      const existingIndex = user.portfolio.findIndex(h => h.symbol === symbol);
      
      if (existingIndex >= 0) {
        // Update existing holding
        const holding = user.portfolio[existingIndex];
        const currentTotal = (holding.buyPrice * holding.quantity) + totalCost;
        const newQuantity = holding.quantity + qty;
        
        user.portfolio[existingIndex] = {
          symbol: symbol,
          quantity: newQuantity,
          buyPrice: currentTotal / newQuantity,
          currentPrice: prc
        };
        
        console.log('Updated existing holding:', user.portfolio[existingIndex]);
      } else {
        // Create new holding with explicit field assignment
        const newHolding = {
          symbol: String(symbol),
          quantity: Number(qty),
          buyPrice: Number(prc),
          currentPrice: Number(prc)
        };
        
        console.log('Creating new portfolio holding:', newHolding);
        console.log('buyPrice type:', typeof newHolding.buyPrice, 'value:', newHolding.buyPrice);
        
        user.portfolio.push(newHolding);
      }
    } else {
      // Sell logic
      if (!Array.isArray(user.portfolio) || user.portfolio.length === 0) {
        return res.status(400).json({ message: 'No holdings to sell' });
      }

      const holdingIndex = user.portfolio.findIndex(h => h.symbol === symbol);
      if (holdingIndex === -1 || user.portfolio[holdingIndex].quantity < qty) {
        return res.status(400).json({ message: 'Not enough shares to sell' });
      }

      if (user.portfolio[holdingIndex].quantity === qty) {
        user.portfolio.splice(holdingIndex, 1);
      } else {
        user.portfolio[holdingIndex].quantity -= qty;
      }
      user.balance += totalCost;
    }

    console.log('Final portfolio before save:', JSON.stringify(user.portfolio, null, 2));

    // Save user with validation
    await user.save();
    console.log('User saved successfully');

    // Create order record
    const order = new Order({
      userId: req.userId,
      symbol,
      type,
      quantity: qty,
      price: prc,
      total: totalCost,
      status: 'completed'
    });

    await order.save();
    console.log('Order saved successfully:', order._id);

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order._id,
        symbol,
        type,
        quantity: qty,
        price: prc,
        total: totalCost,
        status: 'completed'
      },
      newBalance: user.balance
    });

  } catch (err) {
    console.error('Order placement error:', err);
    console.error('Error stack:', err.stack);
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
