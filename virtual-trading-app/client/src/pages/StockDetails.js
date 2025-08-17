import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [orderForm, setOrderForm] = useState({
    type: 'BUY',
    quantity: 1,
    orderType: 'MARKET'
  });
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    fetchStockDetails();
    checkWatchlistStatus();
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`/api/stocks/details/${symbol}`);
      setStock(response.data);
    } catch (error) {
      toast.error('Failed to fetch stock details');
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      const isWatched = response.data.some(item => item.symbol === symbol);
      setIsInWatchlist(isWatched);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await axios.delete(`/api/watchlist/${symbol}`);
        setIsInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await axios.post('/api/watchlist', {
          symbol,
          companyName: stock.companyName
        });
        setIsInWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    const totalAmount = stock.currentPrice * orderForm.quantity;
    
    if (orderForm.type === 'BUY' && totalAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await axios.post('/api/orders', {
        symbol,
        companyName: stock.companyName,
        type: orderForm.type,
        quantity: orderForm.quantity,
        price: stock.currentPrice,
        orderType: orderForm.orderType
      });

      toast.success(`${orderForm.type} order placed successfully!`);
      setShowOrderForm(false);
      setOrderForm({ type: 'BUY', quantity: 1, orderType: 'MARKET' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Stock not found</h3>
        <button onClick={() => navigate(-1)} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <button
          onClick={handleWatchlistToggle}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isInWatchlist
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
          <span>{isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Stock Info */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stock.symbol}</h1>
            <p className="text-gray-600 text-lg">{stock.companyName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">₹{stock.currentPrice.toFixed(2)}</div>
            <div className={`flex items-center justify-end text-lg ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              <span>{isPositive ? '+' : ''}₹{stock.change.toFixed(2)}</span>
              <span className="ml-1">({stock.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600">Open</div>
          <div className="text-xl font-semibold">₹{stock.open?.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">High</div>
          <div className="text-xl font-semibold text-success">₹{stock.high?.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Low</div>
          <div className="text-xl font-semibold text-danger">₹{stock.low?.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600">Volume</div>
          <div className="text-xl font-semibold">{stock.volume?.toLocaleString()}</div>
        </div>
      </div>

      {/* Trading Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Trade</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setOrderForm({ ...orderForm, type: 'BUY' });
              setShowOrderForm(true);
            }}
            className="flex-1 bg-success hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Buy
          </button>
          <button
            onClick={() => {
              setOrderForm({ ...orderForm, type: 'SELL' });
              setShowOrderForm(true);
            }}
            className="flex-1 bg-danger hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Sell
          </button>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {orderForm.type} {stock.symbol}
              </h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrderForm(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    className="p-1 rounded border hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm(prev => ({ 
                      ...prev, 
                      quantity: parseInt(e.target.value) || 1 
                    }))}
                    className="input flex-1 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setOrderForm(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                    className="p-1 rounded border hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Type
                </label>
                <select
                  value={orderForm.orderType}
                  onChange={(e) => setOrderForm(prev => ({ 
                    ...prev, 
                    orderType: e.target.value 
                  }))}
                  className="input"
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price per share:</span>
                  <span>₹{stock.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span>{orderForm.quantity}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                  <span>Total Amount:</span>
                  <span>₹{(stock.currentPrice * orderForm.quantity).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors ${
                    orderForm.type === 'BUY'
                      ? 'bg-success hover:bg-green-600'
                      : 'bg-danger hover:bg-red-600'
                  }`}
                >
                  {orderForm.type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
