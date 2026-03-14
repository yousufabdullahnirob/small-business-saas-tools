import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Filter, Edit, Trash2, Box, AlertTriangle, DollarSign, Package, MoreHorizontal } from 'lucide-react';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AnimatedCounter, { CurrencyCounter } from '../components/AnimatedCounter';

const Inventory = () => {
    const { formatCurrency } = useAuth();
    const { addToast } = useToast();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    // Stats State
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const lowerQ = searchQuery.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerQ) ||
            (p.barcode && p.barcode.includes(lowerQ))
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('inventory/products/');
            const data = response.data;
            setProducts(data);
            setFilteredProducts(data);
            calculateStats(data);
        } catch (error) {
            console.error("Error fetching products", error);
            addToast('Failed to load inventory.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const totalProducts = data.length;
        const totalValue = data.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.stock_quantity), 0);
        const lowStockItems = data.filter(p => p.stock_quantity <= 10).length;
        setStats({ totalProducts, totalValue, lowStockItems });
    };

    const handleSave = async (productData) => {
        try {
            let response;
            if (currentProduct) {
                response = await api.patch(`inventory/products/${currentProduct.id}/`, productData);
                setProducts(products.map(p => p.id === currentProduct.id ? response.data : p));
                addToast('Product updated successfully!', 'success');
            } else {
                response = await api.post('inventory/products/', productData);
                setProducts([...products, response.data]);
                addToast('Product created successfully!', 'success');
            }
            setIsModalOpen(false);
            setCurrentProduct(null);
            calculateStats(currentProduct ? products.map(p => p.id === currentProduct.id ? response.data : p) : [...products, response.data]);

        } catch (error) {
            console.error("Error saving product", error);
            addToast('Failed to save product.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`inventory/products/${productToDelete.id}/`);
            const updatedProducts = products.filter(p => p.id !== productToDelete.id);
            setProducts(updatedProducts);
            calculateStats(updatedProducts);
            addToast('Product deleted.', 'success');
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product", error);
            addToast('Failed to delete product.', 'error');
        }
    };

    const openEditModal = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
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
                        Inventory Management
                    </h1>
                    <p className="text-slate-500 mt-1 text-lg">
                        Manage your entire product catalog and stock levels.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" /> Filter
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
                        onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
                    >
                        <Plus size={20} /> Add Product
                    </motion.button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Box size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Products</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <AnimatedCounter value={stats.totalProducts} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Value</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <CurrencyCounter value={stats.totalValue} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Low Stock Alerts</h3>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                        <AnimatedCounter value={stats.lowStockItems} />
                    </div>
                </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div
                className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm"
                variants={itemVariants}
            >
                <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <Search size={20} className="text-slate-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search products by name or barcode..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700 placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </motion.div>

            {/* Product Table Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-5 pl-8 text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Level</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Package size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-slate-900">No products found</p>
                                            <p className="text-slate-500 mt-1">Try adjusting your search or add a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="p-5 pl-8">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <Box size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="font-semibold text-slate-900 text-sm mb-0.5">{product.name}</div>
                                            {product.barcode && <div className="text-xs text-slate-400 font-mono">{product.barcode}</div>}
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-5 font-semibold text-slate-700 text-sm">{formatCurrency(product.price)}</td>
                                        <td className="p-5 w-48">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                                    <span>{product.stock_quantity} units</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${product.stock_quantity < 10 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${Math.min(product.stock_quantity, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${product.stock_quantity > 0
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(product)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modals */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentProduct(null); }} title={currentProduct ? "Edit Product" : "Add New Product"}>
                <ProductForm
                    initialData={currentProduct}
                    onSubmit={handleSave}
                    onCancel={() => { setIsModalOpen(false); setCurrentProduct(null); }}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <div className="space-y-4">
                    <p className="text-slate-600">Are you sure you want to delete <span className="font-bold text-slate-900">{productToDelete?.name}</span>? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm shadow-rose-200 transition-all">Delete Product</button>
                    </div>
                </div>
            </Modal>

        </motion.div>
    );
};

export default Inventory;
