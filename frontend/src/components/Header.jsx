import React, { useState } from 'react';
import { Bell, Search, User, Menu, X, LogOut, Settings, Sparkles, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = ({ onSearch }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [showLangMenu, setShowLangMenu] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'bn', label: 'Bengali', flag: '🇧🇩' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getTitle = () => {
        const path = location.pathname;
        if (path === '/') return t('common.dashboard');
        if (path.startsWith('/pos')) return t('common.pos_billing');
        if (path.startsWith('/sales')) return t('common.sales_history');
        if (path.startsWith('/inventory')) return t('common.inventory');
        if (path.startsWith('/expenses')) return t('common.expenses');
        if (path.startsWith('/marketing')) return t('common.marketing');
        if (path.startsWith('/customers')) return t('common.customers');
        if (path.startsWith('/reports')) return t('common.reports');
        if (path.startsWith('/pricing')) return t('common.billing_plans');
        if (path.startsWith('/settings')) return t('common.settings');
        return t('common.dashboard');
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-transparent">
            <div className="flex-1">
                {location.pathname !== '/' && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{getTitle()}</h1>
                        <p className="text-sm font-medium text-slate-500">{getGreeting()}, {user?.store_name || user?.username || 'User'}</p>
                    </motion.div>
                )}
            </div>

            <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search for products, orders..."
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 flex justify-end items-center gap-4 relative">
                <div className="relative">
                    <button
                        className={`relative p-3 rounded-xl transition-all ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-50">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                            >
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-bold text-slate-900">Notifications</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-sm text-slate-800">{n.title}</h4>
                                                    <span className="text-xs text-slate-400">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">{n.desc}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                                    <button
                                        className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                                        onClick={markAllRead}
                                    >
                                        Mark all as read
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <span className="text-lg">{currentLang.flag}</span>
                        <span className="text-sm font-bold uppercase">{currentLang.code}</span>
                    </button>

                    <AnimatePresence>
                        {showLangMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-3 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                            >
                                <div className="p-2 space-y-1">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                i18n.changeLanguage(lang.code);
                                                setShowLangMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${i18n.language === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="font-medium">{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => navigate('/pricing')}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all group"
                >
                    <Sparkles size={16} className="text-indigo-200 group-hover:scale-110 transition-transform" />
                    Upgrade
                </button>

                <div className="relative">
                    <button
                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-all hover:shadow-sm group"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors border border-slate-200">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{user?.username || 'User'}</span>
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                            >
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email || 'user@example.com'}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl flex items-center gap-3 transition-colors group"
                                        onClick={() => {
                                            navigate('/settings');
                                            setShowProfileMenu(false);
                                        }}
                                    >
                                        <Settings size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                        <span className="font-medium">Settings</span>
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-3 transition-colors group"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} className="text-rose-400 group-hover:text-rose-500 transition-colors" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
