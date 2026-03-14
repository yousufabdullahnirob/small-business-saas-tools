import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState('$');

    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'BDT': '৳',
    };

    const checkUser = React.useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await api.get('accounts/profile/');
                setUser(response.data);
                setCurrencySymbol(currencySymbols[response.data.currency] || '$');
            } catch (_error) {
                console.error("Auth check failed", _error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('token/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Fetch profile immediately
            const profileRes = await api.get('accounts/profile/');
            setUser(profileRes.data);
            setCurrencySymbol(currencySymbols[profileRes.data.currency] || '$');
            return { success: true };
        } catch (_error) {
            console.error("Login failed", _error);
            return { success: false, error: _error.response?.data?.detail || "Login failed" };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('accounts/register/', userData);
            // Auto login after register
            return login(userData.username, userData.password);
        } catch (_error) {
            return { success: false, error: _error.response?.data || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const formatCurrency = (amount) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(val)) return '-';
        return `${currencySymbol}${val.toFixed(2)}`;
    };

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading, checkUser, currencySymbol, formatCurrency }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
