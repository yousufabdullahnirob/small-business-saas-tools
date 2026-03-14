import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    MoreHorizontal,
    Sparkles,
    AlertTriangle,
    Repeat,
    CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnimatedCounter, { CurrencyCounter } from '../components/AnimatedCounter';

const Dashboard = () => {
    const { user, formatCurrency } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        total_sales: 0,
        total_orders: 0,
        total_customers: 0
    });
    const [recentSales, setRecentSales] = useState([]);
    const [insights, setInsights] = useState({
        stock_out_predictions: [],
        repeat_buyers: [],
        top_products: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Try fetching real data first
                const [statsRes, salesRes, insightsRes] = await Promise.all([
                    api.get('dashboard/stats/').catch(() => null),
                    api.get('sales/sales/').catch(() => null),
                    api.get('sales/insights/').catch(() => null)
                ]);

                if (statsRes?.data) {
                    setStats(statsRes.data);
                } else {
                    // Fallback mock data
                    console.warn("Dashboard stats API failed, using fallback data.");
                    setStats({
                        revenue: 54321,
                        orders: 142,
                        total_sales: 54321,
                        total_orders: 142,
                        total_customers: 89
                    });
                }

                if (salesRes?.data) {
                    setRecentSales(salesRes.data.slice(0, 5));
                }

                if (insightsRes?.data) {
                    setInsights(insightsRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const salesData = [
        { name: 'Mon', sales: 4000, visitors: 2400 },
        { name: 'Tue', sales: 3000, visitors: 1398 },
        { name: 'Wed', sales: 2000, visitors: 9800 },
        { name: 'Thu', sales: 2780, visitors: 3908 },
        { name: 'Fri', sales: 1890, visitors: 4800 },
        { name: 'Sat', sales: 2390, visitors: 3800 },
        { name: 'Sun', sales: 3490, visitors: 4300 },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
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
            className="space-y-6 max-w-[1600px] mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">
                        Welcome back, {user?.username || 'User'}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        Last 30 Days
                    </button>
                    <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2">
                        + New Order
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        title: 'Total Revenue',
                        value: stats.total_sales,
                        isCurrency: true,
                        icon: DollarSign,
                        color: 'indigo',
                        trend: '+12.5%',
                        trendUp: true
                    },
                    {
                        title: 'Total Orders',
                        value: stats.total_orders,
                        isCurrency: false,
                        icon: ShoppingCart,
                        color: 'blue',
                        trend: '+8.2%',
                        trendUp: true
                    },
                    {
                        title: 'Total Customers',
                        value: stats.total_customers,
                        isCurrency: false,
                        icon: Users,
                        color: 'emerald',
                        trend: '+2.4%',
                        trendUp: true
                    }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${item.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {item.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {item.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium mb-1">{item.title}</h3>
                        <div className="text-3xl font-bold text-slate-900 tracking-tight">
                            {item.isCurrency ? <CurrencyCounter value={item.value} /> : <AnimatedCounter value={item.value} />}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Insights Section */}
            {(insights.stock_out_predictions.length > 0 || insights.repeat_buyers.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock Predictions */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles size={100} className="text-rose-600" />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle size={20} className="text-rose-500" /> Stock Risk Alerts
                            </h3>
                            <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">AI Prediction</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {insights.stock_out_predictions.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">No critical stock risks detected.</p>
                            ) : (
                                insights.stock_out_predictions.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-rose-100 rounded-xl shadow-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-500">Stock: {item.stock}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-rose-600">
                                                {item.days_remaining === "Low Stock" ? "Low Stock" : `${item.days_remaining} Days Left`}
                                            </p>
                                            <p className="text-[10px] text-slate-400">Based on recent sales</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Repeat Buyers */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Users size={100} className="text-indigo-600" />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Repeat size={20} className="text-indigo-500" /> Top Repeat Buyers
                            </h3>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">Loyal Customers</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {insights.repeat_buyers.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">Not enough data for insights.</p>
                            ) : (
                                insights.repeat_buyers.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-indigo-100 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-500">Loyal Customer</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-indigo-600">{item.order_count} Orders</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
                            <p className="text-sm text-slate-500">Monthly revenue performance</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="h-[350px] w-full overflow-hidden" style={{ height: 350 }}>
                        <AreaChart width={800} height={300} data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                                cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                            />
                        </AreaChart>

                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[480px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {recentSales.map((sale, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <CreditCard size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-slate-900 truncate">{sale.customer_name || 'Walk-in Customer'}</h4>
                                    <p className="text-xs text-slate-500">{new Date(sale.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-slate-900">{formatCurrency(sale.grand_total)}</p>
                                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                                        {sale.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-700 transition-colors border border-slate-200">
                        Create New Invoice
                    </button>
                </motion.div>
            </div >
        </motion.div >
    );
};

export default Dashboard;
