import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Filter, Eye, FileText, Download, Loader2, DollarSign, ShoppingCart, TrendingUp, Calendar, CreditCard, ChevronDown, Truck, Package, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AnimatedCounter, { CurrencyCounter } from '../components/AnimatedCounter';

const Sales = () => {
    const { formatCurrency } = useAuth();
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const { addToast } = useToast();

    // Courier State
    const [showCourierModal, setShowCourierModal] = useState(false);
    const [courierLoading, setCourierLoading] = useState(false);
    const [courierDetails, setCourierDetails] = useState({
        provider: 'pathao',
        weight: '0.5',
        customerName: '',
        customerPhone: '',
        address: '',
        city: 'Dhaka'
    });

    useEffect(() => {
        if (selectedSale) {
            setCourierDetails(prev => ({
                ...prev,
                customerName: selectedSale.customer_name || 'Guest',
                customerPhone: selectedSale.customer?.phone || '', // Assuming customer object has phone
                address: selectedSale.customer?.address || '',
                city: 'Dhaka' // Default to Dhaka
            }));
        }
    }, [selectedSale]);

    const handleCourierBooking = async () => {
        if (!selectedSale) return;
        setCourierLoading(true);
        try {
            const response = await api.post('sales/ship-order/', {
                sale_id: selectedSale.id,
                weight: courierDetails.weight,
                customer_name: courierDetails.customerName,
                customer_phone: courierDetails.customerPhone,
                address: courierDetails.address,
                city: courierDetails.city
            });

            if (response.data.success) {
                addToast(`Success! Tracking Code: ${response.data.tracking_code}`, 'success');
                setShowCourierModal(false);
                // Refresh sales to show updated status if needed
                fetchSales();
            } else {
                addToast(response.data.message || "Booking failed", "error");
            }
        } catch (error) {
            console.error("Shipping error:", error);
            addToast(error.response?.data?.error || "Failed to book courier.", "error");
        } finally {
            setCourierLoading(false);
        }
    };

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0
    });

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        const filtered = sales.filter(sale =>
            (sale.customer_name && sale.customer_name.toLowerCase().includes(lowerQ)) ||
            (sale.id && sale.id.toString().includes(lowerQ))
        );
        setFilteredSales(filtered);
    }, [searchQuery, sales]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await api.get('sales/sales/');
            const data = response.data;
            setSales(data);
            setFilteredSales(data);
            calculateStats(data);
        } catch (error) {
            console.error("Error fetching sales", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalRevenue = data.reduce((acc, curr) => acc + parseFloat(curr.grand_total), 0);
        const totalOrders = data.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        setStats({ totalRevenue, totalOrders, avgOrderValue });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-20 max-w-7xl mx-auto flex flex-col gap-8"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Sales Transactions
                    </h1>
                    <p className="text-slate-500 mt-1 text-lg">
                        Monitor revenue and order history in real-time.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" /> Date Range
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Download size={18} className="text-slate-400" /> Export
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Revenue</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <CurrencyCounter value={stats.totalRevenue} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <ShoppingCart size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Orders</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <AnimatedCounter value={stats.totalOrders} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Avg. Order Value</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <CurrencyCounter value={stats.avgOrderValue} />
                    </div>
                </motion.div>
            </div>

            {/* Search & Filter */}
            <motion.div
                className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center"
                variants={itemVariants}
            >
                <div className="flex-1 w-full flex items-center bg-slate-50 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search sales by customer or ID..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2 border border-transparent hover:border-slate-200">
                    <Filter size={18} /> Filter Status <ChevronDown size={14} />
                </button>
            </motion.div>


            {/* Sales Table Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-5 pl-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* Loading State */}
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <CreditCard size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-slate-900">No sales found</p>
                                            <p className="text-slate-500 mt-1">Create a new order in POS to see it here.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale, index) => (
                                    <motion.tr
                                        key={sale.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="p-5 pl-8 font-mono text-xs font-medium text-slate-500">#{sale.id}</td>
                                        <td className="p-5">
                                            <div className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{sale.customer_name || 'Walk-in Customer'}</div>
                                        </td>
                                        <td className="p-5 text-sm text-slate-500">
                                            {new Date(sale.created_at).toLocaleDateString()}
                                            <span className="text-xs text-slate-400 ml-2">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-5 font-bold text-slate-900 text-sm">{formatCurrency(sale.grand_total)}</td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 uppercase tracking-wide border border-blue-100">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {sale.courier_booking_id ? (
                                                <button
                                                    className="p-2 text-emerald-600 bg-emerald-50 rounded-lg ml-1 cursor-default"
                                                    title={`Booked: ${sale.courier_booking_id}`}
                                                >
                                                    <Truck size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSale(sale);
                                                        setShowCourierModal(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1"
                                                    title="Ship via Courier"
                                                >
                                                    <Truck size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Sale Details Modal */}
            <Modal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                title={`Order #${selectedSale?.id}`}
            >
                {selectedSale && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                                <p className="font-bold text-slate-900">{selectedSale.customer_name || 'Walk-in Customer'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                <p className="font-bold text-slate-900">{new Date(selectedSale.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</p>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                {selectedSale.items && selectedSale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                x{item.quantity}
                                            </div>
                                            <span className="font-medium text-sm text-slate-700">{item.product_name}</span>
                                        </div>
                                        <span className="font-bold text-sm text-slate-900">{formatCurrency(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <p className="text-lg font-bold text-slate-400">Total Amount</p>
                            <p className="text-2xl font-black text-indigo-600">{formatCurrency(selectedSale.grand_total)}</p>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                                <FileText size={18} /> Download Invoice
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Courier Modal */}
            <Modal
                isOpen={showCourierModal}
                onClose={() => setShowCourierModal(false)}
                title="Ship via Courier"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900">Instant Booking</p>
                            <p className="text-sm text-blue-600">Rider will be notified immediately.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['pathao', 'steadfast'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCourierDetails({ ...courierDetails, provider: p })}
                                    className={`p-3 rounded-xl border font-bold capitalize transition-all ${courierDetails.provider === p ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Customer Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={courierDetails.customerName}
                                onChange={e => setCourierDetails({ ...courierDetails, customerName: e.target.value })}
                                placeholder="Receiver Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={courierDetails.customerPhone}
                                onChange={e => setCourierDetails({ ...courierDetails, customerPhone: e.target.value })}
                                placeholder="017..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            rows="2"
                            value={courierDetails.address}
                            onChange={e => setCourierDetails({ ...courierDetails, address: e.target.value })}
                            placeholder="Full Address (House, Road, Area)..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">City / Zone</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={courierDetails.city}
                                onChange={e => setCourierDetails({ ...courierDetails, city: e.target.value })}
                                placeholder="Dhaka"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Parcel Weight (kg)</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={courierDetails.weight}
                                    onChange={e => setCourierDetails({ ...courierDetails, weight: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCourierBooking}
                        disabled={courierLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {courierLoading ? <Loader2 className="animate-spin" /> : <Truck size={20} />}
                        {courierLoading ? 'Booking Rider...' : 'Confirm Shipment'}
                    </button>
                </div>
            </Modal >
        </motion.div >
    );
};

export default Sales;
