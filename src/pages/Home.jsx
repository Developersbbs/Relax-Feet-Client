import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/features/auth/loginSlice';
import {
  Package, Users, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown,
  DollarSign, Activity, UserPlus, FileText, Bell, Settings,
  Calendar, Clock, CheckCircle, XCircle, Eye, Edit, Trash2
} from 'lucide-react';
import productService from '../services/productService';
import billApiService from '../services/billApiService';
import customerService from '../services/customerService';

const Home = () => {
  const user = useSelector(selectUser);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const formatCategory = (category) => {
    if (!category) return 'No Category';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      if (category.name) return category.name;
      if (category.label) return category.label;
    }
    return 'No Category';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data based on user role
      const role = user?.role?.toLowerCase();
      let data = {};

      if (role === 'superadmin') {
        data = await fetchSuperAdminData();
      } else if (role === 'stockmanager') {
        data = await fetchStockManagerData();
      } else if (role === 'billcounter') {
        data = await fetchBillCounterData();
      }

      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperAdminData = async () => {
    try {
      const [products, customers, bills, stats] = await Promise.all([
        productService.getAllProducts(),
        customerService.getAllCustomers(),
        billApiService.getAllBills(),
        productService.getProductStats()
      ]);

      return {
        products: products.products || products,
        customers: customers.customers || customers,
        bills: bills.bills || bills,
        stats: stats || productService.calculateStats(products.products || products),
        recentBills: (bills.bills || bills).slice(0, 5),
        recentCustomers: (customers.customers || customers).slice(0, 5),
        lowStockProducts: (products.products || products).filter(p => p.quantity > 0 && p.quantity <= 10)
      };
    } catch (error) {
      return {};
    }
  };

  const fetchStockManagerData = async () => {
    try {
      const [products, categories, lowStock] = await Promise.all([
        productService.getAllProducts(),
        productService.getCategories(),
        productService.getLowStockProducts()
      ]);

      const productsData = products.products || products;
      
      return {
        products: productsData,
        categories: categories.categories || [],
        lowStockProducts: lowStock.products || productsData.filter(p => p.quantity > 0 && p.quantity <= 10),
        stats: productService.calculateStats(productsData),
        outOfStockProducts: productsData.filter(p => p.quantity === 0)
      };
    } catch (error) {
      return {};
    }
  };

  const fetchBillCounterData = async () => {
    try {
      const [customers, bills] = await Promise.all([
        customerService.getAllCustomers(),
        billApiService.getAllBills()
      ]);

      return {
        customers: customers.customers || customers,
        bills: bills.bills || bills,
        recentBills: (bills.bills || bills).slice(0, 10),
        pendingPayments: (bills.bills || bills).filter(bill => bill.paymentStatus !== 'paid')
      };
    } catch (error) {
      return {};
    }
  };

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-lg sm:text-xl opacity-90">Super Admin Dashboard - Full System Overview</p>
        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Last updated: {new Date().toLocaleTimeString()}</span>
          <span className="flex items-center"><Activity className="w-4 h-4 mr-1" /> System Status: Active</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.stats?.total || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.customers?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.bills?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Bills</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">₹{(dashboardData.stats?.totalValue || 0).toLocaleString()}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Inventory Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2" />
          Stock Alerts ({dashboardData.lowStockProducts?.length || 0})
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {dashboardData.lowStockProducts?.slice(0, 5).map((product, index) => (
            <div key={product._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mr-2 sm:mr-3" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Category: {formatCategory(product.category)}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-900 dark:text-slate-100">Qty: {product.quantity}</p>
                <p className="text-xs sm:text-sm text-yellow-600">Low Stock Alert</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Bills</h3>
          <div className="space-y-3">
            {dashboardData.recentBills?.slice(0, 5).map((bill, index) => (
              <div key={bill._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100 truncate">Bill #{bill.billNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 truncate">{bill.customerName}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">₹{bill.totalAmount?.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Customers</h3>
          <div className="space-y-3">
            {dashboardData.recentCustomers?.slice(0, 5).map((customer, index) => (
              <div key={customer._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{customer.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 truncate">{customer.email}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  customer.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-slate-300'
                }`}>
                  {customer.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStockManagerDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-lg sm:text-xl opacity-90">Stock Manager Dashboard - Inventory Management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.stats?.total || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.stats?.lowStock || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Low Stock Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.stats?.outOfStock || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Out of Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.categories?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2" />
          Low Stock Alerts
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {dashboardData.lowStockProducts?.slice(0, 8).map((product, index) => (
            <div key={product._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mr-2 sm:mr-3" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Category: {formatCategory(product.category)} | Price: ₹{product.price}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-900 dark:text-slate-100">Qty: {product.quantity}</p>
                <p className="text-xs sm:text-sm text-yellow-600">Reorder Needed</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Add Product</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Add new products to inventory</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">View Products</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Browse and manage products</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Stock Reports</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">View detailed stock reports</p>
        </div>
      </div>
    </div>
  );

  const renderBillCounterDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-lg sm:text-xl opacity-90">Bill Counter Dashboard - Billing & Customer Management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.customers?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.bills?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Bills</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">
                ₹{dashboardData.bills?.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0).toLocaleString()}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600 mr-3 sm:mr-4" />
            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100">{dashboardData.pendingPayments?.length || 0}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 truncate">Pending Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
          Recent Bills
        </h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {dashboardData.recentBills?.slice(0, 10).map((bill, index) => (
            <div key={bill._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mr-2 sm:mr-3" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100 truncate">Bill #{bill.billNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 truncate">{bill.customerName} • {new Date(bill.billDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-900 dark:text-slate-100">₹{bill.totalAmount?.toLocaleString()}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {bill.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Add Customer</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Create new customer profile</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Create Bill</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Generate new bill for customer</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
          <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">View Customers</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">Browse customer database</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'superadmin' && renderSuperAdminDashboard()}
        {role === 'stockmanager' && renderStockManagerDashboard()}
        {role === 'billcounter' && renderBillCounterDashboard()}
        {!role && (
          <div className="text-center py-12 sm:py-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">Welcome to Inventory Management System</h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-400">Please log in to access your dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
