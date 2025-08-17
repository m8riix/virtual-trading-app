import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createChart } from 'lightweight-charts';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const volumeSeries = useRef();
  
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('buy');
  const [timeframe, setTimeframe] = useState('1D');
  const [indicators, setIndicators] = useState({
    sma: false,
    ema: false,
    rsi: false
  });

  useEffect(() => {
    fetchStockDetails();
    fetchChartData();
  }, [symbol, timeframe]);

  useEffect(() => {
    if (chartContainerRef.current && chartData.length > 0) {
      initializeChart();
    }
    return () => {
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, [chartData]);

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`/api/stocks/details/${symbol}`);
      setStock(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      setError(error.response?.data?.message || 'Stock not found');
      
      // Mock data for demonstration
      setStock({
        symbol: symbol,
        name: `${symbol} Limited`,
        price: 2456.75 + Math.random() * 100 - 50,
        change: Math.random() * 40 - 20,
        changePercent: Math.random() * 2 - 1,
        open: 2445.20,
        high: 2465.90,
        low: 2440.20,
        volume: '2.5M',
        marketCap: '16,50,000 Cr',
        pe: 23.4,
        eps: 105.2
      });
      setError(null);
    }
  };

  const fetchChartData = async () => {
    try {
      // Mock chart data - replace with real API
      const mockData = generateMockChartData();
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      const mockData = generateMockChartData();
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = () => {
    const data = [];
    const basePrice = 2400;
    let currentPrice = basePrice;
    const now = new Date();
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const timestamp = Math.floor(date.getTime() / 1000);
      
      const change = (Math.random() - 0.5) * 40;
      currentPrice += change;
      
      const open = currentPrice;
      const close = currentPrice + (Math.random() - 0.5) * 20;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      const volume = Math.floor(Math.random() * 1000000) + 500000;
      
      data.push({
        time: timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  const initializeChart = () => {
    if (chart.current) {
      chart.current.remove();
    }

    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      priceScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    candlestickSeries.current = chart.current.addCandlestickSeries({
      upColor: '#00D4AA',
      downColor: '#FF4976',
      borderDownColor: '#FF4976',
      borderUpColor: '#00D4AA',
      wickDownColor: '#FF4976',
      wickUpColor: '#00D4AA',
    });

    // Add volume series
    volumeSeries.current = chart.current.addHistogramSeries({
      color: 'rgba(76, 175, 80, 0.5)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    // Set data
    const candleData = chartData.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData = chartData.map(item => ({
      time: item.time,
      value: item.volume,
      color: item.close >= item.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)',
    }));

    candlestickSeries.current.setData(candleData);
    volumeSeries.current.setData(volumeData);

    // Handle resize
    const handleResize = () => {
      chart.current.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      const response = await axios.post('/api/orders', {
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

  if (error && !stock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-600 border-opacity-30">
            <h2 className="text-2xl font-bold text-white mb-2">Stock Not Found</h2>
            <p className="text-gray-300 mb-6">The stock symbol "{symbol}" could not be found.</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200"
            >
              Go Back
            </button>
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
            {/* Chart Container */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Price Chart</h2>
                
                {/* Timeframe Selector */}
                <div className="flex space-x-1">
                  {['1D', '1W', '1M', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        timeframe === tf
                          ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                          : 'text-gray-400 hover:text-white bg-gray-700 bg-opacity-30'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              
              <div ref={chartContainerRef} className="w-full h-96" />
            </div>

            {/* Indicators */}
            <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
              <h3 className="text-lg font-bold text-white mb-4">Technical Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700 bg-opacity-30 rounded-xl">
                  <p className="text-sm text-gray-300">RSI (14)</p>
                  <p className="text-2xl font-bold text-white">65.4</p>
                  <p className="text-xs text-yellow-400">Neutral</p>
                </div>
                <div className="p-4 bg-gray-700 bg-opacity-30 rounded-xl">
                  <p className="text-sm text-gray-300">SMA (20)</p>
                  <p className="text-2xl font-bold text-white">₹2,398</p>
                  <p className="text-xs text-green-400">Bullish</p>
                </div>
                <div className="p-4 bg-gray-700 bg-opacity-30 rounded-xl">
                  <p className="text-sm text-gray-300">Volume</p>
                  <p className="text-2xl font-bold text-white">{stock?.volume}</p>
                  <p className="text-xs text-blue-400">Above Average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel - Same as before */}
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
