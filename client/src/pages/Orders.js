import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, buy, sell

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for demonstration
      setOrders([
        {
          id: '1',
          symbol: 'RELIANCE',
          name: 'Reliance Industries',
          type: 'buy',
          quantity: 10,
          price: 2400,
          total: 24000,
          status: 'completed',
          date: '2025-01-15T10:30:00Z'
        },
        {
          id: '2',
          symbol: 'TCS',
          name: 'Tata Consultancy Services',
          type: 'sell',
          quantity: 5,
          price: 3250,
          total: 16250,
          status: 'completed',
          date: '2025-01-14T14:20:00Z'
        },
        {
          id: '3',
          symbol: 'HDFC',
          name: 'HDFC Bank',
          type: 'buy',
          quantity: 15,
          price: 1680,
          total: 25200,
          status: 'pending',
          date: '2025-01-16T09:15:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.type === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400 bg-opacity-20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400 bg-opacity-20';
      case 'cancelled':
        return 'text-red-400 bg-red-400 bg-opacity-20';
      default:
        return 'text-gray-400 bg-gray-400 bg-opacity-20';
    }
  };

  const getTypeColor = (type) => {
    return type === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalBuyOrders = orders.filter(o => o.type === 'buy').length;
  const totalSellOrders = orders.filter(o => o.type === 'sell').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Order History</h1>
          <p className="text-xl text-blue-100">Track all your buy and sell transactions</p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Buy Orders</p>
            <p className="text-2xl font-bold text-green-400">{totalBuyOrders}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Sell Orders</p>
            <p className="text-2xl font-bold text-red-400">{totalSellOrders}</p>
          </div>
          <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-600 border-opacity-30">
            <p className="text-sm font-medium text-gray-300 mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">{completedOrders}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-800 bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600 border-opacity-30 overflow-hidden">
          <div className="p-6 border-b border-gray-600 border-opacity-30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Transaction History</h2>
              <button
                onClick={fetchOrders}
                className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 text-white text-sm rounded-lg hover:bg-opacity-70 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            <div className="flex space-x-1">
              {['all', 'buy', 'sell'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white bg-gray-700 bg-opacity-30 hover:bg-opacity-50'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({filterType === 'buy' ? totalBuyOrders : totalSellOrders})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 bg-opacity-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No orders found</h3>
              <p className="text-gray-400 mb-6">Start trading to see your transaction history</p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Start Trading
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 bg-opacity-30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600 divide-opacity-30">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700 hover:bg-opacity-20 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{order.symbol}</div>
                          <div className="text-sm text-gray-400">{order.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium uppercase ${getTypeColor(order.type)}`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm text-white">₹{order.price?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-white">₹{order.total?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatDate(order.date)}</td>
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

export default Orders;
