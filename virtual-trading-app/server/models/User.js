const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: String,
  balance: {
    type: Number,
    default: 1000000 // 10 Lakh virtual money
  },
  portfolio: [{
    symbol: String,
    companyName: String,
    quantity: Number,
    avgPrice: Number,
    currentPrice: Number
  }],
  watchlist: [{
    symbol: String,
    companyName: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
