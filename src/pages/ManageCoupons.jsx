import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Ticket, Calendar, DollarSign, Percent, AlertCircle, Search, X, Check, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const ManageCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState = {
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minBillAmount: 0,
        maxDiscountAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        usageLimit: 0,
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupons`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCoupons(data.coupons);
            } else {
                toast.error(data.message || 'Failed to fetch coupons');
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData(initialFormState);
        setShowModal(true);
    };

    const openEditModal = (coupon) => {
        setModalMode('edit');
        setSelectedCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minBillAmount: coupon.minBillAmount || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit || 0,
            isActive: coupon.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = modalMode === 'create'
                ? `${import.meta.env.VITE_API_BASE_URL}/api/coupons`
                : `${import.meta.env.VITE_API_BASE_URL}/api/coupons/${selectedCoupon._id}`;

            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Coupon ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
                setShowModal(false);
                fetchCoupons();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/coupons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } else {
                toast.error(data.message || 'Delete failed');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (coupon) => {
        const now = new Date();
        const start = new Date(coupon.startDate);
        const end = new Date(coupon.endDate);

        if (!coupon.isActive) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Inactive</span>;
        if (now < start) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Upcoming</span>;
        if (now > end) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">Expired</span>;
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-600">Exhausted</span>;

        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">Active</span>;
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Ticket className="text-[#0099CC]" />
                            Manage Coupon Offers
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">Create and manage limited-time discount codes.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-all shadow-md"
                    >
                        <Plus size={20} />
                        Add New Coupon
                    </button>
                </div>

                {/* Search & Stats */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by coupon code or description..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] outline-none text-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Coupon Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-[#0099CC] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading coupons...</p>
                        </div>
                    ) : filteredCoupons.length === 0 ? (
                        <div className="col-span-full py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                            <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">No coupons found.</p>
                            <button onClick={openCreateModal} className="mt-4 text-[#0099CC] font-medium hover:underline">Create your first coupon</button>
                        </div>
                    ) : (
                        filteredCoupons.map((coupon) => (
                            <div key={coupon._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-all">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <Ticket className="text-[#0099CC]" size={24} />
                                        </div>
                                        {getStatusBadge(coupon)}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 uppercase tracking-wider">{coupon.code}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-4">{coupon.description || 'No description provided.'}</p>

                                    <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            {coupon.discountType === 'percentage' ? <Percent size={14} className="text-emerald-500" /> : <DollarSign size={14} className="text-emerald-500" />}
                                            <span className="font-semibold">{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' OFF'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Clock size={14} className="text-orange-500" />
                                            <span>{new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Check size={14} className="text-blue-500" />
                                            <span>Used: <b>{coupon.usedCount}</b> {coupon.usageLimit > 0 ? `/ ${coupon.usageLimit}` : '(Unlimited)'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end gap-2">
                                    <button
                                        onClick={() => openEditModal(coupon)}
                                        className="p-2 text-gray-600 hover:text-[#0099CC] hover:bg-white dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 rounded-lg transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-white dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-600 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {modalMode === 'create' ? 'Create New Coupon' : 'Edit Coupon'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Coupon Code*</label>
                                    <input
                                        type="text"
                                        name="code"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC] uppercase"
                                        placeholder="e.g. WELCOME10"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'edit'}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discount Type*</label>
                                    <select
                                        name="discountType"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discount Value*</label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Min Bill Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="minBillAmount"
                                        min="0"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.minBillAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Max Discount (₹, 0 for unlimited)</label>
                                        <input
                                            type="number"
                                            name="maxDiscountAmount"
                                            min="0"
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                            value={formData.maxDiscountAmount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usage Limit (0 for unlimited)</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        min="0"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date*</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date*</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-[#0099CC]"
                                    placeholder="Campaign details..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    className="w-5 h-5 accent-[#0099CC]"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Is Active</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCoupons;
