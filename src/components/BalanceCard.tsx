import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyRevealModal } from './DailyRevealModal';

export const BalanceCard: React.FC = () => {
  const { currentUser, setActiveTab, dailyLog, packageTiers, isMarketOpen } = useApp();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // Countdown timer to midnight (12 AM)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next 00:00:00
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilMidnight('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      setTimeUntilMidnight(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  const currentTier = packageTiers.find((p) => p.id === currentUser.packageId) || packageTiers[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl p-5 sm:p-7 mb-8">
        {/* Ambient background glow */}
        <div className="absolute top-0 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top bar with Package badge & market schedule */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">
              حساب التداول التجميعي المشترك
            </span>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
              {currentTier.name} (حد ربح {currentTier.dailyCap}$/يوم)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>الأرباح: الاثنين - الجمعة (عطلة السبت والأحد)</span>
          </div>
        </div>

        {/* Balance Grid: Capital + Profit Wallet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Main Invested Capital (رأس المال الحالي) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                رأس المال الحالي المعتمد
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                نشط في السوق
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                ${currentUser.balance.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-400">USDT</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              المبلغ المستثمر في حساب التداول الموحد لتداول الذهب والفوركس
            </p>
          </div>

          {/* Profit Wallet (صندوق الأرباح المتاحة للسحب) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-950/80 to-slate-950/70 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                صندوق الأرباح المتاحة للسحب
              </span>
              <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-medium border border-amber-500/20">
                سحب فوري (أقل سحب 10$)
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                ${currentUser.profitWallet.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-500">USDT</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-300">
              أرباحك التراكمية الجاهزة للتحويل إلى محفظتك الشخصية في أي وقت
            </p>
          </div>
        </div>

        {/* Quick Actions Bar (خانة الإيداع وخانة السحب) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            <span>إيداع وتفعيل باقة</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 text-slate-100 font-bold text-sm shadow-md transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <ArrowUpFromLine className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-emerald-400" />
            <span>سحب الأرباح</span>
          </button>
        </div>

        {/* 12 AM PROFIT REVEAL BUTTON (زر كشف الأرباح والخسارة الساعة 12 ليلاً) */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">
                    كشف صفقات وأرباح اليوم (الساعة 12 ليلاً)
                  </h4>
                  {currentUser.hasRevealedToday && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      تم الكشف
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {currentUser.hasRevealedToday
                    ? 'تم تسجيل وكشف أرباحك لليوم بنجاح وإيداعها في الصندوق'
                    : 'اضغط لكشف نسبة أرباح صفقات الذهب والفوركس وإيداعها في صندوقك'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setShowRevealModal(true)}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentUser.hasRevealedToday
                    ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-emerald-500/20 animate-pulse'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentUser.hasRevealedToday ? 'عرض تفاصيل كشف اليوم' : 'كشف الأرباح والخسارة الآن'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <DailyRevealModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
      />
    </>
  );
};
