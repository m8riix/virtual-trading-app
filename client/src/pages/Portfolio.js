import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio');
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Mock data for demonstration
      setPortfolio([
        {
          symbol: 'RELIANCE',
          name: 'Reliance Industries',
          quantity: 10,
          buyPrice: 2400,
          currentPrice: 2456.75,
          totalValue: 24567.50,
          totalInvestment: 24000,
          gain: 567.50,
          gainPercentage: 2.36
        },
        {
          symbol: 'TCS',
          name: 'Tata Consultancy Services',
          quantity: 5,
          buyPrice: 3250,
          currentPrice: 3234.50,
          totalValue: 16172.50,
          totalInvestment: 16250,
          gain: -77.50,
          gainPercentage: -0.48
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSellStock = async (symbol, quantity) => {
    try {
      await axios.post('/api/orders/sell', { symbol, quantity });
      toast.success(`Sold ${quantity} shares of ${symbol}`);
      fetchPortfolio();
    } catch (error) {
      toast.error('Error selling stock');
    }
  };

  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalInvestment = portfolio.reduce((sum, item) => sum + item.totalInvestment, 0);
  const totalGain = totalValue - totalInvestment;
  const totalGainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-xl text-blue-100">Track your investments and performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-white">₹{totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-white">₹{totalInvestment.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Total Gain/Loss</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Return %</p>
            <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGainPercentage.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600 border-opacity-30 overflow-hidden">
          <div className="p-6 border-b border-gray-600 border-opacity-30">
            <h2 className="text-2xl font-bold text-white">Your Holdings</h2>
          </div>
          
          {portfolio.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 bg-opacity-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No holdings yet</h3>
              <p className="text-gray-400 mb-6">Start building your portfolio by buying some stocks</p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Explore Stocks
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 bg-opacity-30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600 divide-opacity-30">
                  {portfolio.map((holding, index) => (
                    <tr key={index} className="hover:bg-gray-700 hover:bg-opacity-20 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{holding.symbol}</div>
                          <div className="text-sm text-gray-400">{holding.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{holding.quantity}</td>
                      <td className="px-6 py-4 text-sm text-white">₹{holding.buyPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-white">₹{holding.currentPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-white">₹{holding.totalValue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.gain >= 0 ? '+' : ''}₹{holding.gain.toLocaleString()}
                        </div>
                        <div className={`text-xs ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.gain >= 0 ? '+' : ''}{holding.gainPercentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/stock/${holding.symbol}`}
                            className="px-3 py-1 bg-blue-600 bg-opacity-80 text-white text-xs rounded-lg hover:bg-opacity-100 transition-all duration-200"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleSellStock(holding.symbol, holding.quantity)}
                            className="px-3 py-1 bg-red-600 bg-opacity-80 text-white text-xs rounded-lg hover:bg-opacity-100 transition-all duration-200"
                          >
                            Sell
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

export default Portfolio;
