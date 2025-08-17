import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('buy');

  useEffect(() => {
    fetchStockDetails();
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      console.log('Fetching stock details for:', symbol);
      const response = await axios.get(`/api/stocks/details/${symbol}`);
      setStock(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      setError(error.response?.data?.message || 'Stock not found');
      
      // Fallback mock data for demonstration
      if (symbol === 'RELIANCE') {
        setStock({
          symbol: 'RELIANCE',
          name: 'Reliance Industries Limited',
          price: 2456.75,
          change: 12.30,
          changePercent: 0.50,
          open: 2445.20,
          high: 2465.90,
          low: 2440.20,
          volume: '2.5M',
          marketCap: '16,50,000 Cr',
          pe: 23.4,
          eps: 105.2,
          about: 'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. It has diverse businesses including energy, petrochemicals, oil & gas, telecom and retail.'
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const totalCost = stock.price * quantity;
    if (orderType === 'buy' && totalCost > user?.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await axios.post('/api/orders', {
        symbol: stock.symbol,
        type: orderType,
        quantity: parseInt(quantity),
        price: stock.price
      });
      
      toast.success(`${orderType === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${stock.symbol}`);
      setQuantity(1);
    } catch (error) {
      toast.error(`Error placing ${orderType} order`);
    }
  };

  const addToWatchlist = async () => {
    try {
      await axios.post('/api/watchlist', { symbol: stock.symbol });
      toast.success(`Added ${stock.symbol} to watchlist`);
    } catch (error) {
      toast.error('Error adding to watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (error && !stock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-600 border-opacity-30">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5C3.544 16.333 4.456 18 5.996 18z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Stock Not Found</h2>
            <p className="text-gray-300 mb-6">The stock symbol "{symbol}" could not be found or is currently unavailable.</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Go Back
              </button>
              <Link
                to="/dashboard"
                className="block w-full bg-gray-700 bg-opacity-50 border border-gray-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-opacity-70 transition-all duration-200 text-center"
              >
                Browse Popular Stocks
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-200 hover:text-white mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{stock?.symbol}</h1>
              <p className="text-xl text-blue-100">{stock?.name}</p>
            </div>
            <button
              onClick={addToWatchlist}
              className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg hover:bg-opacity-70 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add to Watchlist
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-4xl font-bold text-white">₹{stock?.price?.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-lg font-medium ${stock?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock?.change >= 0 ? '+' : ''}₹{stock?.change?.toFixed(2)}
                    </span>
                    <span className={`text-lg font-medium ml-2 ${stock?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ({stock?.change >= 0 ? '+' : ''}{stock?.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-full ${stock?.change >= 0 ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}`}>
                  <svg className={`w-8 h-8 ${stock?.change >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stock?.change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-4 border border-gray-600 border-opacity-30">
                <p className="text-sm text-gray-300">Open</p>
                <p className="text-lg font-semibold text-white">₹{stock?.open?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-4 border border-gray-600 border-opacity-30">
                <p className="text-sm text-gray-300">High</p>
                <p className="text-lg font-semibold text-white">₹{stock?.high?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-4 border border-gray-600 border-opacity-30">
                <p className="text-sm text-gray-300">Low</p>
                <p className="text-lg font-semibold text-white">₹{stock?.low?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-xl p-4 border border-gray-600 border-opacity-30">
                <p className="text-sm text-gray-300">Volume</p>
                <p className="text-lg font-semibold text-white">{stock?.volume}</p>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h3 className="text-xl font-bold text-white mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-300">Market Cap</p>
                  <p className="text-lg font-semibold text-white">{stock?.marketCap}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">P/E Ratio</p>
                  <p className="text-lg font-semibold text-white">{stock?.pe}</p>
                </div>
              </div>
              {stock?.about && (
                <div>
                  <p className="text-sm text-gray-300 mb-2">About</p>
                  <p className="text-white leading-relaxed">{stock.about}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h3 className="text-xl font-bold text-white mb-6">Place Order</h3>
              
              {/* Order Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      orderType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      orderType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-700 bg-opacity-30 rounded-lg">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Price per share:</span>
                  <span>₹{stock?.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold text-white">
                    <span>Total:</span>
                    <span>₹{(stock?.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleOrder}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                  orderType === 'buy'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                }`}
              >
                {orderType === 'buy' ? 'Buy Now' : 'Sell Now'}
              </button>

              {/* Balance Info */}
              <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg">
                <p className="text-sm text-blue-200">
                  Available Balance: ₹{user?.balance?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
