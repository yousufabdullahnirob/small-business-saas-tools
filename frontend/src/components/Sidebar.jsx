import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, Package, Wallet, Users, BarChart3, Settings, Calculator, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { t } = useTranslation();
    const navItems = [
        { path: '/', label: t('common.dashboard'), icon: LayoutDashboard },
        { path: '/pos', label: t('common.pos_billing'), icon: Calculator },
        { path: '/sales', label: t('common.sales_history'), icon: ShoppingCart },
        { path: '/inventory', label: t('common.inventory'), icon: Package },
        { path: '/expenses', label: t('common.expenses'), icon: Wallet },
        { path: '/marketing', label: t('common.marketing'), icon: Sparkles },
        { path: '/customers', label: t('common.customers'), icon: Users },
        { path: '/reports', label: t('common.reports'), icon: BarChart3 },
        { path: '/pricing', label: t('common.billing_plans'), icon: Wallet },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-50 flex flex-col shadow-sm">
            <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                    <span className="text-xl">🚀</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">BizGenius</h1>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Business Suite</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="p-4 rounded-xl bg-indigo-600 text-white mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Users size={64} />
                    </div>
                    <p className="text-xs font-medium text-indigo-200 mb-1">Current Plan: Free</p>
                    <p className="text-sm font-bold mb-3">Upgrade to Pro</p>
                    <NavLink to="/pricing" className="bg-white text-indigo-600 text-xs font-bold py-2 px-3 rounded-lg w-full hover:bg-indigo-50 transition-colors inline-block text-center">
                        {t('common.upgrade')} {t('pricing.get_now')}
                    </NavLink>
                </div>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive
                            ? 'bg-white shadow-sm border border-slate-100 text-indigo-700'
                            : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-100'
                        }`
                    }
                >
                    <Settings size={20} />
                    <span className="font-medium">{t('common.settings')}</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;

