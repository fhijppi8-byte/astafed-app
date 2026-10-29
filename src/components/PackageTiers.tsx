import React from 'react';
import { ShieldCheck, Check, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PackageTier } from '../types';

interface PackageTiersProps {
  onSelectTier?: (tier: PackageTier) => void;
}

export const PackageTiers: React.FC<PackageTiersProps> = ({ onSelectTier }) => {
  const { packageTiers, currentUser, setActiveTab } = useApp();

  const handleChoose = (tier: PackageTier) => {
    if (onSelectTier) {
      onSelectTier(tier);
    } else {
      setActiveTab('deposit');
    }
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              باقات الإيداع وحدود الأرباح اليومية (Tiers & Caps)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            اختر الباقة المناسبة لك. توزع الأرباح بنسبة عادلة يومياً (من الاثنين إلى الجمعة) مع تطبيق سقف الربح اليومي.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl self-end sm:self-auto">
          6 مستويات استثمارية
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packageTiers.map((tier) => {
          const isUserCurrent = currentUser?.packageId === tier.id && currentUser.balance >= tier.minAmount;

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 border flex flex-col justify-between ${
                isUserCurrent
                  ? 'bg-gradient-to-b from-slate-900 to-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/40'
                  : tier.recommended
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5 hover:border-amber-400'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Badges */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {tier.name}
                </span>

                {isUserCurrent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Check className="w-3 h-3 text-emerald-400" />
                    باقتك الحالية
                  </span>
                ) : tier.recommended ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    الأكثر طلباً
                  </span>
                ) : null}
              </div>

              {/* Price & Cap */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">
                    ${tier.minAmount}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">قيمة الإيداع</span>
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">حد الربح اليومي الأقصى:</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      ${tier.dailyCap} / يوم
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60">
                    <span>الربح الشهري المتوقع (~22 يوم):</span>
                    <span className="font-mono text-slate-200">
                      حتى ${tier.dailyCap * 22}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Features */}
              <p className="text-xs text-slate-400 mb-5 leading-relaxed font-normal">
                {tier.description}
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleChoose(tier)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isUserCurrent
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : tier.recommended
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500'
                }`}
              >
                <span>{isUserCurrent ? 'ترقية / إضافة رصيد' : `اختيار باقة ${tier.minAmount}$`}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
