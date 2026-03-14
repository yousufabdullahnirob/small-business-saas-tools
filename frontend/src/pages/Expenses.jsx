import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Plus, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Expenses = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        transaction_type: 'EXPENSE',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const { addToast } = useToast();
    const { formatCurrency } = useAuth();

    const fetchTransactions = useCallback(async () => {
        try {
            const response = await api.get('expenses/transactions/');
            setTransactions(response.data);
        } catch (error) { console.error(error); }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('expenses/expense-categories/');
            setCategories(response.data);
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, [fetchTransactions, fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('expenses/transactions/', formData);
            fetchTransactions();
            setIsModalOpen(false);
            setFormData({ ...formData, amount: '', description: '' });
            addToast("Transaction saved successfully.", 'success');
        } catch (_error) {
            console.error("Save failed", _error);
            addToast("Failed to save transaction.", 'error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pb-20"
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1
                        className="text-3xl font-black text-white tracking-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Finance Tracker
                    </motion.h1>
                    <p className="text-gray-400 mt-1 font-medium">Monitor income and expenses</p>
                </div>

                <motion.button
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                    onClick={() => setIsModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Plus size={20} /> Add Transaction
                </motion.button>
            </div>

            <motion.div
                className="glass-card rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="p-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="p-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="p-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="p-6 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {transactions.map((t, index) => (
                                    <motion.tr
                                        key={t.id}
                                        variants={itemVariants}
                                        layout
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-6 text-gray-300 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="p-6 text-white font-bold">{t.description}</td>
                                        <td className="p-6 text-gray-400 text-sm">
                                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">{t.category_name || '-'}</span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full w-fit ${t.transaction_type === 'INCOME'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/20'
                                                }`}>
                                                {t.transaction_type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {t.transaction_type}
                                            </span>
                                        </td>
                                        <td className={`p-6 text-right font-black text-lg ${t.transaction_type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {t.transaction_type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 font-medium">
                                        No transactions found. Start by adding one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Transaction">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer rounded-xl border p-4 flex items-center justify-center gap-2 transition-all ${formData.transaction_type === 'EXPENSE'
                                    ? 'bg-red-500/20 border-red-500 text-red-400 font-bold'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    className="hidden"
                                    checked={formData.transaction_type === 'EXPENSE'}
                                    onChange={() => setFormData({ ...formData, transaction_type: 'EXPENSE' })}
                                />
                                <TrendingDown size={18} /> Expense
                            </label>
                            <label className={`cursor-pointer rounded-xl border p-4 flex items-center justify-center gap-2 transition-all ${formData.transaction_type === 'INCOME'
                                    ? 'bg-green-500/20 border-green-500 text-green-400 font-bold'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}>
                                <input
                                    type="radio"
                                    name="type"
                                    className="hidden"
                                    checked={formData.transaction_type === 'INCOME'}
                                    onChange={() => setFormData({ ...formData, transaction_type: 'INCOME' })}
                                />
                                <TrendingUp size={18} /> Income
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="number"
                                step="0.01"
                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-lg"
                                required
                                placeholder="0.00"
                                value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Category</label>
                            <select
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="" className="bg-gray-900 text-gray-500">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[80px]"
                            placeholder="What was this for?"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all">Save Transaction</button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Expenses;
