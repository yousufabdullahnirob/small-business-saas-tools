import React, { useState, useEffect } from 'react';
import { Sparkles, Facebook, Instagram, Copy, Check, MessageSquare, Zap, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Marketing = () => {
    const { addToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState('');
    const [platform, setPlatform] = useState('Facebook');
    const [language, setLanguage] = useState('Bangla');
    const [offer, setOffer] = useState('');
    const [instructions, setInstructions] = useState('');

    // Result State
    const [generatedContent, setGeneratedContent] = useState('');
    const [variations, setVariations] = useState(null);
    const [activeTab, setActiveTab] = useState('option1');
    const [copied, setCopied] = useState(false);

    // Refs
    const selectRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('inventory/products/');

            console.log("Fetched products:", response.data);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            addToast("Failed to load products", "error");
        }
    };

    const handleGenerate = async () => {
        if (!selectedProduct) {
            addToast("Please select a product first", "error");
            return;
        }

        setGenerating(true);
        setGeneratedContent('');
        setCopied(false);

        try {
            const response = await api.post('marketing/generate/', {
                product_id: selectedProduct,
                platform: platform,
                offer: offer,
                language: language,
                instructions: instructions
            });

            // Handle JSON response with variations
            if (response.data.is_json) {
                try {
                    const parsed = typeof response.data.content === 'string'
                        ? JSON.parse(response.data.content)
                        : response.data.content;
                    setVariations(parsed);
                    setGeneratedContent(parsed.option1);
                    setActiveTab('option1');
                } catch (e) {
                    console.error("Failed to parse JSON content", e);
                    setGeneratedContent(response.data.content);
                }
            } else {
                setGeneratedContent(response.data.content);
                setVariations(null);
            }

            addToast("Content generated successfully! 🎉", "success");
        } catch (error) {
            console.error("Generation error:", error);
            addToast("Failed to generate content", "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedProduct) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        // Some backends require other fields or partial update flag
        // Assuming PATCH request handles partial update correctly

        try {
            const response = await api.patch(`inventory/products/${selectedProduct}/`, formData);

            // Update local state
            setProducts(products.map(p => p.id == selectedProduct ? response.data : p));
            addToast("Product image updated successfully!", "success");
        } catch (error) {
            console.error("Image upload error:", error);
            addToast("Failed to upload image", "error");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        addToast("Copied to clipboard!", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateProduct = async (formData) => {
        try {
            const response = await api.post('inventory/products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast("Product created successfully! 🎉", "success");
            setShowAddProduct(false);
            await fetchProducts(); // Refresh list to include new product
            setSelectedProduct(response.data.id); // Auto-select the new product

            // Highlight the selection to show it worked
            if (selectRef.current) {
                setTimeout(() => {
                    selectRef.current.focus();
                    selectRef.current.classList.add('ring-4', 'ring-green-200');
                    setTimeout(() => selectRef.current.classList.remove('ring-4', 'ring-green-200'), 1000);
                }, 100);
            }

        } catch (error) {
            console.error("Error creating product:", error);
            if (error.response && error.response.data) {
                console.error("Server Error Details:", JSON.stringify(error.response.data, null, 2));
                // Show JSON string to debug exactly what's wrong
                addToast(`Failed: ${JSON.stringify(error.response.data)}`, "error");
            } else {
                addToast("Failed to create product", "error");
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Sparkles className="text-indigo-600" fill="currentColor" fillOpacity={0.2} />
                    AI Marketing Content
                </h1>
                <p className="text-slate-500 mt-1 text-lg">Generate engaging social media posts for your products in seconds.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-amber-500" /> Configuration
                    </h2>

                    <div className="space-y-6">
                        {/* Product Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Select Product</label>
                            <div className="flex gap-2">
                                <select
                                    ref={selectRef}
                                    value={selectedProduct}
                                    onChange={(e) => {
                                        console.log("Selected Product ID:", e.target.value);
                                        setSelectedProduct(e.target.value);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                >
                                    <option value="">-- Choose a Product --</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} (ID: {product.id})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowAddProduct(true)}
                                    className="flex-none w-12 h-[50px] bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-sm"
                                    title="Add New Product"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Selected Product Preview */}
                        {/* Selected Product Preview */}
                        {/* Selected Product Preview */}
                        {selectedProduct && products.find(p => String(p.id) === String(selectedProduct)) ? (
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Click to change photo"
                                >
                                    {products.find(p => String(p.id) === String(selectedProduct)).image ? (
                                        <>
                                            <img
                                                src={products.find(p => String(p.id) === String(selectedProduct)).image}
                                                alt="Product"
                                                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                                <Upload size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-indigo-300 group-hover:text-indigo-400 transition-colors">
                                            <Upload size={20} />
                                        </div>
                                    )}
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{products.find(p => String(p.id) === String(selectedProduct)).name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-sm text-slate-500">Ready to generate content</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors flex items-center gap-1 border border-indigo-100"
                                        >
                                            <Upload size={12} />
                                            {uploadingImage ? 'Uploading...' : 'Change Photo'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => {
                                    addToast("Please select a product from the list above first! ☝️", "info");
                                    if (selectRef.current) {
                                        selectRef.current.focus();
                                        // Highlight effect could be added here or via class logic
                                        selectRef.current.classList.add('ring-4', 'ring-indigo-200');
                                        setTimeout(() => selectRef.current.classList.remove('ring-4', 'ring-indigo-200'), 500);
                                    }
                                }}
                                className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                            >
                                <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-200 transition-colors">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Select a Product to add/view image</h3>
                                    <p className="text-sm text-slate-400">Click here or select from dropdown above</p>
                                </div>
                            </div>
                        )}

                        {/* Platform Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Platform</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPlatform('Facebook')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${platform === 'Facebook'
                                        ? 'bg-blue-50 border-blue-500/50 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Facebook size={24} />
                                    <span className="font-semibold">Facebook</span>
                                </button>
                                <button
                                    onClick={() => setPlatform('Instagram')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${platform === 'Instagram'
                                        ? 'bg-pink-50 border-pink-500/50 text-pink-700 shadow-sm ring-1 ring-pink-500/20'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <Instagram size={24} />
                                    <span className="font-semibold">Instagram</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Special Offer (Optional)</label>
                            <input
                                type="text"
                                value={offer}
                                onChange={(e) => setOffer(e.target.value)}
                                placeholder="e.g. 10% Discount, Buy 1 Get 1 Free"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Language & Instructions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                >
                                    <option value="Bangla">Bangla</option>
                                    <option value="English">English</option>
                                    <option value="Banglish">Banglish (Bangla in English text)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Custom Instructions</label>
                                <input
                                    type="text"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="e.g. Make it funny, Focus on quality"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !selectedProduct}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {generating ? (
                                <>
                                    <Sparkles className="animate-spin" size={20} /> Generating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} /> Generate Content
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Output Section */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare size={20} className="text-emerald-500" /> Result
                        </h2>
                        {generatedContent && (
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied!" : "Copy Text"}
                            </button>
                        )}
                    </div>

                    {variations && (
                        <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg">
                            {['option1', 'option2', 'option3'].map((opt, idx) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        setActiveTab(opt);
                                        setGeneratedContent(variations[opt]);
                                    }}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === opt
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {idx === 0 ? 'Short' : idx === 1 ? 'Detailed' : 'Creative'}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6 font-medium text-slate-700 whitespace-pre-line leading-relaxed overflow-y-auto min-h-[300px]">
                        {generatedContent ? (
                            <motion.div
                                key={activeTab} // Animate when tab changes
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {generatedContent}
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                <Sparkles size={48} strokeWidth={1} />
                                <p>Select a product and click generate to see the magic happen!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Global Hidden Input - Always Rendered */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
            />

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                                <button
                                    onClick={() => setShowAddProduct(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <ProductForm
                                    onSubmit={handleCreateProduct}
                                    onCancel={() => setShowAddProduct(false)}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Marketing;
