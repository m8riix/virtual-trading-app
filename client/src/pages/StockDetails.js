import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('buy');
  const [timeframe, setTimeframe] = useState('1M');

  useEffect(() => {
    fetchStockDetails();
    fetchChartData();
  }, [symbol, timeframe]);

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`/api/stocks/details/${symbol}`);
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      
      // Mock data for demonstration
      const basePrice = 2400 + Math.random() * 200;
      const change = Math.random() * 60 - 30;
      setStock({
        symbol: symbol,
        name: `${symbol} Limited`,
        price: basePrice,
        change: change,
        changePercent: (change / basePrice) * 100,
        open: basePrice - 10,
        high: basePrice + 25,
        low: basePrice - 15,
        volume: '2.5M',
        marketCap: '16,50,000 Cr',
        pe: 23.4,
        eps: 105.2
      });
    }
  };

  const fetchChartData = () => {
    const data = [];
    const basePrice = 2400;
    let currentPrice = basePrice;
    const now = new Date();
    
    const days = timeframe === '1D' ? 7 : timeframe === '1W' ? 30 : timeframe === '1M' ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      const trend = Math.sin(i * 0.1) * 5;
      const noise = (Math.random() - 0.5) * 20;
      currentPrice += trend + noise;
      
      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * 15;
      const high = Math.max(open, close) + Math.random() * 12;
      const low = Math.min(open, close) - Math.random() * 12;
      const volume = Math.floor(Math.random() * 800000) + 200000;
      
      data.push({
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
      });
      
      currentPrice = close;
    }
    
    setChartData(data);
    setLoading(false);
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
      const errorMessage = error.response?.data?.message || `Error placing ${orderType} order`;
      toast.error(errorMessage);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 bg-opacity-95 p-4 rounded-lg border border-gray-600 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Open: <span className="text-white">₹{data.open}</span></p>
            <p className="text-gray-300">High: <span className="text-green-400">₹{data.high}</span></p>
            <p className="text-gray-300">Low: <span className="text-red-400">₹{data.low}</span></p>
            <p className="text-gray-300">Close: <span className="text-white">₹{data.close}</span></p>
            <p className="text-gray-300">Volume: <span className="text-blue-400">{data.volume.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading charts...</p>
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
            <div className="text-right">
              <p className="text-4xl font-bold text-white">₹{stock?.price?.toLocaleString()}</p>
              <div className="flex items-center justify-end mt-2">
                <span className={`text-lg font-medium ${stock?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock?.change >= 0 ? '+' : ''}₹{stock?.change?.toFixed(2)}
                </span>
                <span className={`text-lg font-medium ml-2 ${stock?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({stock?.change >= 0 ? '+' : ''}{stock?.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Timeframe Selector */}
            <div className="flex space-x-1">
              {['1D', '1W', '1M', '1Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                      : 'text-gray-300 hover:text-white bg-gray-700 bg-opacity-30 hover:bg-opacity-50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Main Chart */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h2 className="text-xl font-bold text-white mb-4">Price Chart</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255, 255, 255, 0.6)" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#00D4AA"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h3 className="text-lg font-bold text-white mb-4">Volume</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.6)" fontSize={10} />
                    <YAxis stroke="rgba(255, 255, 255, 0.6)" fontSize={10} />
                    <Bar dataKey="volume" fill="rgba(0, 212, 170, 0.6)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h3 className="text-xl font-bold text-white mb-6">Place Order</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      orderType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      orderType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-opacity-70'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
