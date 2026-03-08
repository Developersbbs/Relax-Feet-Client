import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/features/auth/loginSlice';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, DollarSign, AlertCircle, Search, Filter, Download, Printer, X, User, Activity, ChevronDown, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

const getInvoiceHTML = (bill, logoSrc = '/Asset 2.svg') => {
  const customer = bill.customerId || {};
  const branch = bill.branchId || {};
  const branchName = branch.name || 'HEALTH AND HEAL';
  const branchAddress = branch.address || 'No: 18, First Floor, Prakasam Street, Janaki Nagar, Valasaravakkam, Chennai - 600087.';
  const branchGst = branch.gstNumber || '33AAOFH2184C1ZL';
  const branchContact = branch.contactNumber || '9042716037';
  const branchEmail = branch.email || 'info@fettlehealthandheal.com';
  const branchWebsite = branch.website || 'www.fettlehealthandheal.com';
  const bankName = branch.bankDetails?.bankName || 'HDFC';
  const bankAccount = branch.bankDetails?.accountNumber || '50200108255392';
  const bankBranchName = branch.bankDetails?.branchBankName || 'VALASARAVAKKAM, Chennai - 600087';
  const bankIfsc = branch.bankDetails?.ifscCode || 'HDFC0000024';
  const bankUpi = branch.bankDetails?.upiId || 'healthandhealhh-1@okhdfcbank';

  const numToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' rupees';
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${bill.billNumber}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; font-size: 13px; color: #000; }
          .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 0; }
          .header-text { text-align: center; font-weight: bold; font-size: 18px; padding: 8px; border-bottom: 2px solid #000; text-transform: uppercase; }
          .top-header { border-bottom: 1px solid #000; padding: 10px 0; }
          .logo { width: 100%; display: block; height: auto; object-fit: contain; padding: 5px 0; }
          
          .info-row { display: flex; border-bottom: 1px solid #000; }
          .info-left, .info-right { width: 50%; padding: 8px 12px; }
          .info-right { border-left: 1px solid #000; }
          
          .bold { font-weight: bold; }
          .mt-5 { margin-top: 5px; }
          
          table { width: 100%; border-collapse: collapse; text-align: center; table-layout: fixed; }
          th, td { border: 1px solid #000; padding: 6px; word-wrap: break-word; }
          th { border-bottom: 2px solid #000; font-weight: bold; }
          
          .desc-cell { text-align: left; padding-left: 10px; vertical-align: top; height: 18rem; }
          .amount-cell { text-align: right; padding-right: 8px; font-weight: bold; vertical-align: top; }
          
          .footer-section { padding: 10px 12px; }
          .sign-box-outer { display: flex; justify-content: flex-end; margin-top: 15px; }
          .sign-box { border: 1px solid #000; width: 250px; text-align: center; height: 90px; position: relative; }
          
          .computer-gen { text-align: center; font-size: 11px; margin-top: 15px; max-width: 800px; margin-inline: auto; opacity: 0.8; }
          
          @media print { body { padding: 0; } .invoice-container { border-width: 2px; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header-text">TAX INVOICE</div>
          <div class="top-header">
            <img src="${logoSrc}" alt="Logo" class="logo" />
          </div>
          
          <div class="info-row">
            <div class="info-left">
              <div class="bold" style="font-size: 14px;">${branchName}</div>
              <div>${branchAddress}</div>
              <div class="bold mt-5">GSTIN: ${branchGst}</div>
              <div class="bold">Contact: ${branchContact}</div>
            </div>
            <div class="info-right">
              <div class="bold">BILL TO:</div>
              <div class="bold" style="font-size: 14px;">${customer?.name || ''}</div>
              ${customer?.address?.street ? `<div>${customer.address.street.toUpperCase()}</div>` : ''}
              ${customer?.address?.city || customer?.address?.zipCode ? `<div>${(customer?.address?.city || '').toUpperCase()} ${(customer?.address?.zipCode || '')}</div>` : ''}
              <div>${customer?.phone ? 'CONTACT: ' + customer.phone : customer?.email || ''}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-left">
              <div class="bold">Mail id: ${branchEmail}</div>
              <div class="bold">Website: ${branchWebsite}</div>
            </div>
            <div class="info-right">
              <div class="bold">INVOICE NO: ${bill?.billNumber || ''}</div>
              <div class="bold">INVOICE DATE : ${bill?.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB').replace(/\//g, '.') : ''}</div>
              <div class="bold">MODE OF PAYMENT: ${(bill?.paymentMethod || '').toUpperCase()}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 8%;">S.NO</th>
                <th style="width: 47%;">DESCRIPTION</th>
                <th style="width: 15%;">HSN</th>
                <th style="width: 15%;">RATE</th>
                <th style="width: 15%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${(bill?.items || []).map((item, index) => {
    const taxRate = bill?.taxPercent || 18;
    const sgst = bill?.taxPercent > 0 ? ((bill.taxAmount || 0) / 2).toFixed(2) : '0.00';
    const cgst = bill?.taxPercent > 0 ? ((bill.taxAmount || 0) / 2).toFixed(2) : '0.00';
    const subtotalItem = (item?.total || 0).toFixed(2);

    return `
                <tr>
                  <td style="vertical-align: top; padding-top: 15px; font-weight: bold;">${index + 1}</td>
                  <td class="desc-cell" style="padding-top: 15px;">
                    <div style="font-weight: bold;">${(item?.name || '').toUpperCase()}</div>
                    
                    <div style="margin-top: 60px; text-align: right; padding-right: 15px; font-weight: bold;">
                      <div>SGST ${taxRate / 2}%</div>
                      <div style="margin-top: 8px;">CGST ${taxRate / 2}%</div>
                      <div style="margin-top: 8px;">TOTAL GST ${taxRate}%</div>
                      <div style="margin-top: 40px;">ROUND OFF</div>
                    </div>
                  </td>
                  <td style="vertical-align: top; padding-top: 15px; font-weight: bold;">999315</td>
                  <td style="vertical-align: top; padding-top: 15px; font-weight: bold;">${subtotalItem}</td>
                  <td class="amount-cell" style="padding-top: 15px;">
                    <div>${subtotalItem}</div>
                    <div style="margin-top: 60px;">${sgst}</div>
                    <div style="margin-top: 8px;">${cgst}</div>
                    <div style="margin-top: 8px;">${(bill.taxAmount || 0).toFixed(2)}</div>
                    <div style="margin-top: 40px;">0.00</div>
                  </td>
                </tr>
                `;
  }).join('')}
              <tr>
                <td colspan="3" style="border-right: none;"></td>
                <td class="bold" style="text-align: right; padding-right: 10px;">GRAND TOTAL</td>
                <td class="bold" style="text-align: right; padding-right: 8px; font-size: 14px; background-color: #f9f9f9;">${(bill?.totalAmount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer-section">
            <div class="bold" style="font-size: 12px; margin-bottom: 10px;">Amount Chargeable (in words): <span style="text-transform: uppercase;">${numToWords(Math.floor(bill.totalAmount || 0))}</span> ONLY.</div>
            
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 55%;">
                <div class="bold" style="font-size: 12px; text-decoration: underline; margin-bottom: 5px;">Clinic Bank Details:</div>
                <div style="font-size: 12px;"><strong>Bank Name:</strong> ${bankName}</div>
                <div style="font-size: 12px;"><strong>A/c No:</strong> ${bankAccount}</div>
                <div style="font-size: 12px;"><strong>Branch:</strong> ${bankBranchName}</div>
                <div style="font-size: 12px;"><strong>IFSC CODE:</strong> ${bankIfsc}</div>
                <div style="font-size: 12px;"><strong>UPI ID:</strong> ${bankUpi}</div>
                
                <div style="margin-top: 15px; font-size: 11px; line-height: 1.4;">
                  <div class="bold">Declaration:</div>
                  We declare that this invoice shows the actual price of treatment and that all particulars are true and correct.
                </div>
              </div>
              
              <div style="width: 40%; text-align: right;">
                <div class="sign-box-outer">
                  <div class="sign-box">
                    <div style="font-size: 11px; font-weight: bold; margin-top: 8px;">FOR ${branchName}</div>
                    <div style="position: absolute; bottom: 8px; width: 100%; font-size: 11px; font-weight: bold; left: 0;">Authorised Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="computer-gen">This is computer generated invoice</div>
      </body>
    </html>
  `;
};

const customerFormInitialState = {
  name: '',
  email: '',
  phone: '',
  customerType: 'individual',
};

const ManageBills = () => {
  const invoiceRef = useRef(null);
  const user = useSelector(selectUser);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
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
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ serviceId: '', name: '', quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 0,
    totalAmount: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    paidAmount: '',
    dueAmount: 0,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    branchId: '',
    couponCode: '',
    couponDiscount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponData, setAppliedCouponData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });


  // Fetch services from API
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services`, {
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

  // Fetch customers, bills, and services from API
  const fetchData = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      // Fetch customers
      const customersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
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
      const billsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bills?page=${page}&limit=${limit}`, {
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

      // Fetch branches
      const branchesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/branches`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json();
        setBranches(branchesData.branches || branchesData || []);
      }

      // Fetch services
      await fetchServices();

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
  }, [fetchServices]);

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
    if (branchFilter !== 'all') {
      filtered = filtered.filter(bill => {
        const billBranchId = bill.branchId?._id || bill.branchId;
        return String(billBranchId) === String(branchFilter);
      });
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
  }, [bills, searchTerm, statusFilter, branchFilter, dateRange]);

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`, {
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

  // Filter services based on search term
  useEffect(() => {
    if (serviceSearchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const searchTerm = serviceSearchTerm.toLowerCase();
      const filteredServs = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm) ||
        service.category?.toLowerCase().includes(searchTerm)
      );
      setFilteredServices(filteredServs);
    }
  }, [serviceSearchTerm, services]);

  const selectService = (service, index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      serviceId: service._id,
      name: service.name,
      quantity: 1,
      price: service.price,
      total: service.price
    };
    setFormData({ ...formData, items: updatedItems });
    setShowItemSelector(false);
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
      items: [...formData.items, { serviceId: '', name: '', price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const openServiceSelector = (index) => {
    setSelectedItemIndex(index);
    setShowItemSelector(true);
  };

  // Calculate totals with PERCENTAGE-based discount, tax, and COUPON
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const standardDiscount = (subtotal * (formData.discountPercent || 0)) / 100;

    let couponDiscount = 0;
    if (appliedCouponData) {
      if (appliedCouponData.discountType === 'percentage') {
        couponDiscount = (subtotal * appliedCouponData.discountValue) / 100;
        if (appliedCouponData.maxDiscountAmount && couponDiscount > appliedCouponData.maxDiscountAmount) {
          couponDiscount = appliedCouponData.maxDiscountAmount;
        }
      } else {
        couponDiscount = appliedCouponData.discountValue;
      }
    }

    const totalDiscount = standardDiscount + couponDiscount;
    const taxableAmount = Math.max(subtotal - totalDiscount, 0);
    const taxAmount = (taxableAmount * (formData.taxPercent || 0)) / 100;
    const totalAmount = taxableAmount + taxAmount;
    const dueAmount = Math.max(totalAmount - (formData.paidAmount || 0), 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount: totalDiscount,
      couponDiscount,
      taxAmount,
      totalAmount,
      dueAmount
    }));
  }, [formData.items, formData.discountPercent, formData.taxPercent, formData.paidAmount, appliedCouponData]);

  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: formData.couponCode,
          billAmount: formData.subtotal
        })
      });

      const data = await response.json();
      if (data.success) {
        setAppliedCouponData(data.coupon);
        setCouponApplied(true);
        toast.success(`Coupon "${data.coupon.code}" applied!`);
      } else {
        toast.error(data.message || 'Invalid coupon code');
        setAppliedCouponData(null);
        setCouponApplied(false);
      }
    } catch (error) {
      toast.error('Error validating coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCouponData(null);
    setCouponApplied(false);
    setFormData(prev => ({ ...prev, couponCode: '' }));
    toast.info('Coupon removed');
  };

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
      if (formData.items.some(item => !item.serviceId)) {
        throw new Error('Please add valid services to the bill');
      }

      const billData = {
        customerId: formData.customerId,
        branchId: formData.branchId || undefined,
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
        notes: formData.notes,
        couponCode: couponApplied ? appliedCouponData.code : undefined
      };

      let response;
      if (modalMode === 'create') {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(billData)
        });
      } else if (modalMode === 'edit' && selectedBill) {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bills/${selectedBill._id}`, {
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
        console.error('Bill API error:', data); // Log the error cleanly
        const msg = data.errors ? data.errors.join('; ') : (data.message || `Failed to ${modalMode} bill`);
        throw new Error(msg);
      }

      setSuccess(`Bill ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);

      // Fetch latest bills to ensure the new bill is in state for download/share
      await fetchData();



      setShowModal(false);
      resetForm();

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

      const htmlContent = getInvoiceHTML(bill, '/Asset 2.svg');

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

  const handleDownload = async (bill) => {
    try {
      let logoBase64 = '/Asset 2.svg';
      try {
        const response = await fetch('/Asset 2.svg');
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Failed to encode logo to Base64:', err);
      }

      const htmlContent = getInvoiceHTML(bill, logoBase64);

      const opt = {
        margin: 10,
        filename: `invoice-${bill.billNumber}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
            clonedDoc.querySelectorAll('style').forEach(el => el.remove());
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(htmlContent).save();

    } catch (error) {
      console.error('Download processing failed completely:', error);
      alert('Failed to process bill format. Please try again.');
    }
  };



  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ serviceId: '', name: '', price: 0, total: 0 }],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      totalAmount: 0,
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      paidAmount: '',
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
      paidAmount: bill.paidAmount === 0 ? 0 : bill.paidAmount || '',
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
        <p className="text-gray-600 dark:text-gray-400">Create, manage, and track customer bills with integrated service pricing</p>
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
            <FileText className="w-8 h-8 text-[#0099CC] mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bills</h3>
              <p className="text-xl font-bold text-[#0099CC] dark:text-[#007aa3]">{stats.totalBills}</p>
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
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            {user?.role === 'superadmin' && branches.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-40"
                >
                  <option value="all">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>{branch.name} ({branch.code})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="self-center text-gray-600 dark:text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-[#0099CC] hover:bg-[#007aa3] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
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
                      <div className="text-sm text-gray-900 dark:text-white">{bill.branchId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{bill.branchId?.code || 'N/A'}</div>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
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
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNumber === pagination.currentPage
                      ? 'z-10 bg-[#e0f5fb] border-[#0099CC] text-[#0099CC] dark:bg-[#003d55] dark:border-[#0099CC] dark:text-[#007aa3]'
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
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl my-8 max-h-[90vh] flex flex-col transition-colors duration-300 shadow-2xl">

            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-t-lg shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#0099CC]" />
                {modalMode === 'edit' ? 'Edit Bill' : 'Create New Bill'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-900">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT SIDE: 3 Cards */}
                <div className="lg:col-span-2 space-y-5">

                  {/* CARD 1: Bill Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">1. Bill Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                        {formData.customerId ? (
                          <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="font-medium text-gray-900 dark:text-white">{formData.customerName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{formData.customerEmail}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{formData.customerPhone}</div>
                            {modalMode === 'create' && (
                              <button type="button" onClick={openCustomerSelector} className="mt-2 text-sm text-[#0099CC] hover:underline">Change Customer</button>
                            )}
                          </div>
                        ) : (
                          <button type="button" onClick={openCustomerSelector} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-[#0099CC] hover:text-[#0099CC] flex items-center justify-center gap-2 bg-white dark:bg-gray-700 transition-colors">
                            <User className="w-5 h-5" /> Select Customer
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Date *</label>
                        <input
                          type="date" value={formData.billDate} required
                          onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                          className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Services & Items */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">2. Services & Items</h3>
                      <button type="button" onClick={addItem} className="text-sm bg-[#0099CC] text-white px-3 py-1.5 rounded-lg hover:bg-[#007aa3] flex items-center gap-1 shadow-sm transition-colors">
                        <Plus className="w-4 h-4" /> Add Row
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="hidden md:grid grid-cols-12 gap-2 px-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-5">Service / Item</div>
                        <div className="col-span-2 text-center">Type</div>
                        <div className="col-span-2 text-right">Rate (₹)</div>
                        <div className="col-span-2 text-right">Amount (₹)</div>
                        <div className="col-span-1 text-center">Del</div>
                      </div>
                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors">
                          <div className="col-span-1 md:col-span-5">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 md:hidden">Service</label>
                            {item.serviceId ? (
                              <div className="flex justify-between items-center bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-600 rounded-md px-3 py-2 cursor-pointer hover:border-[#0099CC]" onClick={() => openServiceSelector(index)}>
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                              </div>
                            ) : (
                              <button type="button" onClick={() => openServiceSelector(index)} className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-500 rounded-md text-gray-500 hover:border-[#0099CC] hover:text-[#0099CC] text-sm flex items-center bg-white dark:bg-gray-800 transition-colors">
                                <Search className="w-4 h-4 mr-2 shrink-0" /> Search Service...
                              </button>
                            )}
                          </div>
                          <div className="col-span-1 md:col-span-2 hidden md:flex justify-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Service</span>
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 md:hidden">Rate (₹)</label>
                            {item.serviceId ? (
                              <div className="text-sm text-right text-gray-900 dark:text-white font-medium px-2 py-2">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            ) : (
                              <input type="number" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))} min="0" step="0.01" required placeholder="0.00" className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-right focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                            )}
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 md:hidden">Amount (₹)</label>
                            <div className="text-sm text-right text-gray-900 dark:text-white font-bold px-2 py-2">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                          <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center">
                            <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" disabled={formData.items.length === 1} title="Remove Row">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CARD 3: Payment & Notes */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">3. Payment & Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea rows="4" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Additional notes..." />
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="pending">Pending</option>
                              <option value="partial">Partial</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                            <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="upi">UPI</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>
                        </div>
                        {user?.role === 'superadmin' && branches.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                            <select value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="">-- Auto Select --</option>
                              {branches.map(branch => (
                                <option key={branch._id} value={branch._id}>{branch.name} ({branch.code})</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT SIDE: Checkout Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-4 flex flex-col overflow-hidden">
                    <div className="bg-gray-800 text-white p-4 text-center">
                      <h3 className="font-bold text-lg tracking-wider">CHECKOUT SUMMARY</h3>
                      <p className="text-gray-400 text-xs mt-0.5">Invoice Preview</p>
                    </div>
                    <div className="p-4 space-y-3 text-sm bg-gray-50 dark:bg-gray-900 flex-1">
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <span>Items:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formData.items.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹{formData.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Tax (%):</span>
                        <div className="relative w-24">
                          <input type="number" value={formData.taxPercent} onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })} min="0" max="100" step="0.01" className="w-full pl-2 pr-6 py-1 border-none focus:ring-0 text-right bg-transparent text-gray-900 dark:text-white font-medium" />
                          <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Discount (%):</span>
                        <div className="relative w-24">
                          <input type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} min="0" max="100" step="0.01" className="w-full pl-2 pr-6 py-1 border-none focus:ring-0 text-right bg-transparent text-gray-900 dark:text-white font-medium" />
                          <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
                        </div>
                      </div>

                      {/* Coupon Section */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-[#0099CC] font-semibold text-xs uppercase tracking-wider">
                          <Ticket size={14} />
                          Coupon Code
                        </div>
                        {couponApplied ? (
                          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#0099CC] text-sm">{appliedCouponData.code}</span>
                              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Applied Successfully</span>
                            </div>
                            <button type="button" onClick={removeCoupon} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-full text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Enter Code"
                              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-[#0099CC] outline-none bg-transparent dark:text-white uppercase"
                              value={formData.couponCode}
                              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !formData.couponCode}
                              className="px-3 py-1.5 bg-[#0099CC] text-white text-xs font-bold rounded-lg hover:bg-[#007aa3] disabled:opacity-50 transition-colors"
                            >
                              {couponLoading ? '...' : 'APPLY'}
                            </button>
                          </div>
                        )}
                      </div>

                      {formData.couponDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600 dark:text-green-400 py-1">
                          <span className="text-xs font-medium uppercase transition-all flex items-center gap-1">
                            <Ticket size={12} />
                            Coupon Discount:
                          </span>
                          <span className="font-bold">-₹{formData.couponDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="flex justify-between items-end">
                          <span className="font-bold text-base text-gray-800 dark:text-gray-200 uppercase">Total:</span>
                          <span className="font-black text-2xl text-[#0099CC]">₹{formData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <div className="flex justify-between items-center mb-2 pl-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Customer Paid:</span>
                          <div className="relative w-36">
                            <span className="absolute left-3 top-1.5 text-gray-500 font-medium text-sm">₹</span>
                            <input type="number" value={formData.paidAmount} onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value === '' ? '' : Number(e.target.value) })} min="0" step="0.01" placeholder="e.g. 1000" className="w-full pl-7 pr-3 py-1.5 border border-green-300 dark:border-green-700 rounded-lg text-right bg-green-50 dark:bg-gray-900 text-green-900 dark:text-green-400 font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pl-2">
                          <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Balance Due:</span>
                          <span className={`font-bold text-lg ${formData.dueAmount > 0 ? 'text-red-500' : 'text-gray-400'}`}>₹{formData.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-2 shrink-0">
                      <button type="submit" disabled={submitting} className={`w-full py-3 px-4 rounded-xl shadow-lg font-bold text-white uppercase tracking-wider transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#0099CC] to-[#007aa3] hover:from-[#007aa3] hover:to-[#005c7a] hover:shadow-xl'}`}>
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {modalMode === 'edit' ? 'Updating...' : 'Processing...'}
                          </span>
                        ) : (
                          modalMode === 'edit' ? 'Update Invoice' : 'Issue Invoice'
                        )}
                      </button>
                      <button type="button" onClick={() => setShowModal(false)} className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Customer Type</label>
                      <select
                        name="customerType"
                        value={customerFormData.customerType}
                        onChange={handleCustomerFormChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      className={`px-4 py-2 rounded-md text-white ${customerFormSubmitting
                        ? 'bg-orange-400 cursor-not-allowed opacity-80'
                        : 'bg-[#0099CC] hover:bg-[#007aa3] transition-colors'
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

      {/* Service Selector Modal */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Service</h3>
              <button onClick={() => setShowItemSelector(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={serviceSearchTerm}
                  onChange={(e) => setServiceSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-[#0099CC] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Services */}
              {filteredServices.map((service) => (
                <div key={`service-${service._id}`} onClick={() => selectService(service, selectedItemIndex)} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
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

              {filteredServices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No services found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && !showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-300 border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Invoice Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">#{selectedBill.billNumber}</p>
                </div>
                <span className={`ml-4 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${selectedBill.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : selectedBill.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                  {selectedBill.paymentStatus}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handlePrint(selectedBill)}
                  className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4 mr-2 text-blue-500" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Customer Information Card */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                      <p className="text-base font-bold text-gray-900 dark:text-white">{selectedBill.customerId?.name || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selectedBill.customerId?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium break-all">{selectedBill.customerId?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Metadata Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bill Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Date</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                        {new Date(selectedBill.billDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Method</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{selectedBill.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Branch</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{selectedBill.branchId?.name || 'Main Branch'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Service/Item Description</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Qty</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Unit Price</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {selectedBill.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400 font-medium">₹{item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Section: Notes and Totals */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Notes Section */}
                <div className="lg:col-span-3">
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/20 h-full">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest">Technician / Internal Notes</h3>
                    </div>
                    <p className="text-sm text-amber-900/70 dark:text-amber-300/70 leading-relaxed italic">
                      {selectedBill.notes || "No additional feedback or notes were recorded for this session."}
                    </p>
                  </div>
                </div>

                {/* Calculated Totals Card */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 text-white shadow-xl shadow-gray-200 dark:shadow-none">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Order Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-400">Subtotal</span>
                        <span>₹{selectedBill.subtotal.toLocaleString()}</span>
                      </div>

                      {selectedBill.discountPercent > 0 && (
                        <div className="flex justify-between text-sm font-medium text-amber-400">
                          <span>Discount ({selectedBill.discountPercent}%)</span>
                          <span>- ₹{((selectedBill.subtotal * selectedBill.discountPercent) / 100).toLocaleString()}</span>
                        </div>
                      )}

                      {selectedBill.taxPercent > 0 && (
                        <div className="flex justify-between text-sm font-medium text-gray-400">
                          <span>GST ({selectedBill.taxPercent}%)</span>
                          <span>₹{selectedBill.taxAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                        <span className="text-sm font-bold text-gray-400">Grand Total</span>
                        <span className="text-3xl font-black text-white leading-none tracking-tight">
                          ₹{selectedBill.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-gray-800 rounded-xl p-3">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Received</span>
                          <span className="text-sm font-bold text-emerald-400">₹{selectedBill.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-3">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Balance Due</span>
                          <span className="text-sm font-bold text-rose-400">₹{selectedBill.dueAmount.toLocaleString()}</span>
                        </div>
                      </div>
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