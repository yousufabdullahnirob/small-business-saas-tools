import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Phone, Mail, MapPin, Users } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const { addToast } = useToast();

    async function fetchCustomers() {
        try {
            const response = await api.get('customers/customers/');
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers", error);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email && formData.email.trim() !== "" ? formData.email.trim() : null,
            address: formData.address ? formData.address.trim() : ''
        };

        try {
            await api.post('customers/customers/', payload);
            fetchCustomers();
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', email: '', address: '' });
            addToast("Customer added successfully!", 'success');
        } catch (error) {
            console.error("Save failed", error.response?.data || error);
            const errorMsg = error.response?.data
                ? Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
                : "Failed to create customer.";
            addToast(errorMsg, 'error');
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
                        Customer Directory
                    </motion.h1>
                    <p className="text-gray-400 mt-1 font-medium">Manage your customer relationships</p>
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
                    <Plus size={20} /> Add Customer
                </motion.button>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {customers.map((customer, index) => (
                        <motion.div
                            key={customer.id}
                            className="glass-card p-6 flex flex-col gap-4 group"
                            variants={itemVariants}
                            layout
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold text-xl border border-white/10 group-hover:from-blue-500 group-hover:to-purple-500 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {customer.name.charAt(0).toUpperCase()}
                                </motion.div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">{customer.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Added {new Date(customer.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 text-gray-400 text-sm group-hover:text-gray-200 transition-colors">
                                    <div className="p-2 rounded-lg bg-white/5"><Phone size={14} /></div>
                                    {customer.phone}
                                </div>
                                {customer.email && (
                                    <div className="flex items-center gap-3 text-gray-400 text-sm group-hover:text-gray-200 transition-colors">
                                        <div className="p-2 rounded-lg bg-white/5"><Mail size={14} /></div>
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-3 text-gray-400 text-sm group-hover:text-gray-200 transition-colors">
                                        <div className="p-2 rounded-lg bg-white/5"><MapPin size={14} /></div>
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Name *</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            required
                            placeholder="Customer Name"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Phone *</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            required
                            placeholder="Phone Number"
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</label>
                        <input
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            type="email"
                            placeholder="Email Address (Optional)"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Address</label>
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium min-h-[100px]"
                            placeholder="Detailed Address"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all">Save Customer</button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Customers;

