import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Watchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      setWatchlist(response.data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Mock data for demonstration
      setWatchlist([
        {
          symbol: 'RELIANCE',
          name: 'Reliance Industries',
          price: 2456.75,
          change: 12.30,
          changePercent: 0.50,
          marketCap: '16,50,000 Cr',
          volume: '2.5M',
          high: 2465.90,
          low: 2440.20
        },
        {
          symbol: 'TCS',
          name: 'Tata Consultancy Services',
          price: 3234.50,
          change: -15.20,
          changePercent: -0.47,
          marketCap: '11,75,000 Cr',
          volume: '1.8M',
          high: 3250.00,
          low: 3225.40
        },
        {
          symbol: 'HDFC',
          name: 'HDFC Bank',
          price: 1687.90,
          change: 8.45,
          changePercent: 0.50,
          marketCap: '9,25,000 Cr',
          volume: '3.2M',
          high: 1695.30,
          low: 1675.80
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    try {
      await axios.post('/api/watchlist', { symbol: searchTerm.toUpperCase() });
      toast.success(`Added ${searchTerm.toUpperCase()} to watchlist`);
      setSearchTerm('');
      fetchWatchlist();
    } catch (error) {
      toast.error('Error adding to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`/api/watchlist/${symbol}`);
      toast.success(`Removed ${symbol} from watchlist`);
      fetchWatchlist();
    } catch (error) {
      toast.error('Error removing from watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Watchlist</h1>
          <p className="text-xl text-blue-100">Monitor your favorite stocks in real-time</p>
        </div>

        {/* Add to Watchlist */}
        <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Add Stock to Watchlist</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., RELIANCE)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleAddToWatchlist()}
            />
            <button
              onClick={handleAddToWatchlist}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02] whitespace-nowrap"
            >
              Add Stock
            </button>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600 border-opacity-30 overflow-hidden">
          <div className="p-6 border-b border-gray-600 border-opacity-30">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Watchlist ({watchlist.length})</h2>
              <button
                onClick={fetchWatchlist}
                className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 text-white text-sm rounded-lg hover:bg-opacity-70 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          {watchlist.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 bg-opacity-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400 mb-6">Add stocks to monitor their prices and performance</p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Explore Popular Stocks
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 bg-opacity-30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">High/Low</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600 divide-opacity-30">
                  {watchlist.map((stock, index) => (
                    <tr key={index} className="hover:bg-gray-700 hover:bg-opacity-20 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{stock.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">₹{stock.price?.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">MCap: {stock.marketCap}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}₹{stock.change?.toFixed(2)}
                        </div>
                        <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        <div>H: ₹{stock.high?.toLocaleString()}</div>
                        <div>L: ₹{stock.low?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{stock.volume}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/stock/${stock.symbol}`}
                            className="px-3 py-1 bg-blue-600 bg-opacity-80 text-white text-xs rounded-lg hover:bg-opacity-100 transition-all duration-200"
                          >
                            Trade
                          </Link>
                          <button
                            onClick={() => handleRemoveFromWatchlist(stock.symbol)}
                            className="px-3 py-1 bg-red-600 bg-opacity-80 text-white text-xs rounded-lg hover:bg-opacity-100 transition-all duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
