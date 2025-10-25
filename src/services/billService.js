import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, AlertCircle, Search, Filter, Download, Printer, X, User, Package } from 'lucide-react';
import { useSelector } from 'react-redux';

const ManageBills = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stats, setStats] = useState({
    totalBills: 0,
    todayBills: 0,
    monthlyBills: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: '', name: '', quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    totalAmount: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    paidAmount: 0,
    dueAmount: 0,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  // Get products from Redux store
  const reduxProducts = useSelector((state) => state.products?.items || []);

  // Fetch customers and bills from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch customers
      const customersResponse = await fetch('http://localhost:5000/api/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const customersData = await customersResponse.json();
      setCustomers(customersData.customers || []);
      setFilteredCustomers(customersData.customers || []);
      // Fetch bills
      const billsResponse = await fetch('http://localhost:5000/api/bills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const billsData = await billsResponse.json();
      setBills(billsData.bills || []);
      setFilteredBills(billsData.bills || []);
      // Set products from Redux store
      setProducts(reduxProducts);
      setFilteredProducts(reduxProducts);
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().getMonth();
      const todayBills = billsData.bills.filter(bill =>
        new Date(bill.billDate).toISOString().split('T')[0] === today
      );
      const monthlyBills = billsData.bills.filter(bill =>
        new Date(bill.billDate).getMonth() === thisMonth
      );
      // FIXED: Only include bills with pending or partial payment status
      const pendingPayments = billsData.bills
        .filter(bill => bill.paymentStatus !== 'paid')
        .reduce((sum, bill) => sum + (bill.dueAmount || 0), 0);
      const totalRevenue = billsData.bills.reduce((sum, bill) =>
        sum + (bill.totalAmount || 0), 0
      );
      setStats({
        totalBills: billsData.bills.length,
        todayBills: todayBills.length,
        monthlyBills: monthlyBills.length,
        pendingPayments,
        totalRevenue
      });
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [reduxProducts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter bills based on search and filters
  useEffect(() => {
    let filtered = bills;
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.paymentStatus === statusFilter);
    }
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.billDate);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return billDate >= startDate && billDate <= endDate;
      });
    }
    setFilteredBills(filtered);
  }, [bills, searchTerm, statusFilter, dateRange]);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, customerSearchTerm]);

  // Filter products based on search
  useEffect(() => {
    if (productSearchTerm) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, productSearchTerm]);

  // Add customer to bill
  const selectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone
    });
    setShowCustomerSelector(false);
    setCustomerSearchTerm('');
  };

  // Add product to bill items
  const selectProduct = (product, index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      productId: product._id,
      name: product.name,
      quantity: 1,
      price: product.price,
      total: product.price
    };
    setFormData({ ...formData, items: updatedItems });
    setShowProductSelector(false);
    setProductSearchTerm('');
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    if (field === 'quantity' || field === 'price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', name: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  // Calculate totals whenever items, tax, or discount change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalAmount = subtotal + (formData.taxAmount || 0) - (formData.discount || 0);
    const dueAmount = totalAmount - (formData.paidAmount || 0);
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
      dueAmount
    }));
  }, [formData.items, formData.taxAmount, formData.discount, formData.paidAmount]);

  // Handle form submission for create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Validate form
      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }
      if (formData.items.some(item => !item.productId || item.quantity <= 0)) {
        throw new Error('Please add valid products to the bill');
      }

      // Prepare bill data
      const billData = {
        customerId: formData.customerId,
        items: formData.items,
        subtotal: formData.subtotal,
        taxAmount: formData.taxAmount,
        discount: formData.discount,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        paidAmount: formData.paidAmount,
        dueAmount: formData.dueAmount,
        billDate: formData.billDate,
        dueDate: formData.dueDate,
        notes: formData.notes
      };

      let response;
      let data;

      if (modalMode === 'create') {
        // Send to API for creation
        response = await fetch('http://localhost:5000/api/bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(billData)
        });
        data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create bill');
        }
        setSuccess('Bill created successfully!');
      } else if (modalMode === 'edit' && selectedBill) {
        // Send to API for update
        response = await fetch(`http://localhost:5000/api/bills/${selectedBill._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(billData)
        });
        data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update bill');
        }
        setSuccess('Bill updated successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData(); // Refresh bills list
    } catch (err) {
      setError(err.message);
    }
  };

  // Print functionality
  const handlePrint = (bill) => {
    const printWindow = window.open('', '_blank');
    const customer = bill.customerId;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #333; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .customer-info, .invoice-info { width: 45%; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.final { border-top: 2px solid #333; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Your Company Name</div>
            <div>123 Business Street, City, State - 123456</div>
            <div>Phone: (555) 123-4567 | Email: info@company.com</div>
          </div>
          <div class="invoice-details">
            <div class="customer-info">
              <h3>Bill To:</h3>
              <div><strong>${customer.name}</strong></div>
              <div>${customer.email}</div>
              <div>${customer.phone || ''}</div>
            </div>
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <div><strong>Invoice #:</strong> ${bill.billNumber}</div>
              <div><strong>Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}</div>
              <div><strong>Payment Status:</strong> ${bill.paymentStatus.toUpperCase()}</div>
              <div><strong>Payment Method:</strong> ${bill.paymentMethod.toUpperCase()}</div>
            </div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${bill.subtotal.toLocaleString()}</span>
            </div>
            ${bill.taxAmount > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>₹${bill.taxAmount.toLocaleString()}</span>
            </div>
            ` : ''}
            ${bill.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>₹${bill.discount.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="total-row final">
              <span>Total:</span>
              <span>₹${bill.totalAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Paid:</span>
              <span>₹${bill.paidAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Due:</span>
              <span>₹${bill.dueAmount.toLocaleString()}</span>
            </div>
          </div>
          ${bill.notes ? `
            <div style="margin-top: 20px;">
              <strong>Notes:</strong>
              <div style="margin-top: 5px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
                ${bill.notes}
              </div>
            </div>
          ` : ''}
          <div class="footer">
            <div>Thank you for your business!</div>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">
              This is a computer-generated invoice.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Download as PDF functionality (using browser's print to PDF)
  const handleDownload = (bill) => {
    handlePrint(bill); // Users can use browser's "Save as PDF" option
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ productId: '', name: '', quantity: 1, price: 0, total: 0 }],
      subtotal: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: 0,
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAmount: 0,
      dueAmount: 0,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
    setSelectedBill(null);
    setModalMode('create');
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  // New function to open the modal for editing
  const openEditModal = (bill) => {
    // Populate formData with the selected bill's data
    setFormData({
      customerId: bill.customerId?._id || '',
      customerName: bill.customerId?.name || '',
      customerEmail: bill.customerId?.email || '',
      customerPhone: bill.customerId?.phone || '',
      items: bill.items.map(item => ({ ...item })), // Ensure deep copy if needed
      subtotal: bill.subtotal || 0,
      taxAmount: bill.taxAmount || 0,
      discount: bill.discount || 0,
      totalAmount: bill.totalAmount || 0,
      paymentStatus: bill.paymentStatus || 'pending',
      paymentMethod: bill.paymentMethod || 'cash',
      paidAmount: bill.paidAmount || 0,
      dueAmount: bill.dueAmount || 0,
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
      notes: bill.notes || ''
    });
    setSelectedBill(bill);
    setModalMode('edit');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bill Management</h1>
        <p className="text-gray-600">Create, manage, and track customer bills with integrated product pricing</p>
      </div>
      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Bills</h3>
              <p className="text-xl font-bold text-blue-600">{stats.totalBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Today</h3>
              <p className="text-xl font-bold text-green-600">{stats.todayBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">This Month</h3>
              <p className="text-xl font-bold text-purple-600">{stats.monthlyBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-xl font-bold text-yellow-600">₹{stats.pendingPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-xl font-bold text-indigo-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                placeholder="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                placeholder="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Add Bill Button */}
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Bill
          </button>
        </div>
      </div>
      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bill.customerId?.name}</div>
                      <div className="text-sm text-gray-500">{bill.customerId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(bill.billDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        ₹{bill.totalAmount?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : bill.paymentStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(bill)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(bill)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(bill)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create/Edit Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{modalMode === 'edit' ? 'Edit Bill' : 'Create New Bill'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer *</label>
                  {formData.customerId ? (
                    <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                      <div className="font-medium">{formData.customerName}</div>
                      <div className="text-sm text-gray-600">{formData.customerEmail}</div>
                      <div className="text-sm text-gray-600">{formData.customerPhone}</div>
                      {/* Prevent changing customer during edit */}
                      {modalMode === 'create' && (
                        <button
                          type="button"
                          onClick={() => setShowCustomerSelector(true)}
                          className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                        >
                          Change Customer
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomerSelector(true)}
                      className="mt-1 w-full px-4 py-2 border border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Select Customer
                    </button>
                  )}
                </div>
                {/* Bill Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Date *</label>
                  <input
                    type="date"
                    value={formData.billDate}
                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-700">Product *</label>
                        {item.productId ? (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowProductSelector(true);
                                setSelectedProductIndex(index);
                              }}
                              className="text-blue-600 text-sm hover:text-blue-800"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProductSelector(true);
                              setSelectedProductIndex(index);
                            }}
                            className="w-full px-2 py-1 border border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-500 hover:text-blue-600 text-sm flex items-center justify-center"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Select Product
                          </button>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          min="1"
                          required
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Price (₹)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          required
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Total (₹)</label>
                        <input
                          type="text"
                          value={item.total.toLocaleString()}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900 text-sm p-1"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
                {/* Totals */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{formData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tax (₹):</span>
                      <input
                        type="number"
                        value={formData.taxAmount}
                        onChange={(e) => setFormData({ ...formData, taxAmount: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Discount (₹):</span>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                      />
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">₹{formData.totalAmount.toLocaleString()}</span>
                    </div>
                    {/* Payment Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Payment Status:</span>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Payment Method:</span>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Paid Amount (₹):</span>
                        <input
                          type="number"
                          value={formData.paidAmount}
                          onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Due Amount:</span>
                        <span className="font-medium">₹{formData.dueAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {modalMode === 'edit' ? 'Update Bill' : 'Create Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Select Customer</h3>
              <button
                onClick={() => setShowCustomerSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  onClick={() => selectCustomer(customer)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 capitalize">{customer.customerType}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Select Product</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => selectProduct(product, selectedProductIndex)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">₹{product.price.toLocaleString()}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        (product.quantity || 0) === 0
                          ? 'bg-red-100 text-red-800'
                          : (product.quantity || 0) <= 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.quantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Bill Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePrint(selectedBill)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => handleDownload(selectedBill)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                      <p className="text-sm text-gray-900">{selectedBill.billNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bill Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedBill.billDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBill.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : selectedBill.paymentStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedBill.paymentStatus.charAt(0).toUpperCase() + selectedBill.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedBill.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedBill.customerId.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedBill.customerId.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedBill.customerId.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedBill.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedBill.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                      <p className="text-sm text-gray-900">{selectedBill.notes}</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{selectedBill.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedBill.taxAmount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">₹{selectedBill.taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedBill.discount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium">₹{selectedBill.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">₹{selectedBill.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Paid:</span>
                      <span className="font-medium">₹{selectedBill.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Due:</span>
                      <span className="font-medium">₹{selectedBill.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBills;