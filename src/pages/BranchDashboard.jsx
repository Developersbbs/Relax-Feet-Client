import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/features/auth/loginSlice';
import { Link } from 'react-router-dom';
import instance from '../services/instance';
import {
    TrendingUp, DollarSign, FileText, AlertTriangle, MapPin,
    RefreshCw, Eye, ChevronRight, CheckCircle, Clock, Package,
    BarChart2, Building2, Activity
} from 'lucide-react';

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-lg transition-shadow">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ── Status Badge ───────────────────────────────────────────────────────────
const Badge = ({ status }) => {
    const map = {
        paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const BranchDashboard = () => {
    const user = useSelector(selectUser);

    const [summary, setSummary] = useState({ branchSummary: [], systemTotals: {} });
    // const [products, setProducts] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchBills, setBranchBills] = useState([]);
    const [loadingMain, setLoadingMain] = useState(true);
    const [loadingBills, setLoadingBills] = useState(false);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch branch billing summary + product stock
    const fetchData = useCallback(async (quiet = false) => {
        try {
            if (!quiet) setLoadingMain(true);
            else setRefreshing(true);

            const summaryRes = await instance.get('/bills/branch-summary');

            setSummary(summaryRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load dashboard data. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoadingMain(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Fetch bills for selected branch
    const viewBranchBills = async (branch) => {
        setSelectedBranch(branch);
        setLoadingBills(true);
        try {
            const res = await instance.get(`/bills?branchId=${branch.branchId}&limit=50`);
            setBranchBills(res.data.bills || []);
        } catch {
            setBranchBills([]);
        } finally {
            setLoadingBills(false);
        }
    };

    // ── Derived stock data
    // Products functionality removed
    const { systemTotals, branchSummary } = summary;

    if (loadingMain) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#0099CC] border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading branch analytics…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-8 h-8 text-[#0099CC]" />
                            Branch Analytics
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">System-wide revenue, billing, and stock overview</p>
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-xl font-medium transition-colors disabled:opacity-60"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── System Overview Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Revenue"
                        value={`₹${(systemTotals?.totalRevenue || 0).toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-[#0099CC]"
                        sub="All branches, all time"
                    />
                    <StatCard
                        label="This Month"
                        value={`₹${(systemTotals?.monthlyRevenue || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        color="bg-indigo-600"
                        sub="Monthly revenue"
                    />
                    <StatCard
                        label="Today's Bills"
                        value={systemTotals?.todayBills || 0}
                        icon={FileText}
                        color="bg-emerald-600"
                        sub="Across all branches"
                    />
                    <StatCard
                        label="Pending Dues"
                        value={`₹${(systemTotals?.pendingAmount || 0).toLocaleString()}`}
                        icon={Clock}
                        color="bg-amber-500"
                        sub="Total unpaid amount"
                    />
                </div>

                {/* Stock Alerts Removed */}

                {/* ── Branch-wise Table ── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-[#0099CC]" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Branch-wise Performance</h2>
                    </div>

                    {branchSummary.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No billing data found across branches yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {['Branch', 'Total Bills', 'Monthly Bills', 'Total Revenue', 'Monthly Revenue', 'Pending', 'Paid', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {branchSummary.map((b) => (
                                        <tr key={b.branchId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-[#e0f5fb] dark:bg-[#003d55] rounded-lg">
                                                        <MapPin className="w-4 h-4 text-[#0099CC]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{b.branchName}</p>
                                                        <p className="text-xs text-gray-400">{b.branchCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{b.totalBills}</td>
                                            <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{b.monthlyBills}</td>
                                            <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">₹{b.totalRevenue?.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">₹{b.monthlyRevenue?.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-sm text-amber-600 dark:text-amber-400 font-medium">₹{b.pendingAmount?.toLocaleString()}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {b.paidBills}
                                                    <span className="text-gray-400 text-xs ml-1">/ {b.totalBills}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => viewBranchBills(b)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#0099CC] hover:bg-[#007aa3] text-white rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Bills
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Branch Bill Drill-down ── */}
                {selectedBranch && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0099CC]" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Bills — {selectedBranch.branchName} <span className="text-sm font-normal text-gray-400">({selectedBranch.branchCode})</span>
                                </h2>
                            </div>
                            <button onClick={() => setSelectedBranch(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
                                Close
                            </button>
                        </div>

                        {loadingBills ? (
                            <div className="py-10 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0099CC] border-t-transparent" />
                            </div>
                        ) : branchBills.length === 0 ? (
                            <p className="py-10 text-center text-gray-400">No bills found for this branch.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {['Bill #', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {branchBills.map(bill => (
                                            <tr key={bill._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-5 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white">{bill.billNumber}</td>
                                                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{bill.customerName}</td>
                                                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(bill.billDate).toLocaleDateString()}</td>
                                                <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white">₹{bill.totalAmount?.toLocaleString()}</td>
                                                <td className="px-5 py-3"><Badge status={bill.paymentStatus} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Low Stock Product Detail Removed */}
            </div>
        </div>
    );
};

export default BranchDashboard;
