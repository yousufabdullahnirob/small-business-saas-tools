import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => {
        // If the value is a string (e.g. currency formatted), we need to extract the number
        // This handles cases where value might be "1,200.00" or similar
        // Ideally, pass raw numbers to this component
        return `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
    });

    useEffect(() => {
        // Parse value to ensure it's a number
        const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
        spring.set(numericValue);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
};

// Specialized for currency to handle decimals better if needed
export const CurrencyCounter = ({ value, currencySymbol = '৳' }) => {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });

    // We start from 0
    useEffect(() => {
        // Assuming value comes in as a number or string like "420.00"
        const numericValue = Number(value);
        if (!isNaN(numericValue)) {
            spring.set(numericValue);
        }
    }, [value, spring]);

    const display = useTransform(spring, (current) => {
        return `${currencySymbol}${current.toFixed(2)}`;
    });

    return <motion.span>{display}</motion.span>;
};

export default AnimatedCounter;
