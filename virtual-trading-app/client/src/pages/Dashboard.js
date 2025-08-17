import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [marketResponse, portfolioResponse, watchlistResponse] = await Promise.all([
        axios.get('/api/stocks/market-overview'),
        axios.get('/api/portfolio'),
        axios.get('/api/watchlist')
      ]);

      setMarketData(marketResponse.data);
      setPortfolio(portfolioResponse.data);
      setWatchlist(watchlistResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, stock) => total + (stock.currentPrice * stock.quantity), 0);
  };

  const calculatePnL = () => {
    return portfolio.reduce((total, stock) => {
      const invested = stock.avgPrice * stock.quantity;
      const current = stock.currentPrice * stock.quantity;
      return total + (current - invested);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const portfolioValue = calculatePortfolioValue();
  const pnl = calculatePnL();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your investments today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">₹{user?.balance?.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{portfolioValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
              </p>
            </div>
            {pnl >= 0 ? (
              <TrendingUp className="h-8 w-8 text-success" />
            ) : (
              <TrendingDown className="h-8 w-8 text-danger" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
            </div>
            <Eye className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Market Overview</h2>
          <Link to="/search" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Stock</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Price</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Change</th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">Volume</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((stock) => (
                <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <Link 
                      to={`/stock/${stock.symbol}`}
                      className="hover:text-primary-600"
                    >
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.companyName}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="text-right py-3 font-medium">₹{stock.currentPrice?.toFixed(2)}</td>
                  <td className="text-right py-3">
                    <div className={`flex items-center justify-end ${
                      stock.change >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {stock.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      <span>{stock.change >= 0 ? '+' : ''}₹{stock.change?.toFixed(2)}</span>
                      <span className="ml-1">({stock.changePercent?.toFixed(2)}%)</span>
                    </div>
                  </td>
                  <td className="text-right py-3 text-gray-600">
                    {stock.volume?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Holdings */}
      {portfolio.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
            <Link to="/portfolio" className="text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {portfolio.slice(0, 5).map((stock) => {
              const currentValue = stock.currentPrice * stock.quantity;
              const investedValue = stock.avgPrice * stock.quantity;
              const stockPnL = currentValue - investedValue;
              const stockPnLPercent = (stockPnL / investedValue) * 100;

              return (
                <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.quantity} shares</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{currentValue.toLocaleString()}</div>
                    <div className={`text-sm ${stockPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                      {stockPnL >= 0 ? '+' : ''}₹{stockPnL.toFixed(2)} ({stockPnLPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Watchlist</h2>
            <Link to="/watchlist" className="text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.slice(0, 6).map((stock) => (
              <Link
                key={stock.symbol}
                to={`/stock/${stock.symbol}`}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.companyName}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
