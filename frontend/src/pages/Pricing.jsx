import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Clock, Globe, Menu, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
    const { t } = useTranslation();
    const plans = [
        t('pricing.plans.month_1'),
        t('pricing.plans.month_3'),
        t('pricing.plans.month_6'),
        t('pricing.plans.month_12')
    ];
    const [selectedPlan, setSelectedPlan] = useState(plans[0]);
    const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 15, minutes: 17, seconds: 43 });

    // Countdown timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pricingByDuration = {
        [t('pricing.plans.month_1')]: [
            {
                title: t('pricing.lakkhyo.title'), price: '1,110', originalPrice: '1,500', save: '390',
                desc: t('pricing.lakkhyo.desc'),
                features: [t('pricing.lakkhyo.feature1'), t('pricing.lakkhyo.feature2'), t('pricing.lakkhyo.feature3'), t('pricing.lakkhyo.feature4'), t('pricing.lakkhyo.feature5'), t('pricing.lakkhyo.feature6'), t('pricing.lakkhyo.feature7'), t('pricing.lakkhyo.feature8'), t('pricing.lakkhyo.feature9'), t('pricing.lakkhyo.feature10')],
                color: 'slate', highlight: false
            },
            {
                title: t('pricing.growth.title'), price: '1,850', originalPrice: '2,500', save: '650',
                desc: t('pricing.growth.desc'),
                features: [t('pricing.growth.feature1'), t('pricing.growth.feature2'), t('pricing.growth.feature3'), t('pricing.growth.feature4'), t('pricing.growth.feature5'), t('pricing.growth.feature6'), t('pricing.growth.feature7'), t('pricing.growth.feature8'), t('pricing.growth.feature9'), t('pricing.growth.feature10')],
                color: 'indigo', highlight: true
            },
            {
                title: t('pricing.empire.title'), price: '3,700', originalPrice: '5,000', save: '1,300',
                desc: t('pricing.empire.desc'),
                features: [t('pricing.empire.feature1'), t('pricing.empire.feature2'), t('pricing.empire.feature3'), t('pricing.empire.feature4'), t('pricing.empire.feature5'), t('pricing.empire.feature6'), t('pricing.empire.feature7'), t('pricing.empire.feature8'), t('pricing.empire.feature9'), t('pricing.empire.feature10')],
                color: 'sky', highlight: false
            }
        ],
        [t('pricing.plans.month_3')]: [
            {
                title: t('pricing.lakkhyo.title'), price: '3,165', originalPrice: '4,500', save: '1,335',
                desc: t('pricing.lakkhyo.desc'),
                features: [t('pricing.lakkhyo.feature1'), t('pricing.lakkhyo.feature2'), t('pricing.lakkhyo.feature3'), t('pricing.lakkhyo.feature4'), t('pricing.lakkhyo.feature5'), t('pricing.lakkhyo.feature6'), t('pricing.lakkhyo.feature7'), t('pricing.lakkhyo.feature8'), t('pricing.lakkhyo.feature9'), t('pricing.lakkhyo.feature10')],
                color: 'slate', highlight: false
            },
            {
                title: t('pricing.growth.title'), price: '5,275', originalPrice: '7,500', save: '2,225',
                desc: t('pricing.growth.desc'),
                features: [t('pricing.growth.feature1'), t('pricing.growth.feature2'), t('pricing.growth.feature3'), t('pricing.growth.feature4'), t('pricing.growth.feature5'), t('pricing.growth.feature6'), t('pricing.growth.feature7'), t('pricing.growth.feature8'), t('pricing.growth.feature9'), t('pricing.growth.feature10')],
                color: 'indigo', highlight: true
            },
            {
                title: t('pricing.empire.title'), price: '10,540', originalPrice: '15,000', save: '4,460',
                desc: t('pricing.empire.desc'),
                features: [t('pricing.empire.feature1'), t('pricing.empire.feature2'), t('pricing.empire.feature3'), t('pricing.empire.feature4'), t('pricing.empire.feature5'), t('pricing.empire.feature6'), t('pricing.empire.feature7'), t('pricing.empire.feature8'), t('pricing.empire.feature9'), t('pricing.empire.feature10')],
                color: 'sky', highlight: false
            }
        ],
        [t('pricing.plans.month_6')]: [
            {
                title: t('pricing.lakkhyo.title'), price: '6,000', originalPrice: '9,000', save: '3,000',
                desc: t('pricing.lakkhyo.desc'),
                features: [t('pricing.lakkhyo.feature1'), t('pricing.lakkhyo.feature2'), t('pricing.lakkhyo.feature3'), t('pricing.lakkhyo.feature4'), t('pricing.lakkhyo.feature5'), t('pricing.lakkhyo.feature6'), t('pricing.lakkhyo.feature7'), t('pricing.lakkhyo.feature8'), t('pricing.lakkhyo.feature9'), t('pricing.lakkhyo.feature10')],
                color: 'slate', highlight: false
            },
            {
                title: t('pricing.growth.title'), price: '10,000', originalPrice: '15,000', save: '5,000',
                desc: t('pricing.growth.desc'),
                features: [t('pricing.growth.feature1'), t('pricing.growth.feature2'), t('pricing.growth.feature3'), t('pricing.growth.feature4'), t('pricing.growth.feature5'), t('pricing.growth.feature6'), t('pricing.growth.feature7'), t('pricing.growth.feature8'), t('pricing.growth.feature9'), t('pricing.growth.feature10')],
                color: 'indigo', highlight: true
            },
            {
                title: t('pricing.empire.title'), price: '20,000', originalPrice: '30,000', save: '10,000',
                desc: t('pricing.empire.desc'),
                features: [t('pricing.empire.feature1'), t('pricing.empire.feature2'), t('pricing.empire.feature3'), t('pricing.empire.feature4'), t('pricing.empire.feature5'), t('pricing.empire.feature6'), t('pricing.empire.feature7'), t('pricing.empire.feature8'), t('pricing.empire.feature9'), t('pricing.empire.feature10')],
                color: 'sky', highlight: false
            }
        ],
        [t('pricing.plans.month_12')]: [
            {
                title: t('pricing.lakkhyo.title'), price: '11,100', originalPrice: '18,000', save: '6,900',
                desc: t('pricing.lakkhyo.desc'),
                features: [t('pricing.lakkhyo.feature1'), t('pricing.lakkhyo.feature2'), t('pricing.lakkhyo.feature3'), t('pricing.lakkhyo.feature4'), t('pricing.lakkhyo.feature5'), t('pricing.lakkhyo.feature6'), t('pricing.lakkhyo.feature7'), t('pricing.lakkhyo.feature8'), t('pricing.lakkhyo.feature9'), t('pricing.lakkhyo.feature10')],
                color: 'slate', highlight: false
            },
            {
                title: t('pricing.growth.title'), price: '18,500', originalPrice: '30,000', save: '11,500',
                desc: t('pricing.growth.desc'),
                features: [t('pricing.growth.feature1'), t('pricing.growth.feature2'), t('pricing.growth.feature3'), t('pricing.growth.feature4'), t('pricing.growth.feature5'), t('pricing.growth.feature6'), t('pricing.growth.feature7'), t('pricing.growth.feature8'), t('pricing.growth.feature9'), t('pricing.growth.feature10')],
                color: 'indigo', highlight: true
            },
            {
                title: t('pricing.empire.title'), price: '37,000', originalPrice: '60,000', save: '23,000',
                desc: t('pricing.empire.desc'),
                features: [t('pricing.empire.feature1'), t('pricing.empire.feature2'), t('pricing.empire.feature3'), t('pricing.empire.feature4'), t('pricing.empire.feature5'), t('pricing.empire.feature6'), t('pricing.empire.feature7'), t('pricing.empire.feature8'), t('pricing.empire.feature9'), t('pricing.empire.feature10')],
                color: 'sky', highlight: false
            }
        ]
    };

    const { i18n } = useTranslation();
    const formatNumber = (numStr) => {
        if (!numStr) return '';
        if (i18n.language === 'bn') {
            const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return numStr.toString().replace(/\d/g, d => bengaliDigits[d]);
        }
        return numStr;
    };

    const pricingData = pricingByDuration[selectedPlan] || pricingByDuration[plans[0]];

    return (
        <div className="min-h-full bg-transparent font-['Inter',_sans-serif]">
            {/* Main Content Area */}
            <div className="pb-32">
                {/* Plan Selector */}
                <div className="max-w-xl mx-auto mb-10 px-6">
                    <div className="bg-[#F1F5F9] p-1.5 rounded-[24px] flex justify-between relative shadow-inner">
                        {plans.map((p) => (
                            <button
                                key={p}
                                onClick={() => setSelectedPlan(p)}
                                className={`relative z-10 flex-1 py-4 text-sm font-bold rounded-2xl transition-all ${selectedPlan === p
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* New Year Banner */}
                <div className="max-w-7xl mx-auto px-6 mb-16">
                    <div className="relative bg-[#0F172A] rounded-[32px] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-indigo-500/20 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-transparent to-blue-900/50 pointer-events-none"></div>

                        {/* Festive Elements */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-widest">{t('pricing.new_year_offer')} {formatNumber('2026')}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                <span className="text-indigo-400">{formatNumber('26%')}</span> {t('pricing.offer_text')}
                            </h2>
                            <p className="text-slate-400 mt-4 text-lg font-medium">{t('pricing.offer_subtext')}</p>
                        </div>

                        {/* Countdown */}
                        <div className="flex gap-4 relative z-10">
                            {[
                                { label: 'days', value: timeLeft.days },
                                { label: 'hours', value: timeLeft.hours },
                                { label: 'mins', value: timeLeft.minutes },
                                { label: 'secs', value: timeLeft.seconds }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-black text-white border border-white/20">
                                        {formatNumber(String(item.value).padStart(2, '0'))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">{t(`pricing.${item.label}`)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10">
                            <button className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0F172A] font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform">
                                {t('pricing.get_now')}
                            </button>
                        </div>

                        {/* Floating Tag */}
                        <div className="absolute -top-4 -right-12 rotate-12 bg-rose-500 text-white px-10 py-4 font-black text-2xl shadow-lg border-b-4 border-rose-700">
                            {formatNumber('26%')} {t('pricing.save')}
                        </div>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingData.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -12 }}
                            className={`relative bg-white rounded-[40px] p-8 transition-all border-2 overflow-hidden ${plan.highlight
                                ? 'border-indigo-500 shadow-2xl shadow-indigo-100 z-10'
                                : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            {/* Card Background Gradient */}
                            {plan.highlight && (
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 to-blue-600 opacity-[0.85] -z-10"></div>
                            )}

                            <div className="text-center mb-10">
                                <div className={`inline-block px-8 py-2 rounded-full text-sm font-bold mb-8 ${plan.highlight
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                                    }`}>
                                    {plan.title}
                                </div>
                                <div className={`text-5xl font-black mb-4 flex justify-center items-start gap-1 ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                                    <span className="text-2xl mt-2 font-black">৳</span>{formatNumber(plan.price)}
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <span className={`text-lg font-bold line-through ${plan.highlight ? 'text-white/60' : 'text-slate-300'}`}>৳{formatNumber(plan.originalPrice)}</span>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-black ${plan.highlight ? 'bg-white text-indigo-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{t('pricing.save')} ৳{formatNumber(plan.save)}</span>
                                </div>
                                <p className={`mt-6 text-sm font-semibold px-4 leading-relaxed ${plan.highlight ? 'text-white/80' : 'text-slate-500'}`}>
                                    {plan.desc}
                                </p>
                            </div>

                            <div className={`space-y-4 mb-10 border-t pt-8 ${plan.highlight ? 'border-white/20' : 'border-slate-50'}`}>
                                {plan.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${plan.highlight
                                            ? 'bg-white/20'
                                            : 'bg-indigo-50'
                                            }`}>
                                            <Check size={14} className={plan.highlight ? 'text-white' : 'text-indigo-600'} />
                                        </div>
                                        <span className={`text-sm font-bold ${plan.highlight ? 'text-white' : 'text-slate-700'}`}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <button className={`font-bold flex items-center justify-center gap-2 mb-4 w-full group transition-colors ${plan.highlight ? 'text-white hover:text-white/80' : 'text-indigo-600 hover:text-indigo-700'}`}>
                                    {t('pricing.see_all_features')} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className={`w-full py-5 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 group ${plan.highlight
                                    ? 'bg-white text-indigo-600 shadow-xl'
                                    : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-slate-200'
                                    }`}>
                                    {t('pricing.free_trial')}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${plan.highlight ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                        <ArrowRight size={18} />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
