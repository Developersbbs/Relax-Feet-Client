import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/features/auth/loginSlice';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, AlertCircle, Search, Filter, Download, Printer, X, User, Package } from 'lucide-react';

const customerFormInitialState = {
  name: '',
  email: '',
  phone: '',
  customerType: 'individual',
};

const ManageBills = () => {
  const user = useSelector(selectUser);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalBills: 0,
    monthlyBills: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState(() => ({ ...customerFormInitialState }));
  const [customerFormError, setCustomerFormError] = useState('');
  const [customerFormSubmitting, setCustomerFormSubmitting] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: '', serviceId: '', name: '', quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
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

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('https://relax-feet-server.onrender.com/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    }
  }, []);

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('https://relax-feet-server.onrender.com/api/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();
      setServices(data.services || []);
      setFilteredServices(data.services || []);
      return data.services || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again later.');
      return [];
    }
  }, []);

  // Fetch customers, bills, and products from API
  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      // Fetch customers
      const customersResponse = await fetch('https://relax-feet-server.onrender.com/api/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!customersResponse.ok) {
        throw new Error(`Failed to fetch customers: ${customersResponse.status}`);
      }
      
      const customersData = await customersResponse.json();
      setCustomers(customersData.customers || []);
      setFilteredCustomers(customersData.customers || []);

      // Fetch bills with pagination
      const billsResponse = await fetch(`https://relax-feet-server.onrender.com/api/bills?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!billsResponse.ok) {
        throw new Error(`Failed to fetch bills: ${billsResponse.status}`);
      }
      
      const billsData = await billsResponse.json();

      // Update bills and pagination state
      const billsList = billsData.bills || [];
      setBills(billsList);
      setFilteredBills(billsList);
      setPagination({
        currentPage: billsData.currentPage || page,
        itemsPerPage: billsData.limit || limit,
        totalPages: billsData.totalPages || 0,
        totalItems: billsData.total || 0
      });

      // Fetch products and services
      await Promise.all([fetchProducts(), fetchServices()]);

      // Calculate stats from current page bills
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().getMonth();
      const todayBills = billsData.bills.filter(bill =>
        bill.billDate && new Date(bill.billDate).toISOString().split('T')[0] === today
      );
      const monthlyBills = billsData.bills.filter(bill =>
        bill.billDate && new Date(bill.billDate).getMonth() === thisMonth
      );
      const pendingPayments = billsData.bills
        .filter(bill => bill.paymentStatus !== 'paid')
        .reduce((sum, bill) => sum + (bill.dueAmount || 0), 0);
      const totalRevenue = billsData.bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      
      // Update stats state
      setStats({
        totalBills: billsData.total || 0,
        todayBills: todayBills.length,
        monthlyBills: monthlyBills.length,
        pendingPayments,
        totalRevenue
      });
      
   } catch (error) {
     console.error('Error fetching data:', error);
     setStats({
       totalBills: 0,
       todayBills: 0,
       monthlyBills: 0,
       pendingPayments: 0,
       totalRevenue: 0
     });
     setError(error.message);
   } finally {
     setLoading(false);
   }
  }, [fetchProducts, fetchServices]);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchData(pagination.currentPage, pagination.itemsPerPage);
    }
  }, [fetchData, pagination.currentPage, pagination.itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1
    }));
  };

  // Filter customers based on search term
  useEffect(() => {
    if (customerSearchTerm.trim() === '') {
      setFilteredCustomers(customers || []);
    } else {
      const searchTerm = customerSearchTerm.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm) ||
        customer.customerType?.toLowerCase().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearchTerm, customers]);

  // Filter bills based on search and filters
  useEffect(() => {
    let filtered = [...bills];
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerId?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone
    }));
    setShowCustomerSelector(false);
    setCustomerSearchTerm('');
  };

  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetCustomerForm = () => {
    setCustomerFormData(() => ({ ...customerFormInitialState }));
    setCustomerFormError('');
    setCustomerFormSubmitting(false);
  };

  const openCustomerSelector = () => {
    setCustomerSearchTerm('');
    setShowCustomerSelector(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (customerFormSubmitting) return;

    const trimmedPayload = {
      name: customerFormData.name.trim(),
      email: customerFormData.email.trim(),
      phone: customerFormData.phone.trim(),
      customerType: customerFormData.customerType,
      status: 'active'
    };

    if (!trimmedPayload.name || !trimmedPayload.email || !trimmedPayload.phone) {
      setCustomerFormError('Name, email, and phone are required.');
      return;
    }

    setCustomerFormError('');
    setCustomerFormSubmitting(true);

    try {
      const response = await fetch('https://relax-feet-server.onrender.com/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(trimmedPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create customer');
      }

      const newCustomer = data.customer;
      if (!newCustomer?._id) {
        throw new Error('Unexpected server response while creating customer.');
      }

      const updatedCustomers = [newCustomer, ...customers];
      setCustomers(updatedCustomers);
      resetCustomerForm();
      selectCustomer(newCustomer, updatedCustomers);
    } catch (error) {
      setCustomerFormError(error.message || 'Failed to create customer. Please try again.');
    } finally {
      setCustomerFormSubmitting(false);
    }
  };

  // Filter products and services based on search term
  useEffect(() => {
    if (productSearchTerm.trim() === '') {
      setFilteredProducts(products || []);
      setFilteredServices(services);
    } else {
      const searchTerm = productSearchTerm.toLowerCase();
      const filteredProds = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        (typeof product.category === 'object' ? product.category?.name : product.category)?.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm)
      );
      const filteredServs = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm) ||
        service.category?.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(filteredProds);
      setFilteredServices(filteredServs);
    }
  }, [productSearchTerm, products, services]);

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

  const selectService = (service, index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      serviceId: service._id,
      name: service.name,
      quantity: 1, // Services always have quantity 1
      price: service.price,
      total: service.price
    };
    setFormData({ ...formData, items: updatedItems });
    setShowProductSelector(false);
    setProductSearchTerm('');
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[index];

    // For services, quantity should always be 1 and price shouldn't be changed
    if (currentItem.serviceId) {
      if (field === 'quantity') {
        // Services always have quantity 1, ignore changes
        return;
      }
      if (field === 'price') {
        // Don't allow price changes for services
        return;
      }
    }

    updatedItems[index][field] = value;
    if (field === 'quantity' || field === 'price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', serviceId: '', name: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const openProductSelector = (index) => {
    setSelectedProductIndex(index);
    setProductSearchTerm('');
    setShowProductSelector(true);
  };

  // Calculate totals with PERCENTAGE-based discount and tax
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discountAmount = (subtotal * (formData.discountPercent || 0)) / 100;
    const taxableAmount = Math.max(subtotal - discountAmount, 0);
    const taxAmount = (taxableAmount * (formData.taxPercent || 0)) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const dueAmount = Math.max(totalAmount - (formData.paidAmount || 0), 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      dueAmount
    }));
  }, [formData.items, formData.discountPercent, formData.taxPercent, formData.paidAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // Prevent multiple clicks during loading
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }
      if (formData.items.some(item => !item.productId && !item.serviceId)) {
        throw new Error('Please add valid products or services to the bill');
      }

      const billData = {
        customerId: formData.customerId,
        items: formData.items,
        subtotal: formData.subtotal,
        discountPercent: formData.discountPercent,
        taxPercent: formData.taxPercent,
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
      if (modalMode === 'create') {
        response = await fetch('https://relax-feet-server.onrender.com/api/bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(billData)
        });
      } else if (modalMode === 'edit' && selectedBill) {
        response = await fetch(`https://relax-feet-server.onrender.com/api/bills/${selectedBill._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(billData)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${modalMode} bill`);
      }

      setSuccess(`Bill ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to process the bill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = (bill) => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups for this site to print bills');
        return;
      }

      const customer = bill.customerId;
      const htmlContent = `
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
              .total-row { display: flex; justify-between; padding: 5px 0; }
              .total-row.final { border-top: 2px solid #333; font-weight: bold; font-size: 18px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Relax Feet</div>
              <div>10, Padi Pudhu Nagar Main Rd, Pudhu Nagar, Anna Nagar West, Anna Nagar West Extension, Chennai, Tamil Nadu 600101</div>
              <div>Phone: 9585274079 | Email: info@relaxfeet.com</div>
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
              ${bill.discountPercent > 0 ? `
              <div class="total-row">
                <span>Discount (${bill.discountPercent}%):</span>
                <span>₹${((bill.subtotal * bill.discountPercent) / 100).toLocaleString()}</span>
              </div>
              ` : ''}
              ${bill.taxPercent > 0 ? `
              <div class="total-row">
                <span>Tax (${bill.taxPercent}%):</span>
                <span>₹${bill.taxAmount.toLocaleString()}</span>
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
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Close after printing
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

      // Fallback for browsers that don't support onload
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }
      }, 500);

    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print bill. Please try again or use browser print option.');
    }
  };

  const handleDownload = (bill) => {
    try {
      const customer = bill.customerId;
      const htmlContent = `
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
              .total-row { display: flex; justify-between; padding: 5px 0; }
              .total-row.final { border-top: 2px solid #333; font-weight: bold; font-size: 18px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Shree Sai Engineering</div>
              <div>4/12, Karambakkam, Devi Nagar, Porur, Chennai, Tamil Nadu 600116</div>
              <div>Phone: 93442 96658 | Email: info@shreesaiepoxy.com</div>
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
              ${bill.discountPercent > 0 ? `
              <div class="total-row">
                <span>Discount (${bill.discountPercent}%):</span>
                <span>₹${((bill.subtotal * bill.discountPercent) / 100).toLocaleString()}</span>
              </div>
              ` : ''}
              ${bill.taxPercent > 0 ? `
              <div class="total-row">
                <span>Tax (${bill.taxPercent}%):</span>
                <span>₹${bill.taxAmount.toLocaleString()}</span>
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
      `;

      // Create blob and download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bill.billNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download bill. Please try the print option instead.');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ productId: '', serviceId: '', name: '', quantity: 1, price: 0, total: 0 }],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
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

  const openEditModal = (bill) => {
    setFormData({
      customerId: bill.customerId?._id || '',
      customerName: bill.customerId?.name || '',
      customerEmail: bill.customerId?.email || '',
      customerPhone: bill.customerId?.phone || '',
      items: bill.items.map(item => ({ ...item })),
      subtotal: bill.subtotal || 0,
      discountPercent: bill.discountPercent || 0,
      discountAmount: bill.discount || bill.discountAmount || 0,
      taxPercent: bill.taxPercent || 0,
      taxAmount: bill.taxAmount || 0,
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bill Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Create, manage, and track customer bills with integrated product pricing</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-[#720000] mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bills</h3>
              <p className="text-xl font-bold text-[#720000] dark:text-[#8a1a1a]">{stats.totalBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</h3>
              <p className="text-xl font-bold text-green-600 dark:text-green-500">{stats.todayBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</h3>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-500">{stats.monthlyBills}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">₹{stats.pendingPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-500">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="self-center text-gray-600 dark:text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-[#720000] hover:bg-[#8a1a1a] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Bill
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No bills found</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{bill.billNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{bill.customerId?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{bill.customerId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{new Date(bill.billDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">₹{bill.totalAmount?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {user?.role === 'superadmin' && (
                          <button onClick={() => openEditModal(bill)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-500 dark:hover:text-yellow-400 p-1 rounded transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handlePrint(bill)} className="text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400 p-1 rounded transition-colors" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownload(bill)} className="text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-400 p-1 rounded transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelectedBill(bill)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded transition-colors" title="View">
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-4 rounded-lg shadow-md transition-colors duration-300">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700 dark:text-gray-300">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={pagination.itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="hidden sm:flex">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNumber > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pageNumber === pagination.currentPage
                        ? 'z-10 bg-[#f8e6e6] border-[#720000] text-[#720000] dark:bg-[#3d0000] dark:border-[#720000] dark:text-[#8a1a1a]'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Create/Edit Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{modalMode === 'edit' ? 'Edit Bill' : 'Create New Bill'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer *</label>
                  {formData.customerId ? (
                    <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
                      <div className="font-medium text-gray-900 dark:text-white">{formData.customerName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formData.customerEmail}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formData.customerPhone}</div>
                      {modalMode === 'create' && (
                        <button type="button" onClick={openCustomerSelector} className="mt-2 text-[#720000] dark:text-[#8a1a1a] text-sm hover:text-[#8a1a1a] dark:hover:text-[#8a1a1a]">
                          Change Customer
                        </button>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={openCustomerSelector} className="mt-1 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-[#720000] hover:text-[#720000] dark:hover:text-orange-500 flex items-center justify-center bg-white dark:bg-gray-700">
                      <User className="w-5 h-5 mr-2" />
                      Select Customer
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bill Date *</label>
                  <input 
                    type="date" 
                    value={formData.billDate} 
                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })} 
                    required 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                  <button type="button" onClick={addItem} className="text-sm bg-[#720000] text-white px-3 py-1 rounded hover:bg-[#8a1a1a]">
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Product/Service *</label>
                        {item.productId || item.serviceId ? (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                            <button type="button" onClick={() => { setShowProductSelector(true); setSelectedProductIndex(index); }} className="text-[#720000] dark:text-[#8a1a1a] text-sm hover:text-[#8a1a1a] dark:hover:text-[#8a1a1a]">
                              Change
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setShowProductSelector(true); setSelectedProductIndex(index); }} className="w-full px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:border-[#720000] hover:text-[#720000] dark:hover:text-orange-500 text-sm flex items-center justify-center bg-white dark:bg-gray-600">
                            <Package className="w-4 h-4 mr-1" />
                            Select Product/Service
                          </button>
                        )}
                      </div>
                      <div className="col-span-2">
                        {item.productId ? (
                          <>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              min="1"
                              required
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            />
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400 py-2">Service</div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                        {item.serviceId ? (
                          <div className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-500 text-gray-900 dark:text-white">
                            {item.price.toLocaleString()}
                          </div>
                        ) : (
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                            min="0"
                            step="0.01"
                            required
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Total (₹)</label>
                        <input 
                          type="text" 
                          value={item.total.toLocaleString()} 
                          readOnly 
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-500 text-gray-900 dark:text-white" 
                        />
                      </div>
                      <div className="col-span-1">
                        <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 text-sm p-1" disabled={formData.items.length === 1}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea 
                    rows="3" 
                    value={formData.notes} 
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    placeholder="Additional notes..." 
                  />
                </div>
                <div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{formData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Tax (%):</span>
                      <input 
                        type="number" 
                        value={formData.taxPercent} 
                        onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })} 
                        min="0" 
                        max="100" 
                        step="0.01" 
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-600 text-gray-900 dark:text-white" 
                      />
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Discount (%):</span>
                      <input 
                        type="number" 
                        value={formData.discountPercent} 
                        onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} 
                        min="0" 
                        max="100" 
                        step="0.01" 
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-600 text-gray-900 dark:text-white" 
                      />
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                      <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{formData.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                        <select 
                          value={formData.paymentStatus} 
                          onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} 
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                        <select 
                          value={formData.paymentMethod} 
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} 
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Paid Amount (₹):</span>
                        <input 
                          type="number" 
                          value={formData.paidAmount} 
                          onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })} 
                          min="0" 
                          step="0.01" 
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-600 text-gray-900 dark:text-white" 
                        />
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Due Amount:</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹{formData.dueAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-[#720000] hover:bg-[#8a1a1a] text-white focus:ring-amber-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{modalMode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      modalMode === 'edit' ? 'Update Bill' : 'Create Bill'
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Customer</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowCustomerForm(prev => {
                      const next = !prev;
                      if (!next) {
                        resetCustomerForm();
                      } else {
                        setCustomerFormError('');
                      }
                      return next;
                    });
                  }}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {showCustomerForm ? 'Cancel' : 'Add Customer'}
                </button>
                <button onClick={() => { setShowCustomerSelector(false); resetCustomerForm(); }} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  value={customerSearchTerm} 
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
            {showCustomerForm && (
              <div className="mb-4 border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                {customerFormError && (
                  <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded">
                    {customerFormError}
                  </div>
                )}
                <form onSubmit={handleCreateCustomer} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={customerFormData.name}
                        onChange={handleCustomerFormChange}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={customerFormData.email}
                        onChange={handleCustomerFormChange}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerFormData.phone}
                        onChange={handleCustomerFormChange}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Customer Type</label>
                      <select
                        name="customerType"
                        value={customerFormData.customerType}
                        onChange={handleCustomerFormChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="individual">Individual</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetCustomerForm();
                        setShowCustomerForm(false);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={customerFormSubmitting}
                      className={`px-4 py-2 rounded-md text-white ${
                        customerFormSubmitting
                          ? 'bg-orange-400 cursor-not-allowed opacity-80'
                          : 'bg-[#720000] hover:bg-[#8a1a1a] transition-colors'
                      }`}
                    >
                      {customerFormSubmitting ? 'Creating...' : 'Create Customer'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} onClick={() => selectCustomer(customer)} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{customer.customerType}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {customer.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No customers found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product/Service Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Product or Service</h3>
              <button onClick={() => setShowProductSelector(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products and services..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#720000] focus:border-[#720000] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Products */}
              {filteredProducts.map((product) => (
                <div key={`product-${product._id}`} onClick={() => selectProduct(product, selectedProductIndex)} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{typeof product.category === 'object' ? product.category?.name : product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-500">₹{product.price.toLocaleString()}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${(product.quantity || 0) === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : (product.quantity || 0) <= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                        Stock: {product.quantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Services */}
              {filteredServices.map((service) => (
                <div key={`service-${service._id}`} onClick={() => selectService(service, selectedProductIndex)} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{service.category}</div>
                      {service.duration && <div className="text-xs text-gray-400 dark:text-gray-500">Duration: {service.duration}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-500">₹{service.price.toLocaleString()}</div>
                      <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Service
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && filteredServices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No products or services found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && !showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bill Details</h2>
              <div className="flex space-x-2">
                <button onClick={() => handlePrint(selectedBill)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button onClick={() => handleDownload(selectedBill)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bill Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bill Number</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBill.billNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bill Date</label>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedBill.billDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : selectedBill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {selectedBill.paymentStatus.charAt(0).toUpperCase() + selectedBill.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedBill.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBill.customerId?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBill.customerId?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBill.customerId?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedBill.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedBill.notes ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBill.notes}</p>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-sm italic">No notes available</div>
                  )}
                </div>
                <div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{selectedBill.subtotal.toLocaleString()}</span>
                    </div>
                    {selectedBill.discountPercent > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Discount ({selectedBill.discountPercent}%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹{((selectedBill.subtotal * selectedBill.discountPercent) / 100).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedBill.taxPercent > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">Tax ({selectedBill.taxPercent}%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹{selectedBill.taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                      <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{selectedBill.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{selectedBill.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Due:</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{selectedBill.dueAmount.toLocaleString()}</span>
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