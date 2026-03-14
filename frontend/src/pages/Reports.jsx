import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Search, Filter, Download, Loader2, BarChart3, TrendingUp, Package, Box, DollarSign, ShoppingBag } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const { formatCurrency } = useAuth();
    const [summary, setSummary] = useState(null);
    const { addToast } = useToast();

    const fetchSummary = useCallback(async () => {
        // Mocking report generation from individual endpoints for now
        try {
            const [salesRes, productsRes] = await Promise.all([
                api.get('sales/sales/'),
                api.get('inventory/products/')
            ]);

            const sales = salesRes.data;
            const products = productsRes.data;

            const totalRevenue = sales.reduce((sum, s) => sum + Number(s.grand_total), 0);
            const totalStockValue = products.reduce((sum, p) => sum + (Number(p.cost_price) * p.stock_quantity), 0);
            const lowStockCount = products.filter(p => p.stock_quantity < p.low_stock_threshold).length;

            setSummary({
                totalRevenue,
                totalOrders: sales.length,
                totalStockValue,
                lowStockCount
            });
        } catch (_error) {
            console.error("Error generating reports", _error);
            addToast("Failed to generate business summary", "error");
        }
    }, [addToast]);

    useEffect(() => {
        // In a real app, this would be a dedicated report endpoint
        fetchSummary();
    }, [fetchSummary]);

    if (!summary) return (
        <div className="flex flex-col h-[60vh] items-center justify-center opacity-70">
            <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
            <p className="font-bold uppercase tracking-widest text-xs text-blue-400">Generating Reports...</p>
        </div>
    );

    const reportCards = [
        { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: DollarSign, color: 'blue', trend: '+8.2%', gradient: 'from-blue-600 to-indigo-600' },
        { label: 'Total Orders', value: summary.totalOrders.toString(), icon: ShoppingBag, color: 'purple', trend: '+12', gradient: 'from-purple-600 to-pink-600' },
        { label: 'Inventory Value', value: formatCurrency(summary.totalStockValue), icon: Box, color: 'orange', sub: 'At Cost', gradient: 'from-orange-500 to-red-500' },
        { label: 'Low Stock Items', value: summary.lowStockCount.toString(), icon: Package, color: 'red', alert: summary.lowStockCount > 0, gradient: 'from-red-600 to-pink-600' }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Business Reports</h1>
                    <p className="text-gray-400 mt-1 font-medium">Detailed analysis of your store's performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 flex items-center gap-2">
                        <TrendingUp size={18} /> Financial Year
                    </button>
                    <button className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {reportCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-6 group hover:translate-y-[-5px] transition-transform"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2">{card.label}</p>
                                <h3 className="text-2xl font-black text-white">{card.value}</h3>
                                {card.trend && (
                                    <span className="text-[10px] font-bold text-green-400 mt-2 inline-block">
                                        ↑ {card.trend} <span className="text-gray-600 font-medium ml-1">this month</span>
                                    </span>
                                )}
                                {card.sub && (
                                    <span className="text-[10px] font-bold text-gray-500 mt-2 inline-block">
                                        {card.sub}
                                    </span>
                                )}
                                {card.alert && (
                                    <span className="text-[10px] font-bold text-red-500 mt-2 inline-block animate-pulse">
                                        Action Required
                                    </span>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg shadow-${card.color}-500/20`}>
                                <card.icon size={22} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-card lg:col-span-2 p-8 min-h-[400px] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="font-black text-white text-lg uppercase tracking-tight">Revenue Growth</h3>
                        </div>
                        <select className="bg-black/20 text-xs font-black text-gray-400 uppercase tracking-widest border border-white/5 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-black/40 transition-colors appearance-none">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl opacity-60">
                        {/* Placeholder for chart - in real app, use Recharts here */}
                        <div className="w-full h-full flex items-end justify-between px-8 pb-4 gap-2">
                            {[40, 65, 30, 85, 55, 90, 45, 70, 60, 95, 20, 75].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    className="w-full bg-blue-600/20 rounded-t-lg hover:bg-blue-600/40 transition-colors"
                                />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-4">Revenue Visualization</p>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="font-black text-white text-lg uppercase tracking-tight mb-8">Data Export</h3>
                    <div className="space-y-4">
                        <button
                            className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex justify-between items-center group transition-all"
                            onClick={() => addToast('Exporting Sales CSV...', 'info')}
                        >
                            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">Sales History</span>
                            <Download size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                        <button
                            className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex justify-between items-center group transition-all"
                            onClick={() => addToast('Exporting Inventory CSV...', 'info')}
                        >
                            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">Inventory Levels</span>
                            <Download size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                        <button
                            className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <span className="font-bold text-sm text-gray-500">Expense Reports</span>
                            <span className="text-[10px] font-bold text-blue-500/50 uppercase tracking-wider">Coming Soon</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;

