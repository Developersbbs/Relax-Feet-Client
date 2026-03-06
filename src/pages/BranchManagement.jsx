import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiGlobe, FiMail, FiCreditCard, FiInfo } from 'react-icons/fi';
import {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    reset,
} from "../redux/features/branches/branchSlice";

const EMPTY_FORM = {
    name: "",
    code: "",
    address: "",
    contactNumber: "",
    isActive: true,
    gstNumber: "",
    email: "",
    website: "",
    bankDetails: {
        bankName: "",
        accountNumber: "",
        branchBankName: "",
        ifscCode: "",
        upiId: "",
    },
};

const tabList = [
    { id: "basic", label: "Basic Info", icon: <FiInfo /> },
    { id: "billing", label: "Billing Info", icon: <FiGlobe /> },
    { id: "bank", label: "Bank Details", icon: <FiCreditCard /> },
];

const BranchManagement = () => {
    const dispatch = useDispatch();
    const { branches, isLoading, isError, message } = useSelector((state) => state.branch);

    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState(() => {
        const savedDraft = localStorage.getItem('branchFormDraft');
        if (savedDraft) {
            try { return JSON.parse(savedDraft); } catch (e) { }
        }
        return { ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } };
    });
    const [activeTab, setActiveTab] = useState("basic");
    const [searchTerm, setSearchTerm] = useState("");

    // Auto-save draft when creating new branch and modal is open
    useEffect(() => {
        if (showModal && !editingBranch) {
            localStorage.setItem('branchFormDraft', JSON.stringify(formData));
        }
    }, [formData, editingBranch, showModal]);

    useEffect(() => {
        if (isError) toast.error(message);
        dispatch(getBranches());
        return () => { dispatch(reset()); };
    }, [dispatch, isError, message]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [name]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.code || !formData.address || !formData.contactNumber) {
            toast.error("Please fill in all required fields (Basic Info tab)");
            setActiveTab("basic");
            return;
        }
        if (editingBranch) {
            dispatch(updateBranch({ id: editingBranch._id, branchData: formData }))
                .unwrap()
                .then(() => { toast.success("Branch updated successfully"); setShowModal(false); resetForm(); })
                .catch((err) => toast.error(err));
        } else {
            dispatch(createBranch(formData))
                .unwrap()
                .then(() => {
                    toast.success("Branch created successfully");
                    localStorage.removeItem('branchFormDraft');
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => toast.error(err));
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name || "",
            code: branch.code || "",
            address: branch.address || "",
            contactNumber: branch.contactNumber || "",
            isActive: branch.isActive ?? true,
            gstNumber: branch.gstNumber || "",
            email: branch.email || "",
            website: branch.website || "",
            bankDetails: {
                bankName: branch.bankDetails?.bankName || "",
                accountNumber: branch.bankDetails?.accountNumber || "",
                branchBankName: branch.bankDetails?.branchBankName || "",
                ifscCode: branch.bankDetails?.ifscCode || "",
                upiId: branch.bankDetails?.upiId || "",
            },
        });
        setActiveTab("basic");
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this branch? This might affect existing data.")) {
            dispatch(deleteBranch(id))
                .unwrap()
                .then(() => toast.success("Branch deleted successfully"))
                .catch((err) => toast.error(err));
        }
    };

    const resetForm = () => {
        setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
        setEditingBranch(null);
        setActiveTab("basic");
    };

    const handleOpenCreate = () => {
        const savedDraft = localStorage.getItem('branchFormDraft');
        if (savedDraft) {
            try {
                setFormData(JSON.parse(savedDraft));
            } catch (e) {
                setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
            }
        } else {
            setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
        }
        setEditingBranch(null);
        setActiveTab("basic");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (editingBranch) {
            // Revert back to draft if we were editing, so the 'Add Branch' draft is retained
            setEditingBranch(null);
            const savedDraft = localStorage.getItem('branchFormDraft');
            if (savedDraft) {
                try {
                    setFormData(JSON.parse(savedDraft));
                } catch (e) {
                    setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
                }
            } else {
                setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
            }
        }
        // If we were creating, the useEffect naturally saved it as we typed, so we leave it alone.
    };

    const clearDraft = () => {
        if (window.confirm("Are you sure you want to clear the form? All unsaved changes will be lost.")) {
            localStorage.removeItem('branchFormDraft');
            setFormData({ ...EMPTY_FORM, bankDetails: { ...EMPTY_FORM.bankDetails } });
        }
    };

    const fieldClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    const filteredBranches = (branches || []).filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🏢 Branch Management</h1>
                        <p className="text-gray-600 dark:text-gray-300">Manage branches and their billing details</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <FiMapPin className="text-[#0099CC] dark:text-blue-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{(branches || []).length}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Add */}
                <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1 max-w-md relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors"
                    >
                        <FiPlus /> Add Branch
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0099CC] mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading branches...</p>
                        </div>
                    ) : filteredBranches.length === 0 ? (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">No branches found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name / Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">GST</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredBranches.map((branch) => (
                                        <tr key={branch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{branch.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{branch.address}</div>
                                                {branch.email && <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><FiMail size={10} /> {branch.email}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded font-mono">{branch.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-1"><FiPhone size={12} /> {branch.contactNumber}</div>
                                                {branch.website && <div className="text-xs text-gray-400 flex items-center gap-1 mt-1"><FiGlobe size={10} /> {branch.website}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">{branch.gstNumber || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                    {branch.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEdit(branch)} className="text-[#0099CC] hover:text-[#007aa3] transition-colors"><FiEdit2 size={18} /></button>
                                                    <button onClick={() => handleDelete(branch._id)} className="text-red-600 hover:text-red-900 transition-colors"><FiTrash2 size={18} /></button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingBranch ? '✏️ Edit Branch' : '🏢 Create New Branch'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in all tabs for complete billing setup</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            {tabList.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'border-[#0099CC] text-[#0099CC]'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

                                {/* === BASIC INFO === */}
                                {activeTab === 'basic' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Branch Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={fieldClass} placeholder="e.g. Main Branch" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Branch Code <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(Unique, used in bill numbers)</span></label>
                                            <input type="text" name="code" value={formData.code} onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} required className={fieldClass + " uppercase"} placeholder="e.g. MAIN" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Contact Number <span className="text-red-500">*</span></label>
                                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className={fieldClass} placeholder="e.g. 9042716037" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                                            <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className={fieldClass} placeholder="Full address of the branch" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-[#0099CC] rounded focus:ring-[#0099CC]" />
                                            <label htmlFor="isActive" className="text-sm font-medium text-gray-900 dark:text-gray-300">Active Branch</label>
                                        </div>
                                    </>
                                )}

                                {/* === BILLING INFO === */}
                                {activeTab === 'billing' && (
                                    <>
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                            ℹ️ These details will appear on invoices printed for this branch.
                                        </div>
                                        <div>
                                            <label className={labelClass}>GST Number</label>
                                            <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className={fieldClass} placeholder="e.g. 33AAOFH2184C1ZL" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email ID</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} placeholder="e.g. info@branch.com" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Website</label>
                                            <input type="text" name="website" value={formData.website} onChange={handleChange} className={fieldClass} placeholder="e.g. www.branch.com" />
                                        </div>
                                    </>
                                )}

                                {/* === BANK DETAILS === */}
                                {activeTab === 'bank' && (
                                    <>
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                                            💳 Bank details will appear in the footer section of branch invoices.
                                        </div>
                                        <div>
                                            <label className={labelClass}>Bank Name</label>
                                            <input type="text" name="bankName" value={formData.bankDetails.bankName} onChange={handleBankChange} className={fieldClass} placeholder="e.g. HDFC Bank" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Account Number</label>
                                            <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankChange} className={fieldClass} placeholder="e.g. 50200108255392" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Bank Branch Name</label>
                                            <input type="text" name="branchBankName" value={formData.bankDetails.branchBankName} onChange={handleBankChange} className={fieldClass} placeholder="e.g. VALASARAVAKKAM, Chennai - 600087" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>IFSC Code</label>
                                            <input type="text" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={handleBankChange} className={fieldClass} placeholder="e.g. HDFC0000024" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>UPI ID</label>
                                            <input type="text" name="upiId" value={formData.bankDetails.upiId} onChange={handleBankChange} className={fieldClass} placeholder="e.g. healthheal-1@okhdfcbank" />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex gap-2">
                                    {tabList.map((tab, i) => (
                                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${activeTab === tab.id ? 'bg-[#0099CC]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                            title={tab.label}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-3 items-center">
                                    {!editingBranch && (
                                        <button type="button" onClick={clearDraft}
                                            className="px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors text-sm font-medium mr-2">
                                            Clear Draft
                                        </button>
                                    )}
                                    <button type="button" onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit"
                                        className="px-5 py-2 text-white bg-[#0099CC] hover:bg-[#007aa3] rounded-lg transition-colors text-sm font-medium">
                                        {editingBranch ? 'Update Branch' : 'Create Branch'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
