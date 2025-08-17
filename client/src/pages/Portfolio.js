import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio');
      setPortfolio(response.data);
    } catch (error) {
      toast.error('Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalInvested = portfolio.reduce((sum, stock) => sum + (stock.avgPrice * stock.quantity), 0);
    const totalCurrent = portfolio.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
    const totalPnL = totalCurrent - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, totalPnL, totalPnLPercent };
  };

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'value':
        aValue = a.currentPrice * a.quantity;
        bValue = b.currentPrice * b.quantity;
        break;
      case 'pnl':
        aValue = (a.currentPrice - a.avgPrice) * a.quantity;
        bValue = (b.currentPrice - b.avgPrice) * b.quantity;
        break;
      case 'pnlPercent':
        aValue = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
        bValue = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No holdings yet</h3>
        <p className="text-gray-600 mb-6">Start your investment journey by buying your first stock.</p>
        <Link to="/dashboard" className="btn-primary">
          Explore Markets
        </Link>
      </div>
    );
  }

  const { totalInvested, totalCurrent, totalPnL, totalPnLPercent } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-600">Track your investments and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm font-medium text-gray-600">Total Invested</div>
          <div className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-600">Current Value</div>
          <div className="text-2xl font-bold text-gray-900">₹{totalCurrent.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-600">Total P&L</div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-600">Returns</div>
          <div className={`text-2xl font-bold flex items-center ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalPnL >= 0 ? (
              <ArrowUpRight className="h-6 w-6 mr-1" />
            ) : (
              <ArrowDownRight className="h-6 w-6 mr-1" />
            )}
            {totalPnLPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Holdings</h2>
          <div className="text-sm text-gray-600">
            {portfolio.length} stock{portfolio.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Stock</th>
                <th 
                  className="text-right py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('quantity')}
                >
                  Qty
                </th>
                <th 
                  className="text-right py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('avgPrice')}
                >
                  Avg Price
                </th>
                <th className="text-right py-3 text-sm font-medium text-gray-600">LTP</th>
                <th 
                  className="text-right py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('value')}
                >
                  Current Value
                </th>
                <th 
                  className="text-right py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('pnl')}
                >
                  P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPortfolio.map((stock) => {
                const currentValue = stock.currentPrice * stock.quantity;
                const investedValue = stock.avgPrice * stock.quantity;
                const stockPnL = currentValue - investedValue;
                const stockPnLPercent = (stockPnL / investedValue) * 100;

                return (
                  <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <Link 
                        to={`/stock/${stock.symbol}`}
                        className="hover:text-primary-600"
                      >
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.companyName}</div>
                      </Link>
                    </td>
                    <td className="text-right py-4 font-medium">{stock.quantity}</td>
                    <td className="text-right py-4">₹{stock.avgPrice.toFixed(2)}</td>
                    <td className="text-right py-4 font-medium">₹{stock.currentPrice.toFixed(2)}</td>
                    <td className="text-right py-4 font-medium">₹{currentValue.toLocaleString()}</td>
                    <td className="text-right py-4">
                      <div className={`font-medium ${stockPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stockPnL >= 0 ? '+' : ''}₹{stockPnL.toFixed(2)}
                      </div>
                      <div className={`text-sm ${stockPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                        ({stockPnLPercent.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
