import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    return order.type === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EXECUTED':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-danger" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Track your trading history</p>
        </div>
        <div className="flex space-x-2">
          {['ALL', 'BUY', 'SELL'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Your trading history will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Date & Time</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Quantity</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Price</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="text-sm">
                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium">{order.symbol}</div>
                      <div className="text-sm text-gray-600">{order.companyName}</div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.type === 'BUY' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="text-right py-4 font-medium">{order.quantity}</td>
                    <td className="text-right py-4">₹{order.price.toFixed(2)}</td>
                    <td className="text-right py-4 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span className="text-sm">{order.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
