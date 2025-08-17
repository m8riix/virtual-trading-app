import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [stocksRes, portfolioRes] = await Promise.all([
        axios.get('/api/stocks/trending').catch(() => ({ data: mockStocks })),
        axios.get('/api/portfolio').catch(() => ({ data: [] }))
      ]);
      
      setStocks(stocksRes.data.slice(0, 6));
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStocks(mockStocks);
    } finally {
      setLoading(false);
    }
  };

  const mockStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 2.3, changePercent: 0.94 },
    { symbol: 'TCS', name: 'Tata Consultancy', price: 3234.50, change: -15.20, changePercent: -0.47 },
    { symbol: 'HDFC', name: 'HDFC Bank', price: 1687.90, change: 8.45, changePercent: 0.50 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1456.30, change: 12.10, changePercent: 0.84 },
    { symbol: 'BHARTI', name: 'Bharti Airtel', price: 789.25, change: -3.75, changePercent: -0.47 },
    { symbol: 'ITC', name: 'ITC Limited', price: 345.80, change: 1.90, changePercent: 0.55 }
  ];

  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice || 0), 0);
  const totalReturn = totalPortfolioValue - portfolio.reduce((sum, item) => sum + (item.quantity * item.buyPrice || 0), 0);
  const todayChange = Math.random() * 1000 - 500;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xl text-blue-100">
            Ready to make some smart trades today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Portfolio Value</p>
                <p className="text-3xl font-bold text-white">
                  ₹{(user?.balance + totalPortfolioValue).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalReturn >= 0 ? '+' : ''}₹{Math.abs(totalReturn).toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 ml-2">Total Return</span>
            </div>
          </div>

          {/* Available Cash */}
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Available Cash</p>
                <p className="text-3xl font-bold text-white">
                  ₹{user?.balance?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-400">Ready for trading</span>
            </div>
          </div>

          {/* Today's Change */}
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30 hover:bg-opacity-50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${todayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {todayChange >= 0 ? '+' : ''}₹{Math.abs(todayChange).toFixed(0)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${todayChange >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={todayChange >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${todayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {todayChange >= 0 ? '↗' : '↘'} {(Math.abs(todayChange / user?.balance * 100) || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Market Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Stocks */}
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🔥 Trending Stocks</h2>
              <Link to="/portfolio" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stocks.map((stock, index) => (
                <Link 
                  to={`/stock/${stock.symbol}`}
                  key={index} 
                  className="p-4 bg-gray-700 bg-opacity-50 rounded-xl hover:bg-opacity-70 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{stock.symbol}</h3>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">₹{stock.price?.toFixed(2)}</p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <h2 className="text-2xl font-bold text-white mb-6">⚡ Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/stock/RELIANCE"
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buy Stocks
              </Link>
              <Link 
                to="/portfolio"
                className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-opacity-70 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View Portfolio
              </Link>
              <Link 
                to="/watchlist"
                className="w-full bg-gray-700 bg-opacity-50 border border-gray-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-opacity-70 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Manage Watchlist
              </Link>
            </div>

            {/* Market Status */}
            <div className="mt-6 p-4 bg-gray-700 bg-opacity-30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Market Status</span>
                <span className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Open
                </span>
              </div>
              <div className="text-xs text-gray-400">
                NSE & BSE are currently open for trading
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
