import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, QrCode, Wallet, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// POS Component with Framer Motion animations
const POS = () => {
    const { addToast } = useToast();
    const { currencySymbol, formatCurrency } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, MOBILE
    const searchInputRef = useRef(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get('inventory/products/');
            setProducts(response.data);
        } catch (_error) {
            console.error("Error fetching products", _error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        if (product.stock_quantity <= 0) {
            addToast(`"${product.name}" is out of stock!`, 'error');
            return;
        }

        const existingItem = cart.find(item => item.product.id === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stock_quantity) {
                addToast(`Cannot add more "${product.name}". Max stock reached.`, 'error');
                return;
            }
            addToast(`Added another "${product.name}" to cart.`, 'success', 1000);
            setCart(prev => prev.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            addToast(`Added "${product.name}" to cart.`, 'success', 1000);
            setCart(prev => [...prev, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        const item = cart.find(i => i.product.id === productId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) return; // Prevent quantity less than 1 (or handle removal if desired)

        // Check stock
        if (delta > 0 && newQty > item.product.stock_quantity) {
            addToast(`Not enough stock for "${item.product.name}"!`, 'error');
            return;
        }

        setCart(prev => prev.map(i =>
            i.product.id === productId ? { ...i, quantity: newQty } : i
        ));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
        addToast("Item removed from cart.", 'info');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery))
    );

    const calculateTotal = () => {
        const subTotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
        const tax = subTotal * 0.05; // Example 5% tax
        return { subTotal, tax, grandTotal: subTotal + tax };
    };

    const { subTotal, tax, grandTotal } = calculateTotal();

    const handleCheckout = async () => {
        if (cart.length === 0) return addToast("Cart is empty!", 'error');

        const saleData = {
            customer: selectedCustomer ? selectedCustomer.id : null,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                product: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price
            })),
            sub_total: subTotal,
            tax_amount: tax,
            grand_total: grandTotal,
            status: 'COMPLETED'
        };

        try {
            await api.post('sales/sales/', saleData);
            addToast("Sale completed successfully! 🎉", 'success');
            setCart([]);
            setSelectedCustomer(null);
            setPaymentMethod('CASH');
            fetchProducts(); // Refresh stock
        } catch (error) {
            console.error(error);
            addToast("Failed to process sale. Please try again.", 'error');
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
            {/* Left: Search & Product Grid */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative shrink-0"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products by name or SKU..."
                        className="w-full pl-12 pr-4 py-4 glass-panel rounded-2xl text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                        <span className="px-1.5 bg-white/10 rounded">CTRL</span>
                        <span>+</span>
                        <span className="px-1.5 bg-white/10 rounded">K</span>
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-20"
                >
                    {filteredProducts.map((product, idx) => (
                        <motion.button
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`flex flex-col text-left p-4 rounded-2xl glass-card border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden ${product.stock_quantity === 0 ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                            onClick={() => product.stock_quantity > 0 && addToCart(product)}
                            whileHover={product.stock_quantity > 0 ? { y: -5 } : {}}
                            whileTap={product.stock_quantity > 0 ? { scale: 0.98 } : {}}
                            disabled={product.stock_quantity === 0}
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-3 group-hover:from-blue-500 group-hover:to-purple-500 transition-colors">
                                <span className="text-xl font-bold text-gray-300 group-hover:text-white transition-colors">{product.name.charAt(0).toUpperCase()}</span>
                            </div>

                            <div className="flex-1 min-w-0 mb-2">
                                <h3 className="font-bold text-gray-200 truncate group-hover:text-white transition-colors" title={product.name}>{product.name}</h3>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{product.category_name || 'General'}</p>
                            </div>

                            <div className="flex justify-between items-end mt-auto">
                                <span className="text-lg font-black text-blue-400">{formatCurrency(product.price)}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${product.stock_quantity < 10 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {product.stock_quantity} Left
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Right: Cart */}
            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-96 flex flex-col shrink-0 glass-panel rounded-2xl overflow-hidden border border-white/10"
            >
                <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                            <ShoppingCart size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Current Order</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">Cart is empty</p>
                            <p className="text-sm">Scan items or click to add</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.product.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">
                                        {item.product.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-gray-200 truncate">{item.product.name}</h4>
                                        <p className="text-xs text-gray-500">{formatCurrency(item.product.price)} / unit</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1">
                                        <button
                                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
                                            onClick={() => updateQuantity(item.product.id, -1)}
                                        >
                                            <Minus size={12} strokeWidth={3} />
                                        </button>
                                        <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                        <button
                                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
                                            onClick={() => updateQuantity(item.product.id, 1)}
                                        >
                                            <Plus size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <button
                                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        onClick={() => removeFromCart(item.product.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Tax (5%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/5">
                            <span>Total</span>
                            <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                            { id: 'CASH', icon: Banknote, label: 'Cash' },
                            { id: 'CARD', icon: CreditCard, label: 'Card' },
                            { id: 'MOBILE', icon: QrCode, label: 'Mobile' }
                        ].map(method => (
                            <button
                                key={method.id}
                                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-transparent transition-all ${paymentMethod === method.id
                                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
                                onClick={() => setPaymentMethod(method.id)}
                            >
                                <method.icon size={18} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                    >
                        <span>Confirm Payment</span>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Plus size={14} strokeWidth={3} />
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default POS;

