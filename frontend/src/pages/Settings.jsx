import React, { useState } from 'react';
import { User, Bell, Shield, LogOut, Save, X, Eye, EyeOff, LayoutTemplate, Palette, Globe, Link } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Settings = () => {
    const { user, logout, checkUser } = useAuth(); // Added checkUser to refresh profile after update
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('account');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Profile State
    const [storeName, setStoreName] = useState('');
    const [productCategory, setProductCategory] = useState('General');
    const [targetCustomer, setTargetCustomer] = useState('Everyone');
    const [businessLanguage, setBusinessLanguage] = useState('Bangla');
    const [communicationTone, setCommunicationTone] = useState('Friendly');

    React.useEffect(() => {
        if (user) {
            setStoreName(user.business_name || user.store_name || '');
            setProductCategory(user.product_category || 'General');
            setTargetCustomer(user.target_customer || 'Everyone');
            setBusinessLanguage(user.business_language || 'Bangla');
            setCommunicationTone(user.communication_tone || 'Friendly');
        }
    }, [user]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Courier Integration State
    const [courierSettings, setCourierSettings] = useState({
        provider: 'Pathao',
        client_id: '',
        client_secret: ''
    });

    // Fetch Courier Settings
    React.useEffect(() => {
        if (activeTab === 'integrations') {
            api.get('sales/courier-settings/')
                .then(res => {
                    if (res.data) {
                        setCourierSettings({
                            provider: res.data.provider || 'Pathao',
                            client_id: res.data.client_id || '',
                            client_secret: '' // Don't show secret for security, or show if needed? Usually we don't send it back fully, but here we might want to let them overwrite. Serializer defines it as write_only.
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch courier settings", err));
        }
    }, [activeTab]);

    const handleSaveIntegration = async () => {
        setIsLoading(true);
        try {
            await api.post('sales/courier-settings/', courierSettings);
            addToast("Integration keys saved successfully!", "success");
        } catch (error) {
            console.error("Integration save error:", error);
            addToast("Failed to save integration keys.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            await api.patch('accounts/profile/', {
                business_name: storeName,
                product_category: productCategory,
                target_customer: targetCustomer,
                business_language: businessLanguage,
                communication_tone: communicationTone
            });
            await checkUser(); // Refresh user context
            addToast("Profile updated successfully.", "success");
        } catch (error) {
            console.error("Profile update error:", error);
            addToast("Failed to update profile.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            addToast("New passwords do not match.", "error");
            return;
        }

        setIsLoading(true);
        try {
            await api.put('accounts/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            addToast("Password changed successfully.", "success");
            setShowPasswordModal(false);
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error("Password change error:", error);
            addToast(error.response?.data?.old_password?.[0] || error.response?.data?.error || "Failed to change password.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: User, description: 'Manage your profile and details' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push alerts' },
        { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
        { id: 'integrations', label: 'Integrations', icon: Link, description: 'Connect courier services' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-20 max-w-6xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-1 text-lg">Manage your account preferences and application settings.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-1/4 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all border ${activeTab === tab.id
                                ? 'bg-white border-slate-200 shadow-sm'
                                : 'border-transparent hover:bg-white/60 text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                <tab.icon size={20} />
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>{tab.label}</h3>
                                <p className="text-xs text-slate-400">{tab.description}</p>
                            </div>
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-slate-200/60">
                        <button
                            onClick={logout}
                            className="w-full text-left p-4 rounded-xl flex items-center gap-4 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                                <LogOut size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Sign Out</h3>
                                <p className="text-xs text-rose-400">Log out of your session</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:w-3/4">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                                <User size={24} />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Store Name</label>
                                                <input
                                                    type="text"
                                                    value={storeName}
                                                    onChange={(e) => setStoreName(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                                    placeholder="Enter your store name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Username</label>
                                                <input
                                                    type="text"
                                                    value={user?.username || ''}
                                                    disabled
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-slate-400">Username cannot be changed.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>

                                            {/* AI Customization Section */}
                                            <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                    <span className="p-1 bg-indigo-100 text-indigo-600 rounded">✨</span>
                                                    AI Customization
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700">Product Category</label>
                                                        <input
                                                            type="text"
                                                            value={productCategory}
                                                            onChange={(e) => setProductCategory(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                                            placeholder="e.g. Fashion, Electronics"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700">Target Customer</label>
                                                        <input
                                                            type="text"
                                                            value={targetCustomer}
                                                            onChange={(e) => setTargetCustomer(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                                            placeholder="e.g. Students, Housewives"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700">Language</label>
                                                        <select
                                                            value={businessLanguage}
                                                            onChange={(e) => setBusinessLanguage(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                        >
                                                            <option value="Bangla">Bangla</option>
                                                            <option value="English">English</option>
                                                            <option value="Mixed">Mixed (Banglish)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-slate-700">Tone</label>
                                                        <select
                                                            value={communicationTone}
                                                            onChange={(e) => setCommunicationTone(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                        >
                                                            <option value="Friendly">Friendly</option>
                                                            <option value="Professional">Professional</option>
                                                            <option value="Aggressive">Aggressive (Salesy)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-end">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                                                <p className="text-sm text-slate-500">Manage your password and security preferences.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Password</h3>
                                                <p className="text-sm text-slate-500">Last changed: Never</p>
                                            </div>
                                            <button
                                                onClick={() => setShowPasswordModal(true)}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                                <Bell size={24} />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 opacity-60">
                                                <span className="font-medium text-slate-700">Email Notifications</span>
                                                <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 opacity-60">
                                                <span className="font-medium text-slate-700">Push Notifications</span>
                                                <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 text-center italic">Notification settings coming soon.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <Palette size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
                                    </div>
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 flex items-center gap-3 mb-6">
                                        <LayoutTemplate size={20} />
                                        <p className="text-sm font-medium">You are currently using the <strong>Standard Light</strong> theme. This is the new default experience.</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 opacity-50 pointer-events-none grayscale">
                                        <div className="border-2 border-indigo-500 rounded-xl p-2 bg-slate-50">
                                            <div className="h-20 bg-white border border-slate-200 rounded-lg mb-2"></div>
                                            <div className="text-center text-xs font-bold text-slate-700">Light</div>
                                        </div>
                                        <div className="border border-slate-200 rounded-xl p-2">
                                            <div className="h-20 bg-slate-900 rounded-lg mb-2"></div>
                                            <div className="text-center text-xs font-medium text-slate-500">Dark (Coming Soon)</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Integrations Tab */}
                            {activeTab === 'integrations' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                                <Link size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">Courier Integration</h2>
                                                <p className="text-sm text-slate-500">Connect your Pathao or Steadfast account to automate shipping.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Select Provider</label>
                                                <select
                                                    value={courierSettings.provider}
                                                    onChange={(e) => setCourierSettings({ ...courierSettings, provider: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                                >
                                                    <option value="Pathao">Pathao Courier</option>
                                                    <option value="Steadfast">Steadfast Courier</option>
                                                    <option value="RedX">RedX Delivery</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Client ID / API Key</label>
                                                <input
                                                    type="text"
                                                    value={courierSettings.client_id}
                                                    onChange={(e) => setCourierSettings({ ...courierSettings, client_id: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                                    placeholder="Paste your Client ID here"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Client Secret</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        value={courierSettings.client_secret}
                                                        onChange={(e) => setCourierSettings({ ...courierSettings, client_secret: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                                        placeholder="Paste your Secret Key here"
                                                    />
                                                </div>
                                                <p className="text-xs text-indigo-500 mt-2 hover:underline cursor-pointer">
                                                    Don't have keys? Click here to learn how to generate them.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-end">
                                        <button
                                            onClick={handleSaveIntegration}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <Save size={18} /> {isLoading ? 'Verifying...' : 'Connect Service'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            value={passwordData.old_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Settings;
