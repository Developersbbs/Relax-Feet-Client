import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiFilter, FiClock, FiDollarSign, FiLayers, FiTrendingUp, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const Services = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login?.user || null);
  const token = useSelector((state) => state.login?.token || null);

  // Services state
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRevenue: 0,
    avgPrice: 0,
    popularCategory: ''
  });

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: ""
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Calculate service statistics
  const calculateStats = (services) => {
    const totalServices = services.length;
    const totalRevenue = services.reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0);
    const avgPrice = totalServices > 0 ? (totalRevenue / totalServices).toFixed(2) : 0;
    
    // Find most popular category
    const categoryCounts = services.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {});
    
    const popularCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    setStats({
      totalServices,
      totalRevenue,
      avgPrice,
      popularCategory: popularCategory || 'N/A'
    });
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const servicesData = response.data.services || [];
      setServices(servicesData);
      calculateStats(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
    }
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      if (editingService) {
        await axios.put(`http://localhost:5000/api/services/${editingService._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/services', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service created successfully');
      }

      setShowModal(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save service';
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  // Handle edit
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: ""
    });
  };

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(services.map(service => service.category).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Services Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Overview and management of your services
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingService(null);
              resetForm();
            }}
            className="mt-4 md:mt-0 bg-[#720000] hover:bg-[#8a1a1a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <FiPlus className="w-5 h-5" />
            Add New Service
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Services Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Services</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalServices}</p>
                <p className="text-xs text-gray-500 mt-1">All time services</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FiLayers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">From all services</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Average Price Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Service Price</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">₹{stats.avgPrice}</p>
                <p className="text-xs text-gray-500 mt-1">Per service</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <FiTrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* Popular Category Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Popular Category</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">{stats.popularCategory}</p>
                <p className="text-xs text-gray-500 mt-1">Most booked</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FiCalendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service List</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category || 'Uncategorized'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#720000]"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5V6a2 2 0 00-2-2H8a2 2 0 00-2 2v3m8 0H8m8 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
                <p className="mb-4">Get started by adding your first service</p>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setEditingService(null);
                    resetForm();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-[#720000] hover:bg-[#8a1a1a] text-white rounded-lg transition-colors duration-200"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Service
                </button>
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</p>
              <p className="text-gray-500 dark:text-gray-400">Get started by adding your first service.</p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    {service.category && (
                      <span className="inline-block bg-[#f5e6e6] dark:bg-[#3d0000] text-[#720000] dark:text-[#ffb3b3] text-xs px-2 py-1 rounded-full mb-3">
                        {service.category}
                      </span>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Price:</span>
                        <span className="ml-2">₹{service.price}</span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2">{service.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="flex-1 bg-[#f8e6e6] dark:bg-[#3d0000] hover:bg-[#f0d6d6] dark:hover:bg-[#4a0000] text-[#720000] dark:text-[#ffb3b3] px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingService(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 30 mins"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-[#720000] hover:bg-[#8a1a1a] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
