import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-inter">
            <Sidebar />
            <div className="flex-1 ml-72 flex flex-col relative z-0 max-w-[calc(100vw-18rem)]">
                <Header />
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        className="flex-1 p-8 overflow-x-hidden overflow-y-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Layout;

