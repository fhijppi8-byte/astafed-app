import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Coins,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DailyRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRevealModal: React.FC<DailyRevealModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, dailyLog, packageTiers, revealDailyResult, setActiveTab } = useApp();
  const [revealState, setRevealState] = useState<'prompt' | 'revealing' | 'done'>('prompt');
  const [resultData, setResultData] = useState<{
    profitEarned: number;
    isProfit: boolean;
    message: string;
  } | null>(null);

  if (!isOpen || !currentUser) return null;

  const currentTier = packageTiers.find((p) => p.id === currentUser.packageId) || packageTiers[0];
  const isProfit = dailyLog.growthPercentage >= 0;
  const rawShare = Math.round(currentUser.balance * (Math.abs(dailyLog.growthPercentage) / 100) * 100) / 100;
  const cappedProfit = Math.min(rawShare, currentTier.dailyCap);

  const handleRevealClick = () => {
    setRevealState('revealing');
    setTimeout(() => {
      const res = revealDailyResult();
      setResultData({
        profitEarned: res.profitEarned,
        isProfit: res.isProfit,
        message: res.message,
      });
      setRevealState('done');
    }, 1200);
  };

  const handleModalClose = () => {
    setRevealState('prompt');
    setResultData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl text-right overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 mb-3">
            <Coins className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            كشف صفقات ونتائج اليوم (الساعة 12 ليلاً)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            جلسة تداول: <span className="font-semibold text-slate-200">{dailyLog.date}</span> | أسواق الذهب XAU/USD والفوركس
          </p>
        </div>

        {/* Content based on state */}
        {currentUser.hasRevealedToday && revealState !== 'done' ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">لقد قمت بكشف نتائج اليوم مسبقاً!</h3>
              <p className="text-xs text-slate-300 mt-1">
                تم تحويل أرباح اليوم بنجاح إلى صندوق أرباحك المتاحة للسحب. سيتم كشف نتائج الجلسة القادمة بنهاية تداولات الغد عند الساعة 12:00 ليلاً.
              </p>
            </div>

            {/* Today's Market performance recap */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>نمو المحفظة التجميعية اليوم:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm dir-ltr">
                  +{dailyLog.growthPercentage}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>سقف باقتك الحالي ({currentTier.name}):</span>
                <span className="font-mono font-bold text-amber-400">${currentTier.dailyCap}/يوم</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>صندوق أرباحك المتاحة الآن:</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">
                  ${currentUser.profitWallet.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
            >
              إغلاق النافذة
            </button>
          </div>
        ) : revealState === 'prompt' ? (
          <div className="space-y-5">
            {currentUser.balance <= 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">رأس مالك الحالي 0$</p>
                  <p className="text-slate-400 mt-1">
                    للحصول على حصتك من أرباح التداول اليومية، يرجى إيداع مبلغ واختيار إحدى الباقات الاستثمارية.
                  </p>
                  <button
                    onClick={() => {
                      handleModalClose();
                      setActiveTab('deposit');
                    }}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    الانتقال لصفحة الإيداع
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Summary box before reveal */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">رأس مالك المعتمد في الحساب:</span>
                    <span className="font-mono font-bold text-white">${currentUser.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">باقتك الحالية:</span>
                    <span className="font-semibold text-emerald-400">{currentTier.name} (حد أقصى ${currentTier.dailyCap}/يوم)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ملخص صفقات التداول اليوم:</span>
                    <span className="text-slate-200 text-right truncate max-w-[220px]">
                      {dailyLog.marketSummary}
                    </span>
                  </div>
                </div>

                {/* Big Action Reveal Button */}
                <button
                  onClick={handleRevealClick}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-xl shadow-emerald-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-amber-300" />
                  <span>اضغط هنا الآن لكشف نتائج اليوم</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  * وفقاً لنموذج الشفافية: الأرباح تضاف فوراً لصندوق السحب، والخسائر -إن حدثت- تخصم بنسبتها المئوية من رأس المال دون أي رسوم خفية.
                </p>
              </>
            )}
          </div>
        ) : revealState === 'revealing' ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <p className="text-sm font-bold text-slate-200">جاري مطابقة وتدقيق صفقات اليوم وتطبيق سقف الباقة...</p>
            <p className="text-xs text-slate-400">استفيد: حساب تجميعي موحد للذهب والفوركس</p>
          </div>
        ) : (
          /* Done state with result */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div
              className={`p-6 rounded-2xl text-center border ${
                resultData?.isProfit
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              {resultData?.isProfit ? (
                <>
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-white">جلسة تداول رابحة!</h3>
                  <div className="my-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                      +${resultData.profitEarned.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300">
                    تمت إضافة المبلغ إلى صندوق الأرباح المتاحة للسحب!
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400 mb-2">
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-white">تراجع في جلسة اليوم</h3>
                  <div className="my-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-rose-400 font-mono">
                      -${resultData?.profitEarned.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-rose-300">
                    تم خصم النسبة بشفافية من رأس المال وفق شروط السوق.
                  </p>
                </>
              )}
            </div>

            {/* Detailed Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>نسبة نمو السوق الإجمالية:</span>
                <span className={`font-mono font-bold ${dailyLog.growthPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dailyLog.growthPercentage >= 0 ? `+${dailyLog.growthPercentage}%` : `${dailyLog.growthPercentage}%`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>سقف الربح اليومي لباقتك:</span>
                <span className="font-mono text-amber-400">${currentTier.dailyCap}.00</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                <span>صندوق الأرباح الجديد:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${currentUser.profitWallet.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  handleModalClose();
                  setActiveTab('withdraw');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center"
              >
                طلب سحب الأرباح الآن
              </button>
              <button
                onClick={handleModalClose}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm transition-all"
              >
                تم
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
