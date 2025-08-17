import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/watchlist');
      setWatchlist(response.data);
      
      // Fetch current prices for watchlist items
      if (response.data.length > 0) {
        await fetchStockPrices(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockPrices = async (stocks) => {
    try {
      const pricePromises = stocks.map(async (stock) => {
        try {
          const response = await axios.get(`/api/stocks/details/${stock.symbol}`);
          return { symbol: stock.symbol, data: response.data };
        } catch (error) {
          return { symbol: stock.symbol, data: null };
        }
      });

      const prices = await Promise.all(pricePromises);
      const priceMap = {};
      prices.forEach(({ symbol, data }) => {
        if (data) {
          priceMap[symbol] = data;
        }
      });
      setStockPrices(priceMap);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await axios.delete(`/api/watchlist/${symbol}`);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your watchlist is empty</h3>
        <p className="text-gray-600 mb-6">Add stocks to keep track of their performance.</p>
        <Link to="/dashboard" className="btn-primary">
          Explore Stocks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Watchlist</h1>
        <p className="text-gray-600">Keep track of your favorite stocks</p>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="text-sm text-gray-600">Total Stocks Watched</div>
        <div className="text-2xl font-bold text-gray-900">{watchlist.length}</div>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.map((stock) => {
          const priceData = stockPrices[stock.symbol];
          const isPositive = priceData?.change >= 0;

          return (
            <div key={stock.symbol} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <Link 
                  to={`/stock/${stock.symbol}`}
                  className="flex-1 hover:text-primary-600"
                >
                  <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
                  <p className="text-sm text-gray-600 truncate">{stock.companyName}</p>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(stock.symbol)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {priceData ? (
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{priceData.currentPrice?.toFixed(2)}
                    </div>
                    <div className={`flex items-center text-sm ${
                      isPositive ? 'text-success' : 'text-danger'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}₹{priceData.change?.toFixed(2)} 
                        ({priceData.changePercent?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <div>High: ₹{priceData.high?.toFixed(2)}</div>
                      <div>Low: ₹{priceData.low?.toFixed(2)}</div>
                    </div>
                    <div>
                      <div>Open: ₹{priceData.open?.toFixed(2)}</div>
                      <div>Volume: {priceData.volume?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Link
                  to={`/stock/${stock.symbol}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
