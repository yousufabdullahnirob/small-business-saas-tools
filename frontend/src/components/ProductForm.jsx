import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Upload, X } from 'lucide-react';

const ProductForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        cost_price: '',
        stock_quantity: '',
        low_stock_threshold: 10,
        barcode: '',
        sku: '',
        description: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const { currencySymbol } = useAuth();

    const fetchCategories = async () => {
        try {
            const response = await api.get('inventory/categories/');
            setCategories(response.data);
        } catch (_err) {
            console.error("Failed to fetch categories", _err);
        }
    };

    useEffect(() => {
        fetchCategories();
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category || '',
                price: initialData.price,
                cost_price: initialData.cost_price,
                stock_quantity: initialData.stock_quantity,
                low_stock_threshold: initialData.low_stock_threshold,
                barcode: initialData.barcode || '',
                sku: initialData.sku || '',
                description: initialData.description || '',
                is_active: initialData.is_active
            });
            // Note: We don't pre-fill imageFile because we can't easily turn a URL back into a File object.
            // If the user wants to keep existing image, they just don't select a new one.
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        if (formData.category) data.append('category', formData.category);
        data.append('price', formData.price);
        data.append('cost_price', formData.cost_price || 0);
        data.append('stock_quantity', formData.stock_quantity || 0);
        data.append('low_stock_threshold', formData.low_stock_threshold || 10);
        data.append('is_active', formData.is_active);

        if (formData.barcode) data.append('barcode', formData.barcode);
        if (formData.barcode) data.append('barcode', formData.barcode);

        // Auto-generate SKU if empty to satisfy backend requirements
        const finalSku = formData.sku || `SKU-${Date.now()}`;
        data.append('sku', finalSku);

        if (formData.description) data.append('description', formData.description);
        if (formData.description) data.append('description', formData.description);

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            await onSubmit(data); // Call parent's handler
            // Don't modify internal loading state here if parent handles everything, 
            // but we might want to keep it consistent.
            // Assuming parent handles closing modal/toasts.
        } catch (error) {
            console.error("Error in form submission:", error);
            // Parent should handle error toasts usually, but we can double check
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div className="form-group">
                <label className="form-label font-medium mb-1 block">Product Name *</label>
                <input
                    type="text"
                    className="form-control w-full border rounded px-3 py-2"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Category</label>
                    <select
                        className="form-control w-full border rounded px-3 py-2"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Barcode (Scan)</label>
                    <input
                        type="text"
                        className="form-control w-full border rounded px-3 py-2"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        placeholder="Scan or type..."
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
                <label className="form-label font-medium mb-1 block">Product Image</label>
                <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload size={18} className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">Choose Image</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                    {imageFile && (
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm">
                            <span className="truncate max-w-[150px]">{imageFile.name}</span>
                            <button type="button" onClick={() => setImageFile(null)} className="text-gray-500 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label font-medium mb-1 block">Description (Optional)</label>
                <textarea
                    className="form-control w-full border rounded px-3 py-2"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description..."
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Selling Price ({currencySymbol}) *</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control w-full border rounded px-3 py-2"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Cost Price ({currencySymbol})</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control w-full border rounded px-3 py-2"
                        name="cost_price"
                        value={formData.cost_price}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Stock Quantity</label>
                    <input
                        type="number"
                        className="form-control w-full border rounded px-3 py-2"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label font-medium mb-1 block">Low Stock Alert Level</label>
                    <input
                        type="number"
                        className="form-control w-full border rounded px-3 py-2"
                        name="low_stock_threshold"
                        value={formData.low_stock_threshold}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium">Product is Active</span>
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700 font-medium"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
