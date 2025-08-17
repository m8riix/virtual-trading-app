const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Clear any cached model
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const portfolioSchema = new mongoose.Schema({
  symbol: { 
    type: String, 
    required: [true, 'Symbol is required']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive']
  },
  buyPrice: { 
    type: Number, 
    required: [true, 'Buy price is required'],
    min: [0, 'Buy price must be positive']
  },
  currentPrice: { 
    type: Number, 
    default: 0,
    min: [0, 'Current price must be positive']
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000000 },
  portfolio: {
    type: [portfolioSchema],
    default: []
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
