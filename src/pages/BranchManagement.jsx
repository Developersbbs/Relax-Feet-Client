import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin, FiPhone } from 'react-icons/fi';
import {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    reset,
} from "../redux/features/branches/branchSlice";

const BranchManagement = () => {
    const dispatch = useDispatch();

    const { branches, isLoading, isError, message } = useSelector(
        (state) => state.branch
    );

    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        contactNumber: "",
        isActive: true,
    });

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        dispatch(getBranches());

        return () => {
            dispatch(reset());
        };
    }, [dispatch, isError, message]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code || !formData.address || !formData.contactNumber) {
            return toast.error("Please fill in all required fields");
        }

        if (editingBranch) {
            dispatch(updateBranch({ id: editingBranch._id, branchData: formData }))
                .unwrap()
                .then(() => {
                    toast.success("Branch updated successfully");
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => toast.error(err));
        } else {
            dispatch(createBranch(formData))
                .unwrap()
                .then(() => {
                    toast.success("Branch created successfully");
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => toast.error(err));
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            code: branch.code,
            address: branch.address,
            contactNumber: branch.contactNumber,
            isActive: branch.isActive,
        });
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
        setFormData({
            name: "",
            code: "",
            address: "",
            contactNumber: "",
            isActive: true,
        });
        setEditingBranch(null);
    };

    const filteredBranches = (branches || []).filter((branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                🏢 Branch Management
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Manage your store branches and locations
                            </p>
                        </div>
                        <div className="flex gap-4">
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
                    </div>
                </div>

                <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search branches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors duration-200"
                        >
                            <FiPlus />
                            Add Branch
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0099CC] mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading branches...</p>
                        </div>
                    ) : filteredBranches.length === 0 ? (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                            No branches found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredBranches.map((branch) => (
                                        <tr key={branch._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{branch.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{branch.address}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded font-mono">
                                                    {branch.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <FiPhone className="mr-2" />
                                                    {branch.contactNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                    {branch.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(branch)}
                                                        className="text-[#0099CC] hover:text-[#007aa3] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(branch._id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
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

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Branch Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Branch Code * (Unique)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Address *
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0099CC] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    ></textarea>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 text-[#0099CC] bg-gray-100 border-gray-300 rounded focus:ring-[#0099CC] dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Active Branch
                                    </label>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-[#0099CC] hover:bg-[#007aa3] rounded-lg transition-colors"
                                    >
                                        {editingBranch ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
