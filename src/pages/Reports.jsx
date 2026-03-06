import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import instance from '../services/instance';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Reports = () => {
  const user = useSelector((state) => state.login?.user || null);
  const token = useSelector((state) => state.login?.token || null);

  // Reports state
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalBills: 0,
    totalRevenue: 0,
    totalServices: 0
  });

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch multiple stats in parallel
      const [customersRes, billsRes, servicesRes] = await Promise.all([
        instance.get('/customers').catch(() => ({ data: { customers: [] } })),
        instance.get('/bills').catch(() => ({ data: { bills: [] } })),
        instance.get('/services').catch(() => ({ data: { services: [] } }))
      ]);

      // Calculate stats
      const customers = customersRes.data.customers || [];
      const bills = billsRes.data.bills || [];
      const services = servicesRes.data.services || [];

      const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);

      setStats({
        totalCustomers: customers.length,
        totalBills: bills.length,
        totalRevenue,
        totalServices: services.length
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  // Report categories
  const reportCategories = [
    {
      title: 'Sales Reports',
      description: 'Analyze sales trends, revenue, and billing data',
      icon: '💰',
      path: '/manage-bill',
      color: 'bg-[#f0d6d6] dark:bg-[#0099CC]'
    },
    {
      title: 'Customer Reports',
      description: 'Customer analytics and management insights',
      icon: '👥',
      path: '/manage-customers',
      color: 'bg-[#f0d6d6] dark:bg-[#0099CC]'
    },
    {
      title: 'Service Reports',
      description: 'Track service offerings and performance',
      icon: '🔧',
      path: '/services',
      color: 'bg-[#f0d6d6] dark:bg-[#0099CC]'
    }
  ];

  return (
    <div className="p-6 bg-[#e0f5fb] dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reports Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive overview of your business performance and analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Total Customers */}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
                  </div>
                  <div className="bg-[#f0d6d6] dark:bg-[#0099CC] p-3 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#f0d6d6] dark:bg-[#0099CC] p-3 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bills</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBills}</p>
                  </div>
                  <div className="bg-[#f0d6d6] dark:bg-[#003d55] p-3 rounded-lg">
                    <span className="text-2xl">🧾</span>
                  </div>
                </div>
              </div>

              {/* Total Services */}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
                  </div>
                  <div className="bg-[#f0d6d6] dark:bg-[#0099CC] p-3 rounded-lg">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Report Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Report Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportCategories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${category.color} p-3 rounded-lg`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center text-[#0099CC] dark:text-[#b3e5fc] hover:text-[#007aa3] dark:hover:text-white text-sm font-medium transition-colors duration-200">
                  View Reports
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={fetchStats}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>

            <Link
              to="/manage-bill"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#007aa3] hover:bg-[#0099CC] text-white rounded-lg font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Bill
            </Link>

            {/* Removed: View Analytics (Stock Report) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
